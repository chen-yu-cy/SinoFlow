import type { Metadata } from "next";
import "./globals.css";
import { auth, signOut } from "@/lib/auth";
import Link from "next/link";

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
            <div style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
              <Link href="/" style={{ textDecoration: "none" }}>
                <h1>SinoFlow</h1>
              </Link>
              <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.95rem", fontWeight: 500 }}>
                <span className="nav-link" style={{ cursor: "pointer" }}>所有课程</span>
                <span className="nav-link" style={{ cursor: "pointer" }}>学习路径</span>
                <span className="nav-link" style={{ cursor: "pointer" }}>关于我们</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              {session ? (
                <>
                  <span style={{ fontSize: "0.9rem", color: "#6c757d" }}>
                    {session.user?.name || session.user?.email}
                  </span>
                  <form action={async () => {
                    "use server";
                    await signOut();
                  }}>
                    <button className="btn-primary" style={{ padding: "0.5rem 1.25rem", background: "#6c757d" }}>
                      退出
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login" style={{ fontSize: "0.9rem", color: "#6c757d", textDecoration: "none" }}>登录</Link>
                  <Link href="/register">
                    <button className="btn-primary" style={{ padding: "0.5rem 1.25rem" }}>免费注册</button>
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
