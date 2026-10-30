// FILE: src/lib/actions/ticket.ts
"use server";

import { auth } from "@/lib/auth";
import { TicketService } from "@/lib/services/ticket.service";
import { TicketStatus } from "@prisma/client";
import { logger } from "@/lib/logger";

/**
 * 用户提交工单 Action
 * 校验登录状态后创建工单
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
 * 管理员更新工单状态及回复 Action
 */
export async function updateTicketStatusAction(ticketId: string, status: TicketStatus, adminReply?: string) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { error: "未经授权" };
  }

  try {
    const updated = await TicketService.updateTicketStatus(ticketId, status, adminReply);
    
    logger.info(
      { adminEmail: session.user.email, ticketId, newStatus: status, hasReply: !!adminReply },
      "[Ticket Action] 管理员更新了工单状态及回复"
    );

    return { success: true, status: updated.status, adminReply: updated.adminReply };
  } catch (error: any) {
    logger.error({ err: error, ticketId }, "Action Error (updateTicketStatusAction)");
    return { error: error.message || "更新状态及回复失败，请稍后再试" };
  }
}

/**
 * 学员查询自身提交的所有工单
 */
export async function getUserTicketsAction() {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "请先登录后再查询工单" };
  }

  try {
    const tickets = await TicketService.getUserTickets(session.user.id);
    // 格式化时间
    const serialized = tickets.map((t) => ({
      id: t.id,
      title: t.title,
      content: t.content,
      status: t.status,
      adminReply: t.adminReply,
      repliedAt: t.repliedAt ? t.repliedAt.toISOString() : null,
      createdAt: t.createdAt.toISOString(),
    }));

    return { success: true, tickets: serialized };
  } catch (error: any) {
    logger.error({ err: error, userId: session?.user?.id }, "Action Error (getUserTicketsAction)");
    return { error: "获取工单记录失败，请稍后再试" };
  }
}
