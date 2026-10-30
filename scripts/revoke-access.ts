/**
 * SinoFlow 权限撤销工具 (Access Revocation Utility)
 * 
 * 作用:
 * 该脚本用于管理员手动撤销用户对特定课程或所有课程的访问权限。
 * 它是通过从数据库中物理删除状态为 'SUCCESS' 的对应订单记录来实现的。
 * 
 * 使用场景:
 * 1. 处理用户退款。
 * 2. 开发者在测试环境下快速重置购买状态以进行反复测试。
 * 3. 紧急拦截违规账号的访问。
 * 
 * 使用方法:
 * 1. 撤销指定课程权限: npx tsx scripts/revoke-access.ts <user_email> <course_id>
 * 2. 撤销所有课程权限: npx tsx scripts/revoke-access.ts <user_email>
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * 执行权限撤销的核心逻辑
 * @param email 用户注册邮箱
 * @param courseId 课程 ID (可选，不传则撤销该用户的所有已购课程)
 */
async function revokeAccess(email: string, courseId?: string) {
  try {
    // 1. 首先在数据库中定位用户
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.log(`❌ 找不到邮箱为 ${email} 的用户。`)
      return
    }

    // 2. 构造查询条件：仅匹配该用户且支付成功的订单
    const whereClause: any = {
      userId: user.id,
      status: 'SUCCESS'
    }

    // 如果指定了课程 ID，则只精准打击该课程
    if (courseId) {
      whereClause.courseId = courseId
      console.log(`正在撤销用户 ${email} 对课程 ${courseId} 的权限...`)
    } else {
      console.log(`⚠️ 正在撤销用户 ${email} 对【所有课程】的权限...`)
    }

    // 3. 执行物理删除操作
    // 因为权限校验是基于 'exists SUCCESS order'，所以删除记录即代表剥夺权限
    const result = await prisma.order.deleteMany({
      where: whereClause
    })

    // 4. 反馈结果
    if (result.count > 0) {
      console.log(`✅ 成功撤销了 ${result.count} 项购买记录。`)
    } else {
      console.log(`ℹ️ 用户 ${email} 当前没有符合条件的已购课程记录。`)
    }

  } catch (error) {
    console.error('执行撤销脚本时发生错误:', error)
  }
}

/**
 * 命令行解析入口
 */
async function main() {
  const args = process.argv.slice(2)
  const email = args[0]
  const courseId = args[1]

  if (!email) {
    console.log("错误: 请提供用户邮箱。用法: npx tsx scripts/revoke-access.ts <email> [courseId]")
    process.exit(1)
  }

  await revokeAccess(email, courseId)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    // 确保脚本结束时断开数据库连接，防止进程挂起
    await prisma.$disconnect()
  })
