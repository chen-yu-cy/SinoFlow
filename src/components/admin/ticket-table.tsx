// FILE: src/components/admin/ticket-table.tsx
"use client";

import React, { useState } from "react";
import { TicketStatus } from "@prisma/client";
import { Search, Calendar, User, Mail, LifeBuoy, AlertCircle, Info, RefreshCw } from "lucide-react";
import { updateTicketStatusAction } from "@/lib/actions/ticket";

export interface TicketWithDetails {
  id: string;
  userId: string;
  userEmail: string;
  title: string;
  content: string;
  status: TicketStatus;
  adminReply: string | null;
  repliedAt: string | null;
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
  } | null;
}

interface TicketTableProps {
  initialTickets: TicketWithDetails[];
}

export const TicketTable = ({ initialTickets }: TicketTableProps) => {
  const [tickets, setTickets] = useState<TicketWithDetails[]>(initialTickets);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketWithDetails | null>(null);
  const [replyText, setReplyText] = useState("");

  // 过滤逻辑
  const filteredTickets = tickets.filter((ticket) => {
    const userEmail = ticket.userEmail?.toLowerCase() || "";
    const userName = ticket.user?.name?.toLowerCase() || "";
    const title = ticket.title?.toLowerCase() || "";
    const content = ticket.content?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      userEmail.includes(query) ||
      userName.includes(query) ||
      title.includes(query) ||
      content.includes(query) ||
      ticket.id.toLowerCase().includes(query);

    const matchesStatus = statusFilter === "ALL" || ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // 选择工单时的辅助器
  const handleSelectTicket = (ticket: TicketWithDetails) => {
    setSelectedTicket(ticket);
    setReplyText(ticket.adminReply || "");
  };

  // 更新工单状态（保留历史回复）
  const handleStatusChange = async (ticketId: string, newStatus: TicketStatus) => {
    setUpdatingTicketId(ticketId);
    try {
      const res = await updateTicketStatusAction(ticketId, newStatus);
      if (res.error) {
        alert(res.error);
      } else {
        // 同步更新本地状态
        setTickets(tickets.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t)));
        // 如果当前选中查看的工单正是更新的，同步它
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket({ ...selectedTicket, status: newStatus });
        }
      }
    } catch (err) {
      alert("更新工单状态失败，请重试");
    } finally {
      setUpdatingTicketId(null);
    }
  };

  // 提交官方回复
  const handleSendReply = async () => {
    if (!selectedTicket) return;
    setUpdatingTicketId(selectedTicket.id);

    // 默认在回复时将工单变更为“已解决”状态（如果之前是待处理或处理中）
    const targetStatus = selectedTicket.status === "PENDING" || selectedTicket.status === "PROCESSING"
      ? "RESOLVED"
      : selectedTicket.status;

    try {
      const res = await updateTicketStatusAction(selectedTicket.id, targetStatus, replyText);
      if (res.error) {
        alert(res.error);
      } else {
        // 同步状态更新
        setTickets(tickets.map((t) => t.id === selectedTicket.id ? { ...t, status: targetStatus, adminReply: replyText } : t));
        setSelectedTicket({ ...selectedTicket, status: targetStatus, adminReply: replyText });
        alert("官方回复成功提交并发布！");
      }
    } catch (err) {
      alert("提交回复失败，请重试");
    } finally {
      setUpdatingTicketId(null);
    }
  };

  // 辅助：获取工单状态 Badge 样式
  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case "PENDING":
        return <span style={{ fontSize: "0.75rem", background: "#fff9db", color: "#f59f00", padding: "0.25rem 0.6rem", borderRadius: "20px", fontWeight: "600" }}>待处理</span>;
      case "PROCESSING":
        return <span style={{ fontSize: "0.75rem", background: "#e8f7ff", color: "#1c7ed6", padding: "0.25rem 0.6rem", borderRadius: "20px", fontWeight: "600" }}>处理中</span>;
      case "RESOLVED":
        return <span style={{ fontSize: "0.75rem", background: "#e6f4ea", color: "#28a745", padding: "0.25rem 0.6rem", borderRadius: "20px", fontWeight: "600" }}>已解决</span>;
      case "CLOSED":
        return <span style={{ fontSize: "0.75rem", background: "#f1f3f5", color: "#868e96", padding: "0.25rem 0.6rem", borderRadius: "20px", fontWeight: "600" }}>已关闭</span>;
      default:
        return <span style={{ fontSize: "0.75rem", background: "#f1f3f5", color: "#868e96", padding: "0.25rem 0.6rem", borderRadius: "20px", fontWeight: "600" }}>{status}</span>;
    }
  };

  return (
    <div>
      {/* 搜索与筛选工具栏 */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "260px", position: "relative" }}>
          <input
            type="text"
            placeholder="搜索邮箱、用户名、主题、内容或工单号..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem 1rem 0.75rem 2.5rem",
              borderRadius: "8px",
              border: "1px solid #dee2e6",
              fontSize: "0.9rem",
              outline: "none",
              transition: "border-color 0.2s"
            }}
          />
          <Search size={18} color="#adb5bd" style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }} />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            border: "1px solid #dee2e6",
            background: "#fff",
            fontSize: "0.9rem",
            outline: "none",
            cursor: "pointer"
          }}
        >
          <option value="ALL">全部状态</option>
          <option value="PENDING">待处理</option>
          <option value="PROCESSING">处理中</option>
          <option value="RESOLVED">已解决</option>
          <option value="CLOSED">已关闭</option>
        </select>
      </div>

      <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* 左侧列表 */}
        <div style={{
          flex: 1,
          minWidth: "400px",
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "var(--card-shadow)",
          overflow: "hidden"
        }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#f8f9fa", borderBottom: "1px solid #dee2e6" }}>
                  <th style={{ padding: "1rem 1.5rem", color: "#495057", fontWeight: "600" }}>工单</th>
                  <th style={{ padding: "1rem 1.5rem", color: "#495057", fontWeight: "600" }}>提交学员</th>
                  <th style={{ padding: "1rem 1.5rem", color: "#495057", fontWeight: "600" }}>工单状态</th>
                  <th style={{ padding: "1rem 1.5rem", color: "#495057", fontWeight: "600" }}>创建时间</th>
                  <th style={{ padding: "1rem 1.5rem", textAlign: "right", color: "#495057", fontWeight: "600" }}>快捷操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "3rem", color: "#868e96" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                        <AlertCircle size={32} color="#adb5bd" />
                        <span>暂无符合条件的工单记录</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      onClick={() => handleSelectTicket(ticket)}
                      style={{
                        borderBottom: "1px solid #f1f3f5",
                        cursor: "pointer",
                        background: selectedTicket?.id === ticket.id ? "#f8f9fa" : "transparent",
                        transition: "background 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        if (selectedTicket?.id !== ticket.id) {
                          e.currentTarget.style.background = "#fafbfc";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedTicket?.id !== ticket.id) {
                          e.currentTarget.style.background = "transparent";
                        }
                      }}
                    >
                      <td style={{ padding: "1.25rem 1.5rem" }}>
                        <div style={{ fontWeight: "600", fontSize: "0.9rem", color: "#212529" }}>{ticket.title}</div>
                        <div style={{ fontSize: "0.8rem", color: "#868e96", marginTop: "0.25rem", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", maxWidth: "250px" }}>
                          {ticket.content}
                        </div>
                      </td>
                      <td style={{ padding: "1.25rem 1.5rem" }}>
                        <div style={{ fontSize: "0.9rem", fontWeight: "500" }}>{ticket.user?.name || "匿名"}</div>
                        <div style={{ fontSize: "0.75rem", color: "#868e96", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <Mail size={10} /> {ticket.userEmail}
                        </div>
                      </td>
                      <td style={{ padding: "1.25rem 1.5rem" }}>{getStatusBadge(ticket.status)}</td>
                      <td style={{ padding: "1.25rem 1.5rem", color: "#868e96", fontSize: "0.8rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <Calendar size={12} />
                          {new Date(ticket.createdAt).toLocaleDateString("zh-CN")}
                        </div>
                      </td>
                      <td style={{ padding: "1.25rem 1.5rem", textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                        <select
                          value={ticket.status}
                          disabled={updatingTicketId === ticket.id}
                          onChange={(e) => handleStatusChange(ticket.id, e.target.value as TicketStatus)}
                          style={{
                            padding: "0.25rem 0.5rem",
                            borderRadius: "4px",
                            border: "1px solid #dee2e6",
                            fontSize: "0.8rem",
                            outline: "none",
                            cursor: "pointer"
                          }}
                        >
                          <option value="PENDING">待处理</option>
                          <option value="PROCESSING">处理中</option>
                          <option value="RESOLVED">已解决</option>
                          <option value="CLOSED">已关闭</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 右侧工单详情卡片 */}
        {selectedTicket && (
          <div style={{
            width: "380px",
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "var(--card-shadow)",
            padding: "1.5rem",
            position: "sticky",
            top: "90px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid #eee" }}>
              <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <LifeBuoy size={16} color="var(--primary)" /> 工单详情
              </h4>
              <button
                onClick={() => setSelectedTicket(null)}
                style={{ border: "none", background: "none", fontSize: "0.8rem", color: "#adb5bd", cursor: "pointer" }}
              >
                关闭
              </button>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.75rem", color: "#adb5bd" }}>工单编号</div>
              <div style={{ fontSize: "0.8rem", fontFamily: "monospace", color: "#495057" }}>{selectedTicket.id}</div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.75rem", color: "#adb5bd" }}>主题</div>
              <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#212529" }}>{selectedTicket.title}</div>
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{ fontSize: "0.75rem", color: "#adb5bd" }}>提交学员</div>
              <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "#495057", marginTop: "0.25rem" }}>
                {selectedTicket.user?.name || "未填写姓名"}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#868e96", display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.1rem" }}>
                <Mail size={12} /> {selectedTicket.userEmail}
              </div>
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{ fontSize: "0.75rem", color: "#adb5bd", marginBottom: "0.4rem" }}>详细问题描述</div>
              <div style={{
                fontSize: "0.85rem",
                color: "#212529",
                background: "#f8f9fa",
                padding: "0.75rem",
                borderRadius: "6px",
                whiteSpace: "pre-wrap",
                lineHeight: "1.6",
                maxHeight: "150px",
                overflowY: "auto",
                border: "1px solid #e9ecef"
              }}>
                {selectedTicket.content}
              </div>
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{ fontSize: "0.75rem", color: "#adb5bd", marginBottom: "0.5rem" }}>工单处理状态</div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value as TicketStatus)}
                  style={{
                    flex: 1,
                    padding: "0.5rem",
                    borderRadius: "6px",
                    border: "1px solid #dee2e6",
                    fontSize: "0.85rem",
                    outline: "none",
                    cursor: "pointer"
                  }}
                >
                  <option value="PENDING">待处理</option>
                  <option value="PROCESSING">处理中</option>
                  <option value="RESOLVED">已解决</option>
                  <option value="CLOSED">已关闭</option>
                </select>
                {updatingTicketId === selectedTicket.id && (
                  <RefreshCw size={16} className="animate-spin" color="#adb5bd" />
                )}
              </div>
            </div>

            <div style={{ borderTop: "1px solid #eee", paddingTop: "1rem" }}>
              <div style={{ fontSize: "0.75rem", color: "#adb5bd", marginBottom: "0.4rem" }}>管理员官方回复</div>
              <textarea
                placeholder="在此输入您的回复答复内容..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                disabled={updatingTicketId === selectedTicket.id}
                rows={4}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #dee2e6",
                  fontSize: "0.85rem",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit",
                  marginBottom: "0.75rem"
                }}
              />
              <button
                onClick={handleSendReply}
                disabled={updatingTicketId === selectedTicket.id || !replyText.trim()}
                className="btn-primary"
                style={{
                  width: "100%",
                  padding: "0.6rem",
                  fontSize: "0.85rem",
                  borderRadius: "6px"
                }}
              >
                {updatingTicketId === selectedTicket.id ? "正在提交..." : "发布回复并标记为已解决"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
