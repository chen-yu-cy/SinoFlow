import prisma from "@/lib/db/client";

/**
 * 订单服务层 (Order Service)
 * 对应 Spring Boot 中的 @Service
 * 负责核心业务逻辑与数据持久化 (DAO)
 */
export const OrderService = {
  /**
   * 撤销用户的课程访问权限
   * 逻辑：物理删除该用户下所有或指定课程的成功订单
   * 
   * @param email 用户邮箱
   * @param courseId 可选：特定课程 ID
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
      status: 'SUCCESS'
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
