// FILE: src/lib/actions/ticket.ts
"use server";

import { auth } from "@/lib/auth";
import { TicketService } from "@/lib/services/ticket.service";
import { TicketStatus, Role } from "@prisma/client";
import { logger } from "@/lib/logger";

/**
 * 用户提交工单 Action
 * 校验登录状态后创建工单及初始留言
 */
export async function submitTicketAction(title: string, content: string) {
  const session = await auth();

  if (!session?.user?.id || !session?.user?.email) {
    return { error: "请先登录后再提交工单" };
  }

  try {
    const ticket = await TicketService.createTicket(
      session.user.id,
      session.user.email,
      title,
      content
    );

    logger.info(
      { userId: session.user.id, ticketId: ticket.id },
      "[Ticket Action] 学员成功提交了一条支持工单"
    );

    return { success: true, ticketId: ticket.id };
  } catch (error: any) {
    logger.error({ err: error, userId: session.user.id }, "Action Error (submitTicketAction)");
    return { error: error.message || "提交工单失败，请稍后再试" };
  }
}

/**
 * 追加留言回复 Action (学员/管理员通用)
 */
export async function addMessageAction(
  ticketId: string,
  content: string,
  targetStatus?: TicketStatus
) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "请先登录后再回复留言" };
  }

  const senderRole = (session.user as any).role === "ADMIN" ? Role.ADMIN : Role.USER;

  try {
    const message = await TicketService.addTicketMessage(
      ticketId,
      session.user.id,
      senderRole,
      content,
      targetStatus
    );

    logger.info(
      { ticketId, senderId: session.user.id, senderRole },
      `[Ticket Action] 新增了一条工单留言`
    );

    return {
      success: true,
      message: {
        id: message.id,
        senderId: message.senderId,
        senderRole: message.senderRole,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
        sender: message.sender
          ? {
              name: message.sender.name,
              email: message.sender.email,
            }
          : null,
      },
    };
  } catch (error: any) {
    logger.error({ err: error, ticketId }, "Action Error (addMessageAction)");
    return { error: error.message || "留言失败，请稍后再试" };
  }
}

/**
 * 仅管理员更新工单状态 Action
 */
export async function updateTicketStatusAction(ticketId: string, status: TicketStatus) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { error: "未经授权" };
  }

  try {
    const updated = await TicketService.updateTicketStatus(ticketId, status);
    
    logger.info(
      { adminEmail: session.user.email, ticketId, newStatus: status },
      "[Ticket Action] 管理员更新了工单状态"
    );

    return { success: true, status: updated.status };
  } catch (error: any) {
    logger.error({ err: error, ticketId }, "Action Error (updateTicketStatusAction)");
    return { error: error.message || "更新状态失败，请稍后再试" };
  }
}

/**
 * 学员查询自身提交的所有工单及留言记录
 */
export async function getUserTicketsAction() {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "请先登录后再查询工单" };
  }

  try {
    const tickets = await TicketService.getUserTickets(session.user.id);
    
    // 序列化
    const serialized = tickets.map((t) => ({
      id: t.id,
      title: t.title,
      content: t.content,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
      messages: t.messages.map((m) => ({
        id: m.id,
        senderId: m.senderId,
        senderRole: m.senderRole,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
        sender: m.sender
          ? {
              name: m.sender.name,
              email: m.sender.email,
            }
          : null,
      })),
    }));

    return { success: true, tickets: serialized };
  } catch (error: any) {
    logger.error({ err: error, userId: session?.user?.id }, "Action Error (getUserTicketsAction)");
    return { error: "获取工单记录失败，请稍后再试" };
  }
}
