// FILE: src/components/admin/user-table.tsx
"use client";

import React, { useState } from "react";
import { User, Shield, Crown, Mail, BookOpen, Trash2, LogIn, X, Loader2 } from "lucide-react";
import { impersonateUser } from "@/lib/actions/auth";
import { revokeCourseAccess } from "@/lib/actions/order";
import { signIn } from "next-auth/react";

export interface UserWithOrders {
  id: string;
  name: string | null;
  email: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: string | Date;
  orders: Array<{
    id: string;
    courseId: string;
    course: {
      id: string;
      title: string;
      price: number;
    };
  }>;
}

interface UserTableProps {
  initialUsers: UserWithOrders[];
  currentUserId: string;
}

export const UserTable = ({ initialUsers, currentUserId }: UserTableProps) => {
  const [users, setUsers] = useState<UserWithOrders[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState<UserWithOrders | null>(null);
  const [impersonatingEmail, setImpersonatingEmail] = useState<string | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // 排序：ADMIN 始终排在最上面，其次按注册时间降序排序
  const sortedUsers = [...users].sort((a, b) => {
    if (a.role === 'ADMIN' && b.role !== 'ADMIN') return -1;
    if (a.role !== 'ADMIN' && b.role === 'ADMIN') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // 模拟登录 (Impersonation)
  const handleImpersonate = async (email: string) => {
    if (!confirm(`确定要以该用户 (${email}) 身份登录吗？您将临时切换身份并返回首页。`)) {
      return;
    }
    
    setImpersonatingEmail(email);
    try {
      const res = await impersonateUser(email);
      if (res.error) {
        alert(res.error);
        setImpersonatingEmail(null);
        return;
      }

      if (res.success && res.token) {
        // 调用 NextAuth 客户端 signIn，完成无缝跳转
        await signIn("credentials", {
          email,
          token: res.token,
          callbackUrl: "/",
          redirect: true,
        });
      }
    } catch (err) {
      alert("模拟登录失败，系统异常");
      setImpersonatingEmail(null);
    }
  };

  // 撤销课程权限 (Revoke Access)
  const handleRevokeCourse = async (userEmail: string, courseId: string) => {
    setDeletingCourseId(courseId);
    try {
      const res = await revokeCourseAccess(userEmail, courseId);
      if (res.error) {
        alert(res.error);
      } else if (res.success) {
        // 更新本地 State 以同步 UI 变化
        const updatedUsers = users.map((u) => {
          if (u.email === userEmail) {
            return {
              ...u,
              orders: u.orders.filter((o) => o.courseId !== courseId),
            };
          }
          return u;
        });

        setUsers(updatedUsers);
        
        // 同时更新当前选中的模态框用户状态
        if (selectedUser && selectedUser.email === userEmail) {
          setSelectedUser({
            ...selectedUser,
            orders: selectedUser.orders.filter((o) => o.courseId !== courseId),
          });
        }
        setConfirmDeleteId(null);
      }
    } catch (err) {
      alert("撤销课程权限失败，请重试");
    } finally {
      setDeletingCourseId(null);
    }
  };

  return (
    <div>
      {/* 用户列表 */}
      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "var(--card-shadow)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#f8f9fa", borderBottom: "1px solid #dee2e6" }}>
              <th style={{ padding: "1rem 1.5rem", color: "#495057", fontWeight: "600" }}>用户信息</th>
              <th style={{ padding: "1rem 1.5rem", color: "#495057", fontWeight: "600" }}>身份角色</th>
              <th style={{ padding: "1rem 1.5rem", color: "#495057", fontWeight: "600" }}>已购课程</th>
              <th style={{ padding: "1rem 1.5rem", color: "#495057", fontWeight: "600" }}>注册时间</th>
              <th style={{ padding: "1rem 1.5rem", textAlign: "right", color: "#495057", fontWeight: "600" }}>管理操作</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user) => (
              <tr key={user.id} style={{ borderBottom: "1px solid #f1f3f5", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#fafbfc"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "1.25rem 1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: user.role === 'ADMIN' ? '#fbebed' : '#f1f3f5', display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {user.role === 'ADMIN' ? <Crown size={18} color="var(--primary)" /> : <User size={18} color="#adb5bd" />}
                    </div>
                    <div>
                      <div style={{ fontWeight: "600", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        {user.name || "未命名学员"}
                        {user.id === currentUserId && <span style={{ fontSize: "0.7rem", background: "#e6f4ea", color: "#28a745", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>我自己</span>}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#adb5bd", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <Mail size={12} /> {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "1.25rem 1.5rem" }}>
                  <span style={{ 
                    fontSize: "0.75rem", 
                    padding: "0.25rem 0.6rem", 
                    borderRadius: "4px", 
                    fontWeight: 600,
                    background: user.role === 'ADMIN' ? 'var(--primary-light)' : '#f1f3f5',
                    color: user.role === 'ADMIN' ? 'var(--primary)' : '#495057',
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem"
                  }}>
                    {user.role === 'ADMIN' ? <Shield size={14} /> : <User size={14} />}
                    {user.role === 'ADMIN' ? '管理员' : '学员'}
                  </span>
                </td>
                <td style={{ padding: "1.25rem 1.5rem", fontSize: "0.95rem", fontWeight: "500", color: "#495057" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <BookOpen size={14} color="#6c757d" />
                    <span>{user.orders.length} 门课</span>
                  </div>
                </td>
                <td style={{ padding: "1.25rem 1.5rem", fontSize: "0.9rem", color: "#6c757d" }}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: "1.25rem 1.5rem", textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", alignItems: "center" }}>
                    <button 
                      onClick={() => setSelectedUser(user)}
                      style={{ background: "none", border: "1px solid #dee2e6", padding: "0.4rem 0.8rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "500", color: "#495057", transition: "all 0.2s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#c8102e"; e.currentTarget.style.color = "#c8102e"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#dee2e6"; e.currentTarget.style.color = "#495057"; }}
                    >
                      详情
                    </button>
                    {user.id !== currentUserId && (
                      <button 
                        onClick={() => handleImpersonate(user.email || "")}
                        disabled={impersonatingEmail !== null}
                        style={{ 
                          background: "none", 
                          border: "1px solid #28a745", 
                          color: "#28a745", 
                          padding: "0.4rem 0.8rem", 
                          borderRadius: "6px", 
                          cursor: "pointer", 
                          fontSize: "0.85rem", 
                          fontWeight: "500",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          opacity: impersonatingEmail !== null ? 0.6 : 1,
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => { if (impersonatingEmail === null) { e.currentTarget.style.background = "#e6f4ea"; } }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                      >
                        {impersonatingEmail === user.email ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />}
                        模拟登录
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 详情二级菜单弹窗 */}
      {selectedUser && (
        <div style={{ 
          position: "fixed", 
          top: 0, 
          left: 0, 
          width: "100%", 
          height: "100%", 
          background: "rgba(0,0,0,0.4)", 
          backdropFilter: "blur(6px)",
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          zIndex: 1000 
        }}>
          <div style={{ 
            width: "90%", 
            maxWidth: "600px", 
            background: "#fff", 
            borderRadius: "16px", 
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            maxHeight: "85vh"
          }}>
            {/* Modal Header */}
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f3f5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "700", color: "#212529" }}>用户已购课程详情</h4>
                <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.8rem", color: "#868e96" }}>学员: {selectedUser.name || "未命名"} ({selectedUser.email})</p>
              </div>
              <button 
                onClick={() => { setSelectedUser(null); setConfirmDeleteId(null); }} 
                style={{ background: "none", border: "none", cursor: "pointer", color: "#adb5bd" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "1.5rem", overflowY: "auto", flex: 1 }}>
              <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "#f8f9fa", borderRadius: "10px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.85rem", color: "#495057" }}>
                  <div><strong>注册时间:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</div>
                  <div><strong>角色权限:</strong> {selectedUser.role === 'ADMIN' ? '超级管理员' : '普通学员'}</div>
                </div>
              </div>

              <h5 style={{ marginTop: 0, marginBottom: "1rem", fontSize: "0.95rem", fontWeight: "600", color: "#495057" }}>已购课程列表 ({selectedUser.orders.length})</h5>

              {selectedUser.orders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#adb5bd" }}>
                  <BookOpen size={40} style={{ marginBottom: "0.75rem", opacity: 0.5 }} />
                  <div>该用户暂未购买过任何课程。</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {selectedUser.orders.map((order) => {
                    const isConfirming = confirmDeleteId === order.courseId;
                    return (
                      <div 
                        key={order.id} 
                        style={{ 
                          border: "1px solid #f1f3f5", 
                          borderRadius: "10px", 
                          padding: "1rem", 
                          display: "flex", 
                          flexDirection: "column",
                          gap: "0.5rem",
                          background: isConfirming ? "#fff9db" : "#fff",
                          transition: "all 0.2s"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                          <div>
                            <div style={{ fontWeight: "600", color: "#212529" }}>{order.course.title}</div>
                            <div style={{ fontSize: "0.8rem", color: "#868e96", marginTop: "0.2rem" }}>
                              实付款: <span style={{ color: "var(--primary)", fontWeight: "600" }}>¥{order.course.price.toFixed(2)}</span>
                            </div>
                          </div>

                          {!isConfirming ? (
                            <button 
                              onClick={() => setConfirmDeleteId(order.courseId)}
                              disabled={deletingCourseId !== null}
                              style={{ 
                                background: "none", 
                                border: "none", 
                                cursor: "pointer", 
                                color: "#fa5252", 
                                padding: "0.4rem", 
                                borderRadius: "4px",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "background 0.2s"
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = "#fff0f0"}
                              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                              title="撤销课程访问权限"
                            >
                              <Trash2 size={16} />
                            </button>
                          ) : (
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <button 
                                onClick={() => handleRevokeCourse(selectedUser.email || "", order.courseId)}
                                disabled={deletingCourseId !== null}
                                style={{ 
                                  background: "#fa5252", 
                                  color: "#fff", 
                                  border: "none", 
                                  padding: "0.3rem 0.6rem", 
                                  borderRadius: "6px", 
                                  fontSize: "0.75rem", 
                                  fontWeight: "600", 
                                  cursor: "pointer" 
                                }}
                              >
                                {deletingCourseId === order.courseId ? "正在撤销..." : "确认"}
                              </button>
                              <button 
                                onClick={() => setConfirmDeleteId(null)}
                                disabled={deletingCourseId !== null}
                                style={{ 
                                  background: "#dee2e6", 
                                  color: "#495057", 
                                  border: "none", 
                                  padding: "0.3rem 0.6rem", 
                                  borderRadius: "6px", 
                                  fontSize: "0.75rem", 
                                  fontWeight: "600", 
                                  cursor: "pointer" 
                                }}
                              >
                                取消
                              </button>
                            </div>
                          )}
                        </div>
                        {isConfirming && (
                          <div style={{ fontSize: "0.75rem", color: "#f59f00", fontWeight: "500" }}>
                            警告：撤销权限将永久删除对应的成功付款记录，该用户将无法继续观看课程。
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #f1f3f5", background: "#f8f9fa", display: "flex", justifyContent: "flex-end" }}>
              <button 
                onClick={() => { setSelectedUser(null); setConfirmDeleteId(null); }} 
                className="btn-primary" 
                style={{ padding: "0.5rem 1.5rem", borderRadius: "8px", fontSize: "0.9rem" }}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
