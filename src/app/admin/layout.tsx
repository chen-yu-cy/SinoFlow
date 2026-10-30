import React from "react";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, BookOpen, Users, Settings, LogOut, ShoppingCart, LifeBuoy } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  // 严格的权限校验
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/");
  }

  return (
    /* 
       使用 fixed 定位和极高 z-index 彻底覆盖公共前台布局
       这样可以确保后台是一个独立的、不受干扰的工作空间
    */
    <div style={{ 
      position: "fixed", 
      top: 0, 
      left: 0, 
      width: "100vw", 
      height: "100vh", 
      zIndex: 5000, 
      background: "#f8f9fa",
      overflow: "hidden", // 内部自己处理滚动
      display: "flex"
    }}>
      {/* Admin Sidebar */}
      <aside style={{ 
        width: "260px", 
        background: "#212529", 
        color: "#fff", 
        display: "flex", 
        flexDirection: "column",
        height: "100vh",
        flexShrink: 0,
        boxShadow: "4px 0 10px rgba(0,0,0,0.05)"
      }}>
        <div style={{ padding: "2rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <Link href="/" style={{ textDecoration: "none", color: "#fff", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "28px", height: "28px", background: "var(--primary)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontWeight: "900" }}>S</span>
            </div>
            <span style={{ fontWeight: "800", fontSize: "1.2rem" }}>SinoFlow Admin</span>
          </Link>
        </div>

        <nav style={{ flex: 1, padding: "1.5rem 0" }}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li>
              <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 2rem", color: "#adb5bd", textDecoration: "none", transition: "all 0.2s" }}>
                <LayoutDashboard size={20} /> 控制台
              </Link>
            </li>
            <li>
              <Link href="/admin/courses" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 2rem", color: "#adb5bd", textDecoration: "none" }}>
                <BookOpen size={20} /> 课程管理
              </Link>
            </li>
            <li>
              <Link href="/admin/users" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 2rem", color: "#adb5bd", textDecoration: "none" }}>
                <Users size={20} /> 用户管理
              </Link>
            </li>
            <li>
              <Link href="/admin/orders" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 2rem", color: "#adb5bd", textDecoration: "none" }}>
                <ShoppingCart size={20} /> 订单管理
              </Link>
            </li>
            <li>
              <Link href="/admin/tickets" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 2rem", color: "#adb5bd", textDecoration: "none" }}>
                <LifeBuoy size={20} /> 工单管理
              </Link>
            </li>
            <li>
              <Link href="/admin/settings" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 2rem", color: "#adb5bd", textDecoration: "none" }}>
                <Settings size={20} /> 系统设置
              </Link>
            </li>
            <li style={{ marginTop: "2rem" }}>
              <form action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}>
                <button style={{ 
                  width: "100%", 
                  background: "none", 
                  border: "none", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.75rem", 
                  padding: "1rem 2rem", 
                  color: "#adb5bd", 
                  cursor: "pointer",
                  fontSize: "inherit",
                  fontFamily: "inherit"
                }}>
                  <LogOut size={20} /> 退出登录
                </button>
              </form>
            </li>
          </ul>
        </nav>

        <div style={{ padding: "1.5rem 2rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#6c757d", fontSize: "0.85rem" }}>
            <div style={{ width: "8px", height: "8px", background: "#28a745", borderRadius: "50%" }}></div>
            管理员在线
          </div>
        </div>
      </aside>

      {/* Main Content Area - 自带独立滚动条 */}
      <div style={{ flex: 1, height: "100vh", overflowY: "auto", position: "relative" }}>
        {/* 内容区固定的 Header */}
        <header style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          position: "sticky",
          top: 0,
          background: "rgba(248, 249, 250, 0.98)", // 几乎不透明，防止透视
          backdropFilter: "blur(10px)",
          padding: "1.5rem 2.5rem",
          zIndex: 100, // 高于主体内容
          borderBottom: "1px solid #eee"
        }}>
          <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "700" }}>管理系统 / Overview</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: "700" }}>{session.user.name}</div>
              <div style={{ fontSize: "0.75rem", color: "#adb5bd" }}>{session.user.email}</div>
            </div>
          </div>
        </header>

        {/* 实际页面内容 */}
        <main style={{ padding: "2.5rem" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
