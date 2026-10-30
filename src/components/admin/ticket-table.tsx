// FILE: src/components/admin/ticket-table.tsx
"use client";

import React, { useState } from "react";
import { TicketStatus, Role } from "@prisma/client";
import { Search, Calendar, Mail, LifeBuoy, AlertCircle, RefreshCw, X, CheckCircle } from "lucide-react";
import { updateTicketStatusAction, addMessageAction } from "@/lib/actions/ticket";

export interface TicketMessageDetails {
  id: string;
  senderId: string;
  senderRole: Role;
  content: string;
  createdAt: string;
  sender: {
    name: string | null;
    email: string | null;
  } | null;
}

export interface TicketWithDetails {
  id: string;
  userId: string;
  userEmail: string;
  title: string;
  content: string;
  status: TicketStatus;
  createdAt: string;
  messages: TicketMessageDetails[];
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

  // 自定义通知与确认弹框状态
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // 触发 Toast 通知
  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

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

  // 选择工单
  const handleSelectTicket = (ticket: TicketWithDetails) => {
    setSelectedTicket(ticket);
    setReplyText("");
  };

  // 仅更新工单状态
  const handleStatusChange = async (ticketId: string, newStatus: TicketStatus) => {
    setUpdatingTicketId(ticketId);
    try {
      const res = await updateTicketStatusAction(ticketId, newStatus);
      if (res.error) {
        triggerToast(res.error, "error");
      } else {
        // 同步更新本地状态
        const updated = tickets.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t));
        setTickets(updated);
        
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket(updated.find((t) => t.id === ticketId) || null);
        }
        triggerToast("工单状态已成功更新！", "success");
      }
    } catch (err) {
      triggerToast("更新工单状态失败，请重试", "error");
    } finally {
      setUpdatingTicketId(null);
    }
  };

  // 提交官方留言回复（如果原本是“待处理”，自动变为“处理中”）
  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    setUpdatingTicketId(selectedTicket.id);

    const targetStatus = selectedTicket.status === "PENDING" ? TicketStatus.PROCESSING : undefined;

    try {
      const res = await addMessageAction(selectedTicket.id, replyText, targetStatus);
      if (res.error) {
        triggerToast(res.error, "error");
      } else if (res.success && res.message) {
        const newMsg: TicketMessageDetails = {
          id: res.message.id,
          senderId: res.message.senderId,
          senderRole: res.message.senderRole as Role,
          content: res.message.content,
          createdAt: res.message.createdAt,
          sender: res.message.sender,
        };

        // 更新状态并追加留言
        const updatedTickets = tickets.map((t) => {
          if (t.id === selectedTicket.id) {
            return {
              ...t,
              status: targetStatus || t.status,
              messages: [...t.messages, newMsg],
            };
          }
          return t;
        });

        setTickets(updatedTickets);
        setSelectedTicket(updatedTickets.find((t) => t.id === selectedTicket.id) || null);
        setReplyText("");
        triggerToast("回复留言已成功发送并同步！", "success");
      }
    } catch (err) {
      triggerToast("发送回复留言失败，请重试", "error");
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
        {/* 全宽工单列表 */}
        <div style={{
          flex: 1,
          width: "100%",
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "var(--card-shadow)",
          overflow: "hidden"
        }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#f8f9fa", borderBottom: "1px solid #dee2e6" }}>
                  <th style={{ padding: "1rem 1.5rem", color: "#495057", fontWeight: "600" }}>工单主题</th>
                  <th style={{ padding: "1rem 1.5rem", color: "#495057", fontWeight: "600" }}>提交学员</th>
                  <th style={{ padding: "1rem 1.5rem", color: "#495057", fontWeight: "600" }}>工单状态</th>
                  <th style={{ padding: "1rem 1.5rem", color: "#495057", fontWeight: "600" }}>创建时间</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "3rem", color: "#868e96" }}>
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
                        <div style={{ fontSize: "0.8rem", color: "#868e96", marginTop: "0.25rem", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", maxWidth: "400px" }}>
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 弹出式工单会话详情弹窗 (Popup Modal) */}
        {selectedTicket && (
          <div 
            onClick={() => setSelectedTicket(null)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(5px)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 999,
              padding: "1rem"
            }}
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: "600px",
                background: "#fff",
                borderRadius: "16px",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
                padding: "2rem",
                maxHeight: "90vh",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                position: "relative"
              }}
            >
              {/* 弹窗头部 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid #eee" }}>
                <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <LifeBuoy size={20} color="var(--primary)" /> 工单会话详情
                </h4>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                  {/* 标记为已解决按钮 */}
                  {(selectedTicket.status === "PENDING" || selectedTicket.status === "PROCESSING") && (
                    <button
                      onClick={() => {
                        setConfirmModal({
                          title: "标记解决",
                          message: "确定要将此工单标记为已解决吗？",
                          onConfirm: () => handleStatusChange(selectedTicket.id, "RESOLVED")
                        });
                      }}
                      disabled={updatingTicketId === selectedTicket.id}
                      style={{
                        border: "1px solid #28a745",
                        background: "#fff",
                        fontSize: "0.75rem",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        color: "#28a745",
                        cursor: "pointer",
                        fontWeight: "500"
                      }}
                    >
                      解决工单
                    </button>
                  )}

                  {/* 关闭工单按钮 */}
                  {selectedTicket.status !== "CLOSED" && (
                    <button
                      onClick={() => {
                        setConfirmModal({
                          title: "关闭工单",
                          message: "确定要关闭此工单吗？关闭后学员将无法继续追加追问留言。",
                          onConfirm: () => handleStatusChange(selectedTicket.id, "CLOSED")
                        });
                      }}
                      disabled={updatingTicketId === selectedTicket.id}
                      style={{
                        border: "1px solid #dee2e6",
                        background: "#fff",
                        fontSize: "0.75rem",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        color: "#e03131",
                        cursor: "pointer"
                      }}
                    >
                      关闭工单
                    </button>
                  )}

                  {/* 重新开启按钮 */}
                  {(selectedTicket.status === "RESOLVED" || selectedTicket.status === "CLOSED") && (
                    <button
                      onClick={() => {
                        setConfirmModal({
                          title: "重新开启工单",
                          message: "确定要重新开启此工单进行处理吗？",
                          onConfirm: () => handleStatusChange(selectedTicket.id, "PROCESSING")
                        });
                      }}
                      disabled={updatingTicketId === selectedTicket.id}
                      style={{
                        border: "1px solid #dee2e6",
                        background: "#fff",
                        fontSize: "0.75rem",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        color: "#1c7ed6",
                        cursor: "pointer"
                      }}
                    >
                      重新开启
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedTicket(null)}
                    style={{ border: "none", background: "none", padding: "0.25rem", cursor: "pointer", display: "flex", alignItems: "center", color: "#adb5bd" }}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* 编号与状态 */}
              <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                <div>
                  <span style={{ color: "#adb5bd" }}>工单编号: </span>
                  <span style={{ fontFamily: "monospace", color: "#495057", fontWeight: "600" }}>{selectedTicket.id}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  {updatingTicketId === selectedTicket.id && (
                    <RefreshCw size={12} className="animate-spin" color="#adb5bd" />
                  )}
                  {getStatusBadge(selectedTicket.status)}
                </div>
              </div>

              {/* 主题 */}
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.75rem", color: "#adb5bd" }}>工单主题</div>
                <div style={{ fontSize: "1rem", fontWeight: "700", color: "#212529", marginTop: "0.15rem" }}>{selectedTicket.title}</div>
              </div>

              {/* 提交人 */}
              <div style={{ marginBottom: "1.25rem", fontSize: "0.85rem", color: "#495057" }}>
                <span style={{ color: "#adb5bd" }}>提交学员: </span>
                <strong>{selectedTicket.user?.name || "未填写姓名"}</strong> ({selectedTicket.userEmail})
              </div>

              {/* 对话历史时间线 (弹窗里给予更宽的高度以获得更顺畅的阅读体验) */}
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ fontSize: "0.75rem", color: "#adb5bd", marginBottom: "0.5rem" }}>历史沟通记录</div>
                <div style={{
                  maxHeight: "350px",
                  overflowY: "auto",
                  border: "1px solid #e9ecef",
                  borderRadius: "10px",
                  padding: "1rem",
                  background: "#fafbfc",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem"
                }}>
                  {selectedTicket.messages.map((msg) => {
                    const isMessageFromAdmin = msg.senderRole === Role.ADMIN;
                    return (
                      <div 
                        key={msg.id} 
                        style={{
                          alignSelf: isMessageFromAdmin ? "flex-end" : "flex-start",
                          maxWidth: "85%",
                          background: isMessageFromAdmin ? "rgba(200, 16, 46, 0.05)" : "#fff",
                          border: isMessageFromAdmin ? "1px solid rgba(200, 16, 46, 0.1)" : "1px solid #e9ecef",
                          padding: "0.6rem 0.9rem",
                          borderRadius: "8px",
                          fontSize: "0.85rem",
                          lineHeight: "1.6",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "1.5rem", fontSize: "0.7rem", color: "#adb5bd", marginBottom: "0.3rem" }}>
                          <span style={{ fontWeight: "700", color: isMessageFromAdmin ? "var(--primary)" : "#6c757d" }}>
                            {isMessageFromAdmin ? "官方客服" : (msg.sender?.name || "学员")}
                          </span>
                          <span>{new Date(msg.createdAt).toLocaleDateString("zh-CN") + " " + new Date(msg.createdAt).toLocaleTimeString("zh-CN", { hour12: false })}</span>
                        </div>
                        <div style={{ whiteSpace: "pre-wrap", color: "#212529" }}>{msg.content}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 回复发送区 */}
              {selectedTicket.status !== "CLOSED" ? (
                <div style={{ borderTop: "1px solid #eee", paddingTop: "1.25rem" }}>
                  <div style={{ fontSize: "0.75rem", color: "#adb5bd", marginBottom: "0.5rem" }}>追加留言回复</div>
                  <textarea
                    placeholder="在此输入您回复解答学员的留言..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    disabled={updatingTicketId === selectedTicket.id}
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #dee2e6",
                      fontSize: "0.9rem",
                      outline: "none",
                      resize: "none",
                      fontFamily: "inherit",
                      marginBottom: "1rem",
                      transition: "border-color 0.2s"
                    }}
                  />
                  
                  <button
                    onClick={handleSendReply}
                    disabled={updatingTicketId === selectedTicket.id || !replyText.trim()}
                    className="btn-primary"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      fontSize: "0.9rem",
                      borderRadius: "8px",
                      fontWeight: "600"
                    }}
                  >
                    {updatingTicketId === selectedTicket.id ? "正在提交..." : "发布回复留言"}
                  </button>
                </div>
              ) : (
                <div style={{ borderTop: "1px solid #eee", paddingTop: "1.25rem", textAlign: "center", fontSize: "0.85rem", color: "#868e96" }}>
                  🔒 该工单已被官方标记为“已关闭”，无法进行回复。如需继续回复，请点击右上角“重新开启”工单。
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 漂亮的高级 Toast 提示 */}
      {toast && (
        <div style={{
          position: "fixed",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          background: toast.type === "success" ? "#e6f4ea" : "#fff5f5",
          border: `1px solid ${toast.type === "success" ? "#51cf66" : "#ff8787"}`,
          color: toast.type === "success" ? "#2b8a3e" : "#c92a2a",
          padding: "0.85rem 1.75rem",
          borderRadius: "8px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          fontSize: "0.9rem",
          fontWeight: "600",
          pointerEvents: "none"
        }}>
          {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 高级自定义确认弹窗 (Confirm Modal) */}
      {confirmModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(4px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 10000,
          padding: "1rem"
        }}>
          <div style={{
            background: "#fff",
            borderRadius: "14px",
            boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
            padding: "2rem",
            width: "100%",
            maxWidth: "380px",
            textAlign: "center"
          }}>
            <h4 style={{ margin: "0 0 0.75rem 0", fontSize: "1.1rem", fontWeight: "700", color: "#212529" }}>
              {confirmModal.title}
            </h4>
            <p style={{ margin: "0 0 1.75rem 0", fontSize: "0.88rem", color: "#495057", lineHeight: "1.5" }}>
              {confirmModal.message}
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button
                onClick={() => setConfirmModal(null)}
                style={{
                  border: "1px solid #dee2e6",
                  background: "#fff",
                  color: "#495057",
                  padding: "0.6rem 1.25rem",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  fontWeight: "600",
                  flex: 1
                }}
              >
                取消
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                className="btn-primary"
                style={{
                  padding: "0.6rem 1.25rem",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  flex: 1
                }}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
