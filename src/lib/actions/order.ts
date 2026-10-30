// FILE: src/lib/actions/order.ts
"use server";

import { auth } from "@/lib/auth";
import { OrderService } from "@/lib/services/order.service";
import { logger } from "@/lib/logger";

/**
 * 订单相关 Server Actions
 * 定位：连接用户界面与订单核心服务层的桥梁。
 */

/**
 * 发起购买请求 Action
 * 流程：校验身份 -> 创建订单 -> 返回 ID 供前端跳转支付
 */
export async function createOrder(courseId: string) {
  const session = await auth();

  // 1. 安全检查：必须登录后才能点击购买
  if (!session?.user?.id) {
    return { error: "请先登录后再进行购买" };
  }

  try {
    // 2. 调用服务层逻辑
    const order = await OrderService.createOrder(session.user.id, courseId);
    
    return { success: true, orderId: order.id };
  } catch (error: any) {
    // 3. 特殊业务逻辑错误处理（如已购买过）
    if (error.alreadyOwned) {
      return { error: error.message, alreadyOwned: true };
    }
    logger.error({ err: error, courseId, userId: session.user.id }, "Action Error (createOrder)");
    return { error: error.message || "创建订单失败，请稍后再试" };
  }
}

/**
 * 撤销用户课程授权 Action (管理员专用)
 * @param email 目标用户注册邮箱
 * @param courseId 目标课程 ID
 */
export async function revokeCourseAccess(email: string, courseId: string) {
  const session = await auth();

  // 安全检查：仅允许管理员角色操作
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { error: "未经授权" };
  }

  try {
    const deletedCount = await OrderService.revokeUserAccess(email, courseId);
    logger.info(
      { adminEmail: session.user.email, userEmail: email, courseId, deletedCount },
      "[Order Action] 管理员成功撤销了用户的课程访问权限"
    );
    return { success: true, deletedCount };
  } catch (error: any) {
    logger.error({ err: error, email, courseId }, "[Order Action] 撤销课程授权失败");
    return { error: error.message || "撤销访问权限失败，请稍后再试" };
  }
}

/**
 * 撤销特定订单授权 Action (管理员专用)
 * @param orderId 目标订单 ID
 */
export async function revokeOrderAction(orderId: string) {
  const session = await auth();

  // 安全检查：仅允许管理员角色操作
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { error: "未经授权" };
  }

  try {
    const order = await OrderService.getOrder(orderId);
    if (!order) {
      return { error: "订单不存在" };
    }

    await OrderService.deleteOrder(orderId);

    logger.info(
      { adminEmail: session.user.email, userEmail: order.user?.email, courseId: order.courseId, orderId },
      "[Order Action] 管理员通过订单记录成功撤销了用户的课程访问权限并删除订单"
    );

    return { success: true };
  } catch (error: any) {
    logger.error({ err: error, orderId }, "[Order Action] 撤销订单授权失败");
    return { error: error.message || "撤销订单失败，请稍后再试" };
  }
}


