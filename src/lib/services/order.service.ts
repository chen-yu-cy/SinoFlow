import prisma from "@/lib/db/client";
import { OrderStatus } from "@prisma/client";

/**
 * 订单服务层 (Order Service)
 * 职责：管理订单生命周期、支付确认及权限撤销逻辑。
 * 它是系统中最核心的安全和价值层。
 */
export const OrderService = {
  /**
   * 为用户发起一个新的课程订单
   * @param userId 学员的唯一 ID
   * @param courseId 目标课程 ID
   * @throws 当课程不存在或用户已拥有成功订单时抛出异常
   * @returns 返回新创建的 PENDING 状态订单
   */
  async createOrder(userId: string, courseId: string) {
    // 1. 确认课程有效性
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new Error("课程不存在");
    }

    // 2. 幂等性检查：防止用户重复购买已成功的课程
    const existingOrder = await prisma.order.findFirst({
      where: {
        userId: userId,
        courseId: courseId,
        status: OrderStatus.SUCCESS,
      },
    });

    if (existingOrder) {
      const error = new Error("您已购买过此课程") as any;
      error.alreadyOwned = true; // 附加属性供 Action 层识别
      throw error;
    }

    // 3. 创建初始状态为 PENDING 的订单记录
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
   * 标记订单为支付成功（履约环节）
   * @param orderId 系统内部订单号
   * @param paymentId 外部支付平台（微信/支付宝）生成的交易流水号
   * @returns 更新后的订单实体
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
   * 撤销用户的课程访问权限（主要用于退款或异常处理脚本）
   * @param email 学员注册邮箱
   * @param courseId 可选：指定撤销的课程；不传则撤销全部
   * @returns 成功删除的记录数
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
  },

  async getOrder(orderId: string) {
    return await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, course: true }
    });
  },

  async deleteOrder(orderId: string) {
    return await prisma.order.delete({
      where: { id: orderId }
    });
  }
};
