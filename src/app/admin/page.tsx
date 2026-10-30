import React from "react";
import prisma from "@/lib/db/client";
import { BookOpen, Users, ShoppingCart, TrendingUp } from "lucide-react";
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

  const stats = [
    { title: "总课程数", value: courseCount, icon: <BookOpen />, color: "#4c6ef5", link: "/admin/courses" },
    { title: "总用户数", value: userCount, icon: <Users />, color: "#22b8cf", link: "/admin/users" },
    { title: "总订单数", value: orderCount, icon: <ShoppingCart />, color: "#fab005", link: "/admin/orders" },
    { title: "总营收", value: `¥${totalRevenue.toFixed(2)}`, icon: <TrendingUp />, color: "#40c057", link: "/admin/orders" },
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
      `}</style>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem", marginBottom: "3rem" }}>
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

      <div style={{ background: "#fff", padding: "2rem", borderRadius: "12px", boxShadow: "var(--card-shadow)" }}>
        <h3>最近系统动态</h3>
        <p style={{ color: "#6c757d", fontSize: "0.9rem" }}>欢迎来到 SinoFlow 管理后台。在这里您可以轻松管理您的课程内容、监控销售情况并管理用户权限。</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
