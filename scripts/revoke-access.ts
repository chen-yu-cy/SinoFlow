/**
 * SinoFlow 权限撤销工具 (Access Revocation Utility)
 * 
 * 作用:
 * 该脚本用于管理员手动撤销用户对特定课程或所有课程的访问权限。
 * 它是通过调用 OrderService 实现的，作为命令行入口使用。
 * 
 * 使用方法:
 * 1. 撤销指定课程权限: npx tsx scripts/revoke-access.ts <user_email> <course_id>
 * 2. 撤销所有课程权限: npx tsx scripts/revoke-access.ts <user_email>
 */

import { OrderService } from "../src/lib/services/order.service";
import prisma from "../src/lib/db/client";

async function main() {
  const args = process.argv.slice(2);
  const email = args[0];
  const courseId = args[1];

  if (!email) {
    console.error("错误: 请提供用户邮箱。用法: npx tsx scripts/revoke-access.ts <email> [courseId]");
    process.exit(1);
  }

  try {
    if (courseId) {
      console.log(`正在撤销用户 ${email} 对课程 ${courseId} 的权限...`);
    } else {
      console.log(`⚠️ 正在撤销用户 ${email} 对【所有课程】的权限...`);
    }

    const count = await OrderService.revokeUserAccess(email, courseId);

    if (count > 0) {
      console.log(`✅ 成功撤销了 ${count} 项购买记录。`);
    } else {
      console.log(`ℹ️ 用户 ${email} 当前没有符合条件的已购课程记录。`);
    }
  } catch (error: any) {
    console.error(`❌ 执行失败: ${error.message}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
