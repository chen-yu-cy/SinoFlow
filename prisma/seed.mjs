// FILE: prisma/seed.mjs
import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const isReset = process.argv.includes('--reset') || process.env.SEED_RESET === 'true'

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@sinoflow.cn'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin1234'
  const adminName = process.env.ADMIN_NAME || 'Administrator'
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  if (isReset) {
    console.log('⚠️ [Seed Reset] 正在清空所有课程、课时、资料与订单数据...')
    await prisma.resource.deleteMany({})
    await prisma.lesson.deleteMany({})
    await prisma.order.deleteMany({})
    await prisma.course.deleteMany({})

    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        password: hashedPassword,
        role: Role.ADMIN,
        name: adminName
      },
      create: {
        email: adminEmail,
        password: hashedPassword,
        role: Role.ADMIN,
        name: adminName
      }
    })
    console.log(`✅ [Seed Reset] 管理员账号已重置: ${adminEmail} / ${adminPassword}`)
  } else {
    // 幂等模式：仅在管理员不存在时创建，不覆盖已修改的密码
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (!existingAdmin) {
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          role: Role.ADMIN,
          name: adminName
        }
      })
      console.log(`✅ [Seed] 首次启动，已创建初始管理员账号: ${adminEmail}`)
    } else {
      console.log(`ℹ️ [Seed] 管理员账号 (${adminEmail}) 已存在，跳过创建`)
    }
  }

  // 检查是否需要注入初始演示课程
  const courseCount = await prisma.course.count()
  if (!isReset && courseCount > 0) {
    console.log(`ℹ️ [Seed] 数据库已存在 ${courseCount} 门课程，跳过演示课程注入（如需强制清空重置请运行 npm run db:reset）`)
    return
  }

  // 创建课程：HSK 1
  await prisma.course.create({
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
      },
      resources: {
        create: [
          { title: 'HSK 1 核心词汇表及拼音指南.pdf', fileUrl: '/uploads/resources/hsk1-vocabulary.pdf', fileSize: '120 KB' }
        ]
      }
    }
  })

  // 创建课程：商务汉语
  await prisma.course.create({
    data: {
      id: 'business-chinese',
      title: '职场汉语：商务沟通技巧',
      description: '学习在专业工作环境中使用汉语，包括会议发言、邮件撰写和商务谈判常用表达 Morse。',
      price: 399.00,
      lessons: {
        create: [
          { title: '商务礼仪概论', videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', order: 1 }
        ]
      },
      resources: {
        create: [
          { title: '商务常用口语与职场沟通手册.pdf', fileUrl: '/uploads/resources/business-chinese-phrases.pdf', fileSize: '180 KB' }
        ]
      }
    }
  })

  console.log(`✅ [Seed] 演示课程数据注入完成！管理员账号: ${adminEmail}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
