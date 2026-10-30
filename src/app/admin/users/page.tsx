import React from "react";
import prisma from "@/lib/db/client";
import { User, Shield, UserX, Mail } from "lucide-react";

const AdminUsersPage = async () => {
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: { orders: { where: { status: 'SUCCESS' } } }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h3>用户管理</h3>
        <p style={{ color: "#6c757d", fontSize: "0.9rem" }}>查看并管理 SinoFlow 平台的所有注册学员及管理员。</p>
      </div>

      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "var(--card-shadow)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#f8f9fa", borderBottom: "1px solid #dee2e6" }}>
              <th style={{ padding: "1rem 1.5rem" }}>用户信息</th>
              <th style={{ padding: "1rem 1.5rem" }}>身份角色</th>
              <th style={{ padding: "1rem 1.5rem" }}>已购课程</th>
              <th style={{ padding: "1rem 1.5rem" }}>注册时间</th>
              <th style={{ padding: "1rem 1.5rem", textAlign: "right" }}>管理操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: "1px solid #f1f3f5" }}>
                <td style={{ padding: "1.25rem 1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#f1f3f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <User size={18} color="#adb5bd" />
                    </div>
                    <div>
                      <div style={{ fontWeight: "600" }}>{user.name || "未命名学员"}</div>
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
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    width: "fit-content"
                  }}>
                    {user.role === 'ADMIN' ? <Shield size={14} /> : <User size={14} />}
                    {user.role === 'ADMIN' ? '管理员' : '学员'}
                  </span>
                </td>
                <td style={{ padding: "1.25rem 1.5rem" }}>{user._count.orders} 门课</td>
                <td style={{ padding: "1.25rem 1.5rem", fontSize: "0.9rem", color: "#6c757d" }}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: "1.25rem 1.5rem", textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                    <button style={{ background: "none", border: "1px solid #dee2e6", padding: "0.4rem 0.8rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}>
                      详情
                    </button>
                    {user.role !== 'ADMIN' && (
                      <button style={{ background: "none", border: "1px solid var(--primary)", color: "var(--primary)", padding: "0.4rem 0.8rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}>
                        设为管理员
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsersPage;
