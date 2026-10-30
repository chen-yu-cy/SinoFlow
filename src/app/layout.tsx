import type { Metadata } from "next";
import "./globals.css";
import { auth, signOut } from "@/lib/auth";
import Link from "next/link";
import { BookOpen, Home, User, LogOut, LayoutDashboard } from "lucide-react";

export const metadata: Metadata = {
  title: "SinoFlow - Chinese Language Learning",
  description: "Learn Chinese with the newspaper organization's official platform.",
};

const RootLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const session = await auth();

  return (
    <html lang="zh-CN">
      <body>
        <header>
          <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "3rem" }}>
              <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                {/* Balanced Hollow Logo */}
                <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: "-5px" }}>
                  <path d="M22.5 11C22.5 8.5 20.5 7 17.5 7H13.5C10.5 7 8.5 8.5 8.5 11C8.5 13.5 10.5 14.5 14 15L18 16C21.5 16.5 23.5 17.5 23.5 20.5C23.5 23.5 21.5 25 18.5 25H14.5C11.5 25 9.5 23.5 9.5 21" stroke="var(--primary)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h1 style={{ color: "var(--foreground-rgb)", fontSize: "1.6rem", fontWeight: "900", letterSpacing: "-1px" }}>SinoFlow</h1>
              </Link>
              <div style={{ display: "flex", gap: "2rem", fontSize: "0.95rem", fontWeight: 500 }}>
                <Link href="/" className="nav-link" style={{ display: "flex", alignItems: "center", gap: "0.4rem", textDecoration: "none", color: "inherit" }}>
                  <Home size={18} strokeWidth={2} /> 首页
                </Link>
                <Link href="/courses" className="nav-link" style={{ display: "flex", alignItems: "center", gap: "0.4rem", textDecoration: "none", color: "inherit" }}>
                  <BookOpen size={18} strokeWidth={2} /> 所有课程
                </Link>
                {session && (
                  <Link href="/my-courses" className="nav-link" style={{ display: "flex", alignItems: "center", gap: "0.4rem", textDecoration: "none", color: "inherit" }}>
                    <LayoutDashboard size={18} strokeWidth={2} /> 我的学习
                  </Link>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
              {session ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 0.8rem", background: "#f1f3f5", borderRadius: "20px" }}>
                    <User size={16} />
                    <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{session.user?.name?.split(' ')[0] || "学员"}</span>
                  </div>
                  <form action={async () => {
                    "use server";
                    await signOut();
                  }}>
                    <button style={{ background: "none", border: "none", color: "#adb5bd", cursor: "pointer", display: "flex", alignItems: "center" }} title="退出登录">
                      <LogOut size={20} />
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login" style={{ fontSize: "0.95rem", fontWeight: 500, color: "var(--secondary)", textDecoration: "none" }}>登录</Link>
                  <Link href="/register">
                    <button className="btn-primary" style={{ padding: "0.5rem 1.5rem", borderRadius: "20px" }}>免费注册</button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </header>
        <main>{children}</main>
        <footer>
          <p>&copy; 2026 SinoFlow. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
};

export default RootLayout;
