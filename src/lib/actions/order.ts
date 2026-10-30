"use server";

import { auth } from "@/lib/auth";
import { OrderService } from "@/lib/services/order.service";

/**
 * Server Actions for Orders
 * 职责：用户身份校验、权限守卫、调用业务服务
 */

export async function createOrder(courseId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "请先登录后再进行购买" };
  }

  try {
    const order = await OrderService.createOrder(session.user.id, courseId);
    return { success: true, orderId: order.id };
  } catch (error: any) {
    if (error.alreadyOwned) {
      return { error: error.message, alreadyOwned: true };
    }
    console.error("Action Error (createOrder):", error);
    return { error: error.message || "创建订单失败，请稍后再试" };
  }
}
