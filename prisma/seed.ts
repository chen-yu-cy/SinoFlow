import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // 清理旧数据
  await prisma.lesson.deleteMany({})
  await prisma.order.deleteMany({})
  await prisma.course.deleteMany({})

  // 创建课程：HSK 1
  const hsk1 = await prisma.course.create({
    data: {
      id: 'hsk1',
      title: 'HSK 1: 零基础汉语入门',
      description: '本课程专为完全没有汉语基础的学习者设计，涵盖拼音系统、基础词汇和核心语法点。',
      price: 199.00,
      lessons: {
        create: [
          { title: '你好与自我介绍', videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', order: 1 },
          { title: '数字与日期', videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', order: 2 }
        ]
      }
    }
  })

  // 创建课程：商务汉语
  await prisma.course.create({
    data: {
      id: 'business-chinese',
      title: '职场汉语：商务沟通技巧',
      description: '学习在专业工作环境中使用汉语，包括会议发言、邮件撰写和商务谈判常用表达。',
      price: 399.00,
      lessons: {
        create: [
          { title: '商务礼仪概论', videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', order: 1 }
        ]
      }
    }
  })

  console.log('数据库种子数据注入成功！')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
