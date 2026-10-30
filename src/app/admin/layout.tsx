import React from "react";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, BookOpen, Users, Settings, LogOut } from "lucide-react";

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
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8f9fa" }}>
      {/* Admin Sidebar */}
      <aside style={{ 
        width: "260px", 
        background: "#212529", 
        color: "#fff", 
        display: "flex", 
        flexDirection: "column",
        position: "fixed",
        height: "100vh"
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

      {/* Main Content Area */}
      <main style={{ flex: 1, marginLeft: "260px", padding: "2rem" }}>
        <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>管理后台</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontSize: "0.9rem", color: "#6c757d" }}>{session.user.email}</span>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
