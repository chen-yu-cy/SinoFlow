import prisma from "@/lib/db/client";
import { OrderStatus } from "@prisma/client";

/**
 * 订单服务层 (Order Service)
 * 职责：管理订单生命周期、支付确认及权限撤销
 */
export const OrderService = {
  /**
   * 创建一个新订单
   */
  async createOrder(userId: string, courseId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new Error("课程不存在");
    }

    // 检查是否已经购买过且支付成功
    const existingOrder = await prisma.order.findFirst({
      where: {
        userId: userId,
        courseId: courseId,
        status: OrderStatus.SUCCESS,
      },
    });

    if (existingOrder) {
      const error = new Error("您已购买过此课程") as any;
      error.alreadyOwned = true;
      throw error;
    }

    return await prisma.order.create({
      data: {
        userId: userId,
        courseId: courseId,
        amount: course.price,
        status: OrderStatus.PENDING,
      },
    });
  },

  /**
   * 完成订单支付
   */
  async completeOrder(orderId: string, paymentId?: string) {
    return await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.SUCCESS,
        paymentId: paymentId || `PAY_${Date.now()}`,
      },
    });
  },

  /**
   * 撤销用户的课程访问权限
   */
  async revokeUserAccess(email: string, courseId?: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error(`找不到用户: ${email}`);
    }

    const whereClause: any = {
      userId: user.id,
      status: OrderStatus.SUCCESS
    };

    if (courseId) {
      whereClause.courseId = courseId;
    }

    const result = await prisma.order.deleteMany({
      where: whereClause
    });

    return result.count;
  }
};
