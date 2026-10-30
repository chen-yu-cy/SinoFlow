// FILE: src/components/support-portal.tsx
"use client";

import React, { useState } from "react";
import { TicketStatus } from "@prisma/client";
import { submitTicketAction } from "@/lib/actions/ticket";
import { Send, CheckCircle, Loader2, AlertCircle, Calendar, MessageSquare, ClipboardList, HelpCircle } from "lucide-react";

export interface StudentTicket {
  id: string;
  title: string;
  content: string;
  status: TicketStatus;
  adminReply: string | null;
  repliedAt: string | null;
  createdAt: string;
}

interface SupportPortalProps {
  userEmail: string;
  initialTickets: StudentTicket[];
}

export const SupportPortal = ({ userEmail, initialTickets }: SupportPortalProps) => {
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");
  const [tickets, setTickets] = useState<StudentTicket[]>(initialTickets);

  // 表单状态
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("请填写完整的主题和问题内容");
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
          adminReply: null,
          repliedAt: null,
          createdAt: new Date().toISOString()
        };

        setTickets([newTicket, ...tickets]);
        setSubmitSuccess(true);
        setTitle("");
        setContent("");
      }
    } catch (err) {
      setError("网络错误，提交工单失败");
    } finally {
      setLoading(false);
    }
  };

  // 选中工单详情
  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);

  // 状态 Badge 渲染
  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case "PENDING":
        return <span style={{ fontSize: "0.75rem", background: "#fff9db", color: "#f59f00", padding: "0.2rem 0.5rem", borderRadius: "10px", fontWeight: "600" }}>待处理</span>;
      case "PROCESSING":
        return <span style={{ fontSize: "0.75rem", background: "#e8f7ff", color: "#1c7ed6", padding: "0.2rem 0.5rem", borderRadius: "10px", fontWeight: "600" }}>处理中</span>;
      case "RESOLVED":
        return <span style={{ fontSize: "0.75rem", background: "#e6f4ea", color: "#28a745", padding: "0.2rem 0.5rem", borderRadius: "10px", fontWeight: "600" }}>已解决</span>;
      case "CLOSED":
        return <span style={{ fontSize: "0.75rem", background: "#f1f3f5", color: "#868e96", padding: "0.2rem 0.5rem", borderRadius: "10px", fontWeight: "600" }}>已关闭</span>;
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
          <HelpCircle size={18} /> 提交新工单
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
          <ClipboardList size={18} /> 我的历史工单
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
              <h3 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "0.5rem" }}>工单提交成功</h3>
              <p style={{ color: "var(--secondary)", fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "2rem" }}>
                工单已成功在系统建立并向官方邮箱发送了通知。我们的客服人员将尽快处理，处理结果将实时更新在“我的历史工单”中，您可以前往查询。
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
                  继续提交工单
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className="btn-primary"
                  style={{ flex: 1, padding: "0.75rem", borderRadius: "6px" }}
                >
                  前往查看记录
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
                  登录的账号邮箱
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
                  工单主题
                </label>
                <input
                  type="text"
                  placeholder="请输入工单的核心问题，例如：如何下载配套讲义..."
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
                  详细描述您的问题
                </label>
                <textarea
                  placeholder="请详细说明您遇到的情况，有相关错误提示可复制在此处，方便技术人员为您精准排查..."
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
                    <span>正在创建工单并通知邮箱...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>提交工单</span>
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
              <h4 style={{ margin: "0 0 0.5rem 0", color: "#495057" }}>暂无历史工单记录</h4>
              <p style={{ margin: 0, color: "#868e96", fontSize: "0.9rem" }}>如果您遇到了任何学习或使用问题，可以随时在“提交新工单”选项卡中联系支持人员。</p>
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
                    onClick={() => setSelectedTicketId(isSelected ? null : ticket.id)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                      <div>
                        <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.05rem", fontWeight: "700" }}>{ticket.title}</h4>
                        <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem", color: "#868e96" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <Calendar size={12} />
                            {new Date(ticket.createdAt).toLocaleDateString("zh-CN")}
                          </span>
                          <span>工单号: {ticket.id}</span>
                        </div>
                      </div>
                      <div>{getStatusBadge(ticket.status)}</div>
                    </div>

                    {/* 折叠展开的工单详细描述与回复 */}
                    {isSelected && (
                      <div style={{
                        marginTop: "1.25rem",
                        paddingTop: "1.25rem",
                        borderTop: "1px solid #f1f3f5",
                        cursor: "default"
                      }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ marginBottom: "1.5rem" }}>
                          <div style={{ fontSize: "0.75rem", color: "#adb5bd", marginBottom: "0.25rem" }}>工单问题描述</div>
                          <p style={{
                            margin: 0,
                            fontSize: "0.9rem",
                            color: "#495057",
                            background: "#fafbfc",
                            padding: "0.75rem 1rem",
                            borderRadius: "6px",
                            lineHeight: "1.6",
                            whiteSpace: "pre-wrap",
                            border: "1px solid #f1f3f5"
                          }}>
                            {ticket.content}
                          </p>
                        </div>

                        {/* 管理员答复展示 */}
                        <div>
                          <div style={{ fontSize: "0.75rem", color: "#adb5bd", marginBottom: "0.5rem" }}>官方回复答复</div>
                          {ticket.adminReply ? (
                            <div style={{
                              background: "rgba(200, 16, 46, 0.02)",
                              border: "1px solid rgba(200, 16, 46, 0.08)",
                              borderRadius: "8px",
                              padding: "1rem",
                              position: "relative"
                            }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                <div style={{
                                  width: "24px",
                                  height: "24px",
                                  borderRadius: "50%",
                                  background: "var(--primary)",
                                  color: "#fff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "0.7rem",
                                  fontWeight: "700"
                                }}>
                                  官
                                </div>
                                <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--primary)" }}>SinoFlow 官方客服答复</span>
                                {ticket.repliedAt && (
                                  <span style={{ fontSize: "0.75rem", color: "#adb5bd", marginLeft: "auto" }}>
                                    {new Date(ticket.repliedAt).toLocaleDateString("zh-CN")}
                                  </span>
                                )}
                              </div>
                              <p style={{
                                margin: 0,
                                fontSize: "0.9rem",
                                color: "#212529",
                                lineHeight: "1.6",
                                whiteSpace: "pre-wrap"
                              }}>
                                {ticket.adminReply}
                              </p>
                            </div>
                          ) : (
                            <div style={{
                              background: "#f8f9fa",
                              border: "1px dashed #dee2e6",
                              borderRadius: "8px",
                              padding: "1.25rem",
                              textAlign: "center",
                              color: "#868e96",
                              fontSize: "0.85rem",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.5rem"
                            }}>
                              <MessageSquare size={16} />
                              <span>🕒 正在为您安排客服跟进，请耐心等待官方答复...</span>
                            </div>
                          )}
                        </div>
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
