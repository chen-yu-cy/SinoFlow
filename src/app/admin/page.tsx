// FILE: src/app/admin/page.tsx
import React from "react";
import prisma from "@/lib/db/client";
import { BookOpen, Users, ShoppingCart, TrendingUp, LifeBuoy } from "lucide-react";
import Link from "next/link";

const AdminDashboard = async () => {
  // 获取统计数据
  const courseCount = await prisma.course.count();
  const userCount = await prisma.user.count();
  const orderCount = await prisma.order.count();
  const successfulOrders = await prisma.order.findMany({
    where: { status: 'SUCCESS' },
    select: { amount: true }
  });
  const totalRevenue = successfulOrders.reduce((acc, order) => acc + order.amount, 0);

  // 获取待处理工单数
  const pendingTicketsCount = await prisma.supportTicket.count({
    where: { status: 'PENDING' }
  });

  // 获取最近的 5 条待处理工单摘要
  const recentPendingTickets = await prisma.supportTicket.findMany({
    where: { status: 'PENDING' },
    take: 5,
    orderBy: { createdAt: "desc" }
  });

  const stats = [
    { title: "总课程数", value: courseCount, icon: <BookOpen />, color: "#4c6ef5", link: "/admin/courses" },
    { title: "总用户数", value: userCount, icon: <Users />, color: "#22b8cf", link: "/admin/users" },
    { title: "总订单数", value: orderCount, icon: <ShoppingCart />, color: "#fab005", link: "/admin/orders" },
    { title: "总营收", value: `¥${totalRevenue.toFixed(2)}`, icon: <TrendingUp />, color: "#40c057", link: "/admin/orders" },
    { title: "待处理工单", value: `${pendingTicketsCount} 个`, icon: <LifeBuoy />, color: "#fa5252", link: "/admin/tickets" },
  ];

  return (
    <div>
      <style>{`
        .admin-stat-card {
          background: #fff;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: var(--card-shadow);
          display: flex;
          align-items: center;
          gap: 1.25rem;
          text-decoration: none;
          color: inherit;
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: pointer;
        }
        .admin-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
        }
        .recent-ticket-link {
          display: flex;
          flex-direction: column;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s;
        }
        .recent-ticket-link:hover {
          background: #fafbfc;
          border-color: var(--primary-light);
          transform: translateX(4px);
        }
      `}</style>

      {/* 5格的统计网格，带响应式自适应尺寸 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
        {stats.map((stat, idx) => (
          <Link 
            key={idx} 
            href={stat.link}
            className="admin-stat-card"
          >
            <div style={{ 
              width: "48px", 
              height: "48px", 
              borderRadius: "10px", 
              background: stat.color, 
              color: "#fff", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              flexShrink: 0
            }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: "0.85rem", color: "#6c757d", marginBottom: "0.25rem" }}>{stat.title}</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "800" }}>{stat.value}</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", alignItems: "start" }}>
        {/* 左侧动态信息 */}
        <div style={{ background: "#fff", padding: "2rem", borderRadius: "12px", boxShadow: "var(--card-shadow)" }}>
          <h3 style={{ margin: "0 0 1rem 0" }}>最近系统动态</h3>
          <p style={{ color: "#6c757d", fontSize: "0.95rem", lineHeight: "1.6", margin: 0 }}>
            欢迎来到 SinoFlow 管理后台。在这里您可以轻松管理您的课程内容、监控销售情况并管理用户权限。
          </p>
          <div style={{ marginTop: "1.5rem", borderTop: "1px solid #eee", paddingTop: "1.5rem" }}>
            <p style={{ fontSize: "0.85rem", color: "#868e96" }}>
              💡 提示：如有任何问题，可在工单管理页面对学员发起留言追问，已支持双向多轮沟通流。
            </p>
          </div>
        </div>

        {/* 右侧待处理工单摘要栏 */}
        <div style={{ background: "#fff", padding: "2rem", borderRadius: "12px", boxShadow: "var(--card-shadow)" }}>
          <h3 style={{ margin: "0 0 1.25rem 0", fontSize: "1.1rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <LifeBuoy size={20} color="#fa5252" /> 待处理工单摘要 ({pendingTicketsCount})
          </h3>
          
          {recentPendingTickets.length === 0 ? (
            <div style={{ textAlign: "center", padding: "1.5rem", color: "#868e96" }}>
              <p style={{ fontSize: "0.85rem", margin: 0 }}>🎉 所有工单已处理完毕，暂无待处理！</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {recentPendingTickets.map((ticket) => (
                <Link 
                  key={ticket.id}
                  href="/admin/tickets"
                  className="recent-ticket-link"
                >
                  <div style={{ fontWeight: "700", fontSize: "0.85rem", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", color: "#212529" }}>
                    {ticket.title}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#868e96", marginTop: "0.4rem" }}>
                    <span>{ticket.userEmail}</span>
                    <span>{new Date(ticket.createdAt).toLocaleDateString("zh-CN")}</span>
                  </div>
                </Link>
              ))}
              <div style={{ marginTop: "0.5rem", textAlign: "right" }}>
                <Link 
                  href="/admin/tickets" 
                  style={{ fontSize: "0.8rem", color: "var(--primary)", textDecoration: "none", fontWeight: "600" }}
                >
                  查看全部工单 &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
