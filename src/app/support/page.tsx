// FILE: src/app/support/page.tsx
import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TicketService } from "@/lib/services/ticket.service";
import { SupportPortal } from "@/components/support-portal";

const SupportPage = async () => {
  const session = await auth();

  // 限制登录用户才能发起工单
  if (!session?.user || !session.user.id) {
    redirect("/login?callbackUrl=/support");
  }

  // 服务端拉取学员个人的历史工单
  const tickets = await TicketService.getUserTickets(session.user.id);

  // 序列化
  const serializedTickets = tickets.map((t) => ({
    id: t.id,
    title: t.title,
    content: t.content,
    status: t.status,
    adminReply: t.adminReply,
    repliedAt: t.repliedAt ? t.repliedAt.toISOString() : null,
    createdAt: t.createdAt.toISOString(),
  }));

  return (
    <div className="container" style={{ maxWidth: "800px", padding: "3rem 1rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <span style={{
          fontSize: "0.8rem",
          background: "var(--primary-light)",
          color: "var(--primary)",
          padding: "0.25rem 0.75rem",
          borderRadius: "20px",
          fontWeight: "600",
          letterSpacing: "0.05em"
        }}>
          HELP & SUPPORT
        </span>
        <h2 style={{ fontSize: "2rem", fontWeight: "800", marginTop: "0.75rem", marginBottom: "0.5rem" }}>
          联系客户服务与工单中心
        </h2>
        <p style={{ color: "var(--secondary)", fontSize: "0.95rem", margin: "0 auto", maxWidth: "600px" }}>
          遇到任何学习问题、系统故障或退款需求？请在下方提交工单，您可以实时查询工单处理状态及官方的文字回复。
        </p>
      </div>

      <SupportPortal userEmail={session.user.email || ""} initialTickets={serializedTickets} />
    </div>
  );
};

export default SupportPage;
