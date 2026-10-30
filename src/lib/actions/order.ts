"use server";

import { auth } from "@/lib/auth";
import { OrderService } from "@/lib/services/order.service";

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
    console.error("Action Error (createOrder):", error);
    return { error: error.message || "创建订单失败，请稍后再试" };
  }
}
