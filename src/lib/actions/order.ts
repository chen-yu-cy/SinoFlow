"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db/client";
import { OrderStatus } from "@prisma/client";

export async function createOrder(courseId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "请先登录后再进行购买" };
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    return { error: "课程不存在" };
  }

  // 检查是否已经购买过且支付成功
  const existingOrder = await prisma.order.findFirst({
    where: {
      userId: session.user.id,
      courseId: courseId,
      status: OrderStatus.SUCCESS,
    },
  });

  if (existingOrder) {
    return { error: "您已购买过此课程", alreadyOwned: true };
  }

  try {
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        courseId: courseId,
        amount: course.price,
        status: OrderStatus.PENDING,
      },
    });

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("创建订单失败:", error);
    return { error: "创建订单失败，请稍后再试" };
  }
}
