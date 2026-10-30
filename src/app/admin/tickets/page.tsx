// FILE: src/app/admin/tickets/page.tsx
import React from "react";
import prisma from "@/lib/db/client";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TicketTable, type TicketWithDetails } from "@/components/admin/ticket-table";

const AdminTicketsPage = async () => {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  // 查询所有工单，包含关联的用户信息
  const tickets = await prisma.supportTicket.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  // 序列化以传递给客户端组件
  const serializedTickets: TicketWithDetails[] = tickets.map((ticket) => ({
    id: ticket.id,
    userId: ticket.userId,
    userEmail: ticket.userEmail,
    title: ticket.title,
    content: ticket.content,
    status: ticket.status,
    adminReply: ticket.adminReply,
    repliedAt: ticket.repliedAt ? ticket.repliedAt.toISOString() : null,
    createdAt: ticket.createdAt.toISOString(),
    user: ticket.user ? {
      name: ticket.user.name,
      email: ticket.user.email,
    } : null,
  }));

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.5rem", fontWeight: "700", margin: "0 0 0.5rem 0" }}>工单管理</h3>
        <p style={{ color: "#6c757d", fontSize: "0.9rem", margin: 0 }}>
          查看并处理学员提交的服务工单。点击列表行查看详情、更新工单状态。
        </p>
      </div>

      <TicketTable initialTickets={serializedTickets} />
    </div>
  );
};

export default AdminTicketsPage;
