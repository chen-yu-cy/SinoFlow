import type { Metadata } from "next";
import "./globals.css";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { BookOpen, Home, LayoutDashboard, HelpCircle } from "lucide-react";
import UserNav from "@/components/layout/user-nav";
import { getTranslation } from "@/lib/i18n";
import { LanguageSelector } from "@/components/layout/language-selector";
import { Inter, Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

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
  const { t, locale } = await getTranslation();

  return (
    <html lang={locale} className={`${inter.variable} ${plusJakarta.variable} ${playfair.variable}`}>
      <body>
        <header>
          <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px", padding: "0 2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "3rem" }}>
              <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                {/* Balanced Hollow Logo */}
                <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: "-5px" }}>
                  <path d="M22.5 11C22.5 8.5 20.5 7 17.5 7H13.5C10.5 7 8.5 8.5 8.5 11C8.5 13.5 10.5 14.5 14 15L18 16C21.5 16.5 23.5 17.5 23.5 20.5C23.5 23.5 21.5 25 18.5 25H14.5C11.5 25 9.5 23.5 9.5 21" stroke="var(--primary)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h1 style={{ color: "var(--foreground-rgb)", fontSize: "1.6rem", fontWeight: "900", letterSpacing: "-1px", margin: 0 }}>SinoFlow</h1>
              </Link>
              <div style={{ display: "flex", gap: "2rem", fontSize: "0.95rem", fontWeight: 500 }}>
                <Link href="/" className="nav-link" style={{ display: "flex", alignItems: "center", gap: "0.4rem", textDecoration: "none", color: "inherit" }}>
                  <Home size={18} strokeWidth={2} /> {t("nav.home")}
                </Link>
                <Link href="/courses" className="nav-link" style={{ display: "flex", alignItems: "center", gap: "0.4rem", textDecoration: "none", color: "inherit" }}>
                  <BookOpen size={18} strokeWidth={2} /> {t("nav.courses")}
                </Link>
                {session && (
                  <Link href="/my-courses" className="nav-link" style={{ display: "flex", alignItems: "center", gap: "0.4rem", textDecoration: "none", color: "inherit" }}>
                    <LayoutDashboard size={18} strokeWidth={2} /> {t("nav.myCourses")}
                  </Link>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
              <Link 
                href="/support" 
                title={t("nav.support") || "帮助与支持"}
                className="support-nav-icon"
              >
                <HelpCircle size={20} strokeWidth={2} />
              </Link>
              <LanguageSelector currentLocale={locale} />
              {session ? (
                <UserNav 
                  user={{ 
                    name: session.user?.name, 
                    email: session.user?.email, 
                    role: (session.user as any).role,
                    impersonatorEmail: (session.user as any).impersonatorEmail || null
                  }} 
                  translations={{
                    adminPortal: t("userNav.adminPortal"),
                    myLearning: t("userNav.myLearning"),
                    settings: t("userNav.settings"),
                    logout: t("userNav.logout"),
                    returnAdmin: t("userNav.returnAdmin"),
                  }}
                />
              ) : (
                <>
                  <Link href="/login" className="nav-link" style={{ fontSize: "0.95rem", fontWeight: 500, textDecoration: "none" }}>{t("nav.login")}</Link>
                  <Link href="/register">
                    <button className="btn-primary" style={{ padding: "0.5rem 1.5rem", borderRadius: "20px" }}>{t("nav.register")}</button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>
        <main className="container">{children}</main>
        <footer>
          <div className="container">
            <p>&copy; 2026 SinoFlow. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
};

export default RootLayout;
