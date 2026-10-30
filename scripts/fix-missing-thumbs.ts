import { PrismaClient } from '@prisma/client'
import path from 'path'
import fs from 'fs/promises'
import { exec } from 'child_process'
import { promisify } from 'util'

/**
 * 存量视频封面修复脚本
 * 
 * 作用:
 * 扫描数据库中所有本地存储的视频，并使用 FFmpeg 重新提取封面图。
 * 适用于在自动提取逻辑上线前就已经存在的视频。
 */

const execPromise = promisify(exec)
const prisma = new PrismaClient()

async function main() {
  console.log('--- 开始深度修复存量视频封面 ---')

  const courses = await prisma.course.findMany({
    include: {
      lessons: { orderBy: { order: 'asc' } }
    }
  })

  for (const course of courses) {
    const targetLesson = course.lessons[0] // 使用第一章作为封面来源
    
    if (targetLesson && targetLesson.videoUrl.startsWith('/uploads/')) {
      const videoRelativePath = targetLesson.videoUrl
      const videoAbsolutePath = path.join(process.cwd(), 'public', videoRelativePath)
      
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      const thumbnailFileName = `${course.id}-auto-fixed.jpg`
      const thumbnailPath = path.join(uploadDir, thumbnailFileName)
      const thumbnailUrl = `/uploads/${thumbnailFileName}`

      try {
        await fs.access(videoAbsolutePath)
        
        const cmd = `ffmpeg -y -i "${videoAbsolutePath}" -ss 00:00:01 -vframes 1 -q:v 2 "${thumbnailPath}"`
        console.log(`正在处理课程 《${course.title}》...`)
        
        await execPromise(cmd)
        
        await prisma.course.update({
          where: { id: course.id },
          data: { thumbnail: thumbnailUrl }
        })
        console.log(`✅ 封面已修复: ${thumbnailUrl}`)
      } catch (err) {
        console.log(`⚠️ 跳过课程 《${course.title}》: 视频文件可能不存在或已损坏`)
      }
    }
  }

  console.log('--- 修复任务完成 ---')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
