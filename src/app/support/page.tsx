// FILE: src/app/support/page.tsx
import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TicketService } from "@/lib/services/ticket.service";
import { SupportPortal } from "@/components/support-portal";

import { getTranslation } from "@/lib/i18n";

const SupportPage = async () => {
  const session = await auth();

  // 限制登录用户才能发起工单
  if (!session?.user || !session.user.id) {
    redirect("/login?callbackUrl=/support");
  }

  const { t, dict } = await getTranslation();
  const supportTranslations = (dict as any).support || {};

  // 服务端拉取学员个人的历史工单
  const tickets = await TicketService.getUserTickets(session.user.id);

  // 序列化
  const serializedTickets = tickets.map((t) => ({
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
      sender: m.sender ? {
        name: m.sender.name,
        email: m.sender.email,
      } : null,
    })),
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
          {t("support.pageTitle")}
        </h2>
        <p style={{ color: "var(--secondary)", fontSize: "0.95rem", margin: "0 auto", maxWidth: "600px" }}>
          {t("support.pageSubtitle")}
        </p>
      </div>

      <SupportPortal 
        userEmail={session.user.email || ""} 
        initialTickets={serializedTickets} 
        translations={supportTranslations}
      />
    </div>
  );
};

export default SupportPage;
