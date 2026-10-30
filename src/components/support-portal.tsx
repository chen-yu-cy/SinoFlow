// FILE: src/components/support-portal.tsx
"use client";

import React, { useState } from "react";
import { TicketStatus, Role } from "@prisma/client";
import { submitTicketAction, addMessageAction } from "@/lib/actions/ticket";
import { Send, CheckCircle, Loader2, AlertCircle, Calendar, MessageSquare, ClipboardList, Upload } from "lucide-react";

export interface StudentTicketMessage {
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

export interface StudentTicket {
  id: string;
  title: string;
  content: string;
  status: TicketStatus;
  createdAt: string;
  messages: StudentTicketMessage[];
}

const defaultTranslations = {
  tabNew: "提交新工单",
  tabHistory: "历史工单",
  labelEmail: "登录的账号邮箱",
  labelTitle: "工单主题",
  labelContent: "详细描述您的问题",
  placeholderTitle: "请输入工单的核心问题，例如：如何下载配套讲义...",
  placeholderContent: "请详细说明您遇到的情况，有相关错误提示可复制在此处，方便技术人员为您精准排查...",
  btnSubmit: "提交工单",
  btnSubmitting: "正在创建工单并通知邮箱...",
  errRequired: "请填写完整的主题和问题内容",
  errNetwork: "网络错误，提交工单失败",
  successTitle: "工单提交成功",
  successDesc: "工单已成功在系统建立并向官方邮箱发送了通知。我们的客服人员将尽快处理，处理结果将实时更新在“历史工单”中，您可以前往查询并与我们多轮交流。",
  btnSubmitMore: "继续提交工单",
  btnViewHistory: "前往查看记录",
  historyEmpty: "暂无历史工单记录",
  historyEmptyDesc: "如果您遇到了任何学习或使用问题，可以随时在“提交新工单”选项卡中联系支持人员。",
  ticketNo: "工单号: {id}",
  createdAt: "创建日期",
  labelHistoryTimeline: "工单沟通记录",
  senderMe: "我",
  senderStaff: "官方客服",
  followupLabel: "追加问题留言 (追问)",
  followupPlaceholder: "如果问题未解决，请在此处打字继续向客服提问...",
  btnFollowup: "发送",
  closedLockNotice: "🔒 该工单已被官方标记为“已关闭”，无法继续追问留言。",
  statusPending: "待处理",
  statusProcessing: "处理中",
  statusResolved: "已解决",
  statusClosed: "已关闭",
};

interface SupportPortalProps {
  userEmail: string;
  initialTickets: StudentTicket[];
  translations?: Partial<typeof defaultTranslations>;
}

export const SupportPortal = ({ userEmail, initialTickets, translations }: SupportPortalProps) => {
  const t = { ...defaultTranslations, ...translations };
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");
  const [tickets, setTickets] = useState<StudentTicket[]>(initialTickets);

  // 表单状态
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // 选中的历史工单及追问留言状态
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [followUpText, setFollowUpText] = useState("");
  const [sendingFollowUp, setSendingFollowUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError(t.errRequired);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await submitTicketAction(title, content);
      if (res.error) {
        setError(res.error);
      } else if (res.success && res.ticketId) {
        // 创建本地临时工单，并同步到历史列表中
        const newTicket: StudentTicket = {
          id: res.ticketId,
          title,
          content,
          status: "PENDING",
          createdAt: new Date().toISOString(),
          messages: [
            {
              id: "temp-first-msg",
              senderId: "current-user",
              senderRole: Role.USER,
              content: content,
              createdAt: new Date().toISOString(),
              sender: {
                name: t.senderMe,
                email: userEmail,
              },
            },
          ],
        };

        setTickets([newTicket, ...tickets]);
        setSubmitSuccess(true);
        setTitle("");
        setContent("");
      }
    } catch (err) {
      setError(t.errNetwork);
    } finally {
      setLoading(false);
    }
  };

  // 学员发送追问留言
  const handleSendFollowUp = async (ticketId: string) => {
    if (!followUpText.trim()) return;
    setSendingFollowUp(true);

    try {
      // 学员追加留言，默认将工单重新标记为 PENDING（待处理），提醒管理员
      const res = await addMessageAction(ticketId, followUpText, "PENDING");
      if (res.error) {
        alert(res.error);
      } else if (res.success && res.message) {
        const newMsg: StudentTicketMessage = {
          id: res.message.id,
          senderId: res.message.senderId,
          senderRole: res.message.senderRole as Role,
          content: res.message.content,
          createdAt: res.message.createdAt,
          sender: res.message.sender,
        };

        // 更新本地 tickets 状态
        setTickets(
          tickets.map((t) => {
            if (t.id === ticketId) {
              return {
                ...t,
                status: "PENDING" as TicketStatus,
                messages: [...t.messages, newMsg],
              };
            }
            return t;
          })
        );

        setFollowUpText("");
      }
    } catch (err) {
      alert("发送追问失败，请重试");
    } finally {
      setSendingFollowUp(false);
    }
  };

  // 状态 Badge 渲染
  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case "PENDING":
        return <span style={{ fontSize: "0.75rem", background: "#fff9db", color: "#f59f00", padding: "0.2rem 0.5rem", borderRadius: "10px", fontWeight: "600" }}>{t.statusPending}</span>;
      case "PROCESSING":
        return <span style={{ fontSize: "0.75rem", background: "#e8f7ff", color: "#1c7ed6", padding: "0.2rem 0.5rem", borderRadius: "10px", fontWeight: "600" }}>{t.statusProcessing}</span>;
      case "RESOLVED":
        return <span style={{ fontSize: "0.75rem", background: "#e6f4ea", color: "#28a745", padding: "0.2rem 0.5rem", borderRadius: "10px", fontWeight: "600" }}>{t.statusResolved}</span>;
      case "CLOSED":
        return <span style={{ fontSize: "0.75rem", background: "#f1f3f5", color: "#868e96", padding: "0.2rem 0.5rem", borderRadius: "10px", fontWeight: "600" }}>{t.statusClosed}</span>;
      default:
        return <span style={{ fontSize: "0.75rem", background: "#f1f3f5", color: "#868e96", padding: "0.2rem 0.5rem", borderRadius: "10px", fontWeight: "600" }}>{status}</span>;
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      {/* 选项卡头部 */}
      <div style={{
        display: "flex",
        borderBottom: "1px solid var(--border-color)",
        marginBottom: "2rem",
        gap: "1.5rem"
      }}>
        <button
          onClick={() => {
            setActiveTab("new");
            setSubmitSuccess(false);
          }}
          style={{
            background: "none",
            border: "none",
            borderBottom: activeTab === "new" ? "2px solid var(--primary)" : "2px solid transparent",
            padding: "0.75rem 0.5rem",
            fontSize: "1rem",
            fontWeight: activeTab === "new" ? "700" : "500",
            color: activeTab === "new" ? "var(--primary)" : "var(--secondary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            transition: "all 0.2s"
          }}
        >
          <Upload size={18} /> {t.tabNew}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          style={{
            background: "none",
            border: "none",
            borderBottom: activeTab === "history" ? "2px solid var(--primary)" : "2px solid transparent",
            padding: "0.75rem 0.5rem",
            fontSize: "1rem",
            fontWeight: activeTab === "history" ? "700" : "500",
            color: activeTab === "history" ? "var(--primary)" : "var(--secondary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            transition: "all 0.2s"
          }}
        >
          <ClipboardList size={18} /> {t.tabHistory}
          {tickets.length > 0 && (
            <span style={{
              fontSize: "0.75rem",
              background: "rgba(200, 16, 46, 0.1)",
              color: "var(--primary)",
              padding: "0.1rem 0.4rem",
              borderRadius: "10px",
              fontWeight: "700"
            }}>
              {tickets.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: 提交表单 */}
      {activeTab === "new" && (
        <div>
          {submitSuccess ? (
            <div style={{
              background: "#fff",
              border: "1px solid var(--border-color)",
              borderRadius: "12px",
              boxShadow: "var(--card-shadow)",
              padding: "3rem 2rem",
              textAlign: "center"
            }}>
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "#e6f4ea",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem auto"
              }}>
                <CheckCircle size={32} color="#28a745" />
              </div>
              <h3 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "0.5rem" }}>{t.successTitle}</h3>
              <p style={{ color: "var(--secondary)", fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "2rem" }}>
                {t.successDesc}
              </p>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  onClick={() => setSubmitSuccess(false)}
                  style={{
                    flex: 1,
                    background: "none",
                    border: "1px solid var(--border-color)",
                    padding: "0.75rem",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600"
                  }}
                >
                  {t.btnSubmitMore}
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className="btn-primary"
                  style={{ flex: 1, padding: "0.75rem", borderRadius: "6px" }}
                >
                  {t.btnViewHistory}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{
              background: "#fff",
              border: "1px solid var(--border-color)",
              borderRadius: "12px",
              boxShadow: "var(--card-shadow)",
              padding: "2rem"
            }}>
              {error && (
                <div style={{
                  background: "#fff0f0",
                  color: "#fa5252",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1.5rem",
                  fontSize: "0.85rem"
                }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#495057", marginBottom: "0.5rem" }}>
                  {t.labelEmail}
                </label>
                <input
                  type="text"
                  value={userEmail}
                  disabled
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "6px",
                    border: "1px solid #dee2e6",
                    background: "#f1f3f5",
                    color: "#6c757d",
                    fontSize: "0.9rem",
                    cursor: "not-allowed"
                  }}
                />
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#495057", marginBottom: "0.5rem" }}>
                  {t.labelTitle}
                </label>
                <input
                  type="text"
                  placeholder={t.placeholderTitle}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "6px",
                    border: "1px solid #dee2e6",
                    fontSize: "0.9rem",
                    outline: "none",
                    transition: "border-color 0.2s"
                  }}
                />
              </div>

              <div style={{ marginBottom: "2rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#495057", marginBottom: "0.5rem" }}>
                  {t.labelContent}
                </label>
                <textarea
                  placeholder={t.placeholderContent}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  disabled={loading}
                  rows={6}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "6px",
                    border: "1px solid #dee2e6",
                    fontSize: "0.9rem",
                    outline: "none",
                    resize: "vertical",
                    fontFamily: "inherit"
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  width: "100%",
                  padding: "0.8rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  borderRadius: "6px"
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>{t.btnSubmitting}</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>{t.btnSubmit}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Tab 2: 历史记录与回复跟踪 */}
      {activeTab === "history" && (
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", flexDirection: "column" }}>
          {tickets.length === 0 ? (
            <div style={{
              background: "#fff",
              border: "1px solid var(--border-color)",
              borderRadius: "12px",
              boxShadow: "var(--card-shadow)",
              padding: "4rem 2rem",
              textAlign: "center",
              width: "100%"
            }}>
              <ClipboardList size={40} color="#adb5bd" style={{ marginBottom: "1rem" }} />
              <h4 style={{ margin: "0 0 0.5rem 0", color: "#495057" }}>{t.historyEmpty}</h4>
              <p style={{ margin: 0, color: "#868e96", fontSize: "0.9rem" }}>{t.historyEmptyDesc}</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem", width: "100%" }}>
              {tickets.map((ticket) => {
                const isSelected = selectedTicketId === ticket.id;
                return (
                  <div
                    key={ticket.id}
                    style={{
                      background: "#fff",
                      border: "1px solid var(--border-color)",
                      borderRadius: "12px",
                      boxShadow: "var(--card-shadow)",
                      padding: "1.5rem",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      borderColor: isSelected ? "var(--primary)" : "var(--border-color)"
                    }}
                    onClick={() => {
                      setSelectedTicketId(isSelected ? null : ticket.id);
                      setFollowUpText("");
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                      <div>
                        <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.05rem", fontWeight: "700" }}>{ticket.title}</h4>
                        <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem", color: "#868e96" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <Calendar size={12} />
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                          <span>{t.ticketNo.replace("{id}", ticket.id)}</span>
                        </div>
                      </div>
                      <div>{getStatusBadge(ticket.status)}</div>
                    </div>

                    {/* 折叠展开的工单详细沟通记录与追问 */}
                    {isSelected && (
                      <div style={{
                        marginTop: "1.25rem",
                        paddingTop: "1.25rem",
                        borderTop: "1px solid #f1f3f5",
                        cursor: "default"
                      }} onClick={(e) => e.stopPropagation()}>
                        
                        <div style={{ marginBottom: "1.25rem" }}>
                          <div style={{ fontSize: "0.75rem", color: "#adb5bd", marginBottom: "0.5rem" }}>{t.labelHistoryTimeline}</div>
                          
                          <div style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.75rem",
                            background: "#fafbfc",
                            border: "1px solid #e9ecef",
                            borderRadius: "8px",
                            padding: "0.75rem",
                            maxHeight: "300px",
                            overflowY: "auto",
                            marginBottom: "1rem"
                          }}>
                            {ticket.messages.map((msg) => {
                              const isMe = msg.senderRole === Role.USER;
                              return (
                                <div
                                  key={msg.id}
                                  style={{
                                    alignSelf: isMe ? "flex-end" : "flex-start",
                                    maxWidth: "85%",
                                    background: isMe ? "var(--primary-light)" : "#fff",
                                    border: isMe ? "1px solid rgba(200,16,46,0.1)" : "1px solid #e9ecef",
                                    padding: "0.5rem 0.75rem",
                                    borderRadius: "8px",
                                    fontSize: "0.85rem",
                                    lineHeight: "1.5",
                                    boxShadow: "0 1px 2px rgba(0,0,0,0.01)"
                                  }}
                                >
                                  <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: "1.5rem",
                                    fontSize: "0.7rem",
                                    color: "#adb5bd",
                                    marginBottom: "0.25rem"
                                  }}>
                                    <span style={{ fontWeight: "700", color: isMe ? "var(--primary)" : "#6c757d" }}>
                                      {isMe ? t.senderMe : t.senderStaff}
                                    </span>
                                    <span>{new Date(msg.createdAt).toLocaleString()}</span>
                                  </div>
                                  <div style={{ whiteSpace: "pre-wrap", color: "#212529" }}>{msg.content}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* 学员追问输入框 */}
                        {ticket.status !== "CLOSED" ? (
                          <div style={{ borderTop: "1px solid #eee", paddingTop: "1rem" }}>
                            <div style={{ fontSize: "0.75rem", color: "#adb5bd", marginBottom: "0.4rem" }}>{t.followupLabel}</div>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <textarea
                                placeholder={t.followupPlaceholder}
                                value={followUpText}
                                onChange={(e) => setFollowUpText(e.target.value)}
                                disabled={sendingFollowUp}
                                rows={2}
                                style={{
                                  flex: 1,
                                  padding: "0.5rem 0.75rem",
                                  borderRadius: "6px",
                                  border: "1px solid #dee2e6",
                                  fontSize: "0.85rem",
                                  outline: "none",
                                  resize: "none",
                                  fontFamily: "inherit"
                                }}
                              />
                              <button
                                onClick={() => handleSendFollowUp(ticket.id)}
                                disabled={sendingFollowUp || !followUpText.trim()}
                                className="btn-primary"
                                style={{
                                  padding: "0 1rem",
                                  borderRadius: "6px",
                                  fontSize: "0.85rem",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: "0.25rem",
                                  whiteSpace: "nowrap"
                                }}
                              >
                                {sendingFollowUp ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <>
                                    <Send size={14} />
                                    <span>{t.btnFollowup}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{
                            textAlign: "center",
                            fontSize: "0.8rem",
                            color: "#868e96",
                            padding: "0.5rem",
                            background: "#f1f3f5",
                            borderRadius: "6px"
                          }}>
                            {t.closedLockNotice}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
