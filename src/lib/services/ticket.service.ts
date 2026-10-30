// FILE: src/lib/services/ticket.service.ts
import prisma from "@/lib/db/client";
import { TicketStatus } from "@prisma/client";
import { EmailService } from "./email.service";

/**
 * 工单服务层 (Support Ticket Service)
 * 职责：处理工单数据库 CRUD 操作与核心业务流程。
 */
export const TicketService = {
  /**
   * 创建新工单并触发邮件通知
   */
  async createTicket(userId: string, userEmail: string, title: string, content: string) {
    if (!title.trim() || !content.trim()) {
      throw new Error("工单标题和内容不能为空");
    }

    // 1. 创建数据库记录
    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        userEmail,
        title,
        content,
        status: TicketStatus.PENDING,
      },
    });

    // 2. 发送邮件通知至官方邮箱（异步/无阻塞或等待）
    try {
      await EmailService.sendSupportEmail(title, content, userEmail);
    } catch (err) {
      // 邮件发送失败不应当阻断数据库工单的成功创建
      console.error("[Ticket Service] 邮件发送通知失败:", err);
    }

    return ticket;
  },

  /**
   * 获取所有工单（供管理员面板查阅）
   */
  async getTickets() {
    return await prisma.supportTicket.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  /**
   * 获取某特定学员的所有工单记录
   */
  async getUserTickets(userId: string) {
    return await prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
  },

  /**
   * 更新工单状态（支持选填管理员回复内容）
   */
  async updateTicketStatus(ticketId: string, status: TicketStatus, adminReply?: string) {
    const updateData: any = { status };
    if (adminReply !== undefined) {
      updateData.adminReply = adminReply;
      updateData.repliedAt = new Date();
    }

    return await prisma.supportTicket.update({
      where: { id: ticketId },
      data: updateData,
    });
  },

  /**
   * 获取单条工单详情
   */
  async getTicket(ticketId: string) {
    return await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  },

  /**
   * 删除/清理工单
   */
  async deleteTicket(ticketId: string) {
    return await prisma.supportTicket.delete({
      where: { id: ticketId },
    });
  }
};
