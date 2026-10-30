import { PrismaClient } from '@prisma/client'
import path from 'path'
import fs from 'fs/promises'
import ffmpeg from 'fluent-ffmpeg'

const prisma = new PrismaClient()

async function main() {
  console.log('开始同步现有课程的封面图...')

  const courses = await prisma.course.findMany({
    where: {
      OR: [
        { thumbnail: null },
        { thumbnail: '' }
      ]
    },
    include: {
      lessons: {
        orderBy: { order: 'asc' },
        take: 1
      }
    }
  })

  console.log(`发现 ${courses.length} 门课程缺少封面。`)

  for (const course of courses) {
    const firstLesson = course.lessons[0]
    if (!firstLesson) {
      console.log(`课程 《${course.title}》 没有章节，跳过。`)
      continue
    }

    // 检查是否为本地视频
    if (firstLesson.videoUrl.startsWith('/uploads/')) {
      const videoRelativePath = firstLesson.videoUrl
      const videoAbsolutePath = path.join(process.cwd(), 'public', videoRelativePath)
      
      const timestamp = Date.now()
      const thumbnailFileName = `${timestamp}-migrated-thumb.jpg`
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      const thumbnailUrl = `/uploads/${thumbnailFileName}`

      try {
        // 确保文件存在
        await fs.access(videoAbsolutePath)

        console.log(`正在为 《${course.title}》 提取封面...`)
        
        await new Promise((resolve, reject) => {
          ffmpeg(videoAbsolutePath)
            .screenshots({
              count: 1,
              timemarks: ['1'],
              filename: thumbnailFileName,
              folder: uploadDir,
              size: '640x?'
            })
            .on('end', resolve)
            .on('error', reject)
        })

        await prisma.course.update({
          where: { id: course.id },
          data: { thumbnail: thumbnailUrl }
        })

        console.log(`✅ 课程 《${course.title}》 封面已激活: ${thumbnailUrl}`)
      } catch (err) {
        console.error(`❌ 处理课程 《${course.title}》 失败:`, err)
      }
    } else {
      console.log(`课程 《${course.title}》 使用外部链接，无法自动提取，跳过。`)
    }
  }

  console.log('封面同步任务执行完毕。')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
