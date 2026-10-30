// FILE: src/lib/services/ticket.service.ts
import prisma from "@/lib/db/client";
import { TicketStatus, Role } from "@prisma/client";
import { EmailService } from "./email.service";

/**
 * 工单服务层 (Support Ticket Service)
 * 职责：处理工单数据库 CRUD 操作与多轮留言回复机制。
 */
export const TicketService = {
  /**
   * 创建新工单（同时自动创建首条消息作为问题主体描述）并触发邮件通知
   */
  async createTicket(userId: string, userEmail: string, title: string, content: string) {
    if (!title.trim() || !content.trim()) {
      throw new Error("工单标题和内容不能为空");
    }

    // 1. 在事务/关联中创建工单及其首条消息
    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        userEmail,
        title,
        content,
        status: TicketStatus.PENDING,
        messages: {
          create: {
            senderId: userId,
            senderRole: Role.USER,
            content: content,
          },
        },
      },
      include: {
        messages: true,
      },
    });

    // 2. 发送邮件通知至官方邮箱（模拟发送）
    try {
      await EmailService.sendSupportEmail(title, content, userEmail);
    } catch (err) {
      console.error("[Ticket Service] 邮件发送通知失败:", err);
    }

    return ticket;
  },

  /**
   * 获取所有工单及完整的对话历史（供管理员面板查阅）
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
        messages: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            sender: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  /**
   * 获取某特定学员的所有工单记录（含对话历史）
   */
  async getUserTickets(userId: string) {
    return await prisma.supportTicket.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            sender: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  /**
   * 向指定工单追加一条留言消息（支持更新工单状态）
   */
  async addTicketMessage(
    ticketId: string,
    senderId: string,
    senderRole: Role,
    content: string,
    targetStatus?: TicketStatus
  ) {
    if (!content.trim()) {
      throw new Error("留言回复内容不能为空");
    }

    // 1. 确认工单存在
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId }
    });
    if (!ticket) {
      throw new Error("找不到目标工单");
    }

    // 2. 追加消息记录
    const message = await prisma.supportTicketMessage.create({
      data: {
        ticketId,
        senderId,
        senderRole,
        content,
      },
      include: {
        sender: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // 3. 更新工单状态（如果提供）
    if (targetStatus) {
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: targetStatus },
      });
    }

    // 4. 模拟发送通知邮件
    try {
      await EmailService.sendSupportEmail(
        `工单 [${ticket.title}] 追加了新留言`,
        content,
        "system@sinoflow.com"
      );
    } catch (err) {
      console.error("[Ticket Service] 邮件通知失败:", err);
    }

    return message;
  },

  /**
   * 仅更新工单状态
   */
  async updateTicketStatus(ticketId: string, status: TicketStatus) {
    return await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status },
    });
  },

  /**
   * 获取单条工单详情（含完整消息序列）
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
        messages: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            sender: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  },

  /**
   * 删除工单
   */
  async deleteTicket(ticketId: string) {
    return await prisma.supportTicket.delete({
      where: { id: ticketId },
    });
  }
};
