// FILE: src/components/layout/user-nav.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, Shield, ChevronDown, BookOpen, Loader2, Settings } from "lucide-react";
import { signOut, signIn } from "next-auth/react";
import { exitImpersonation } from "@/lib/actions/auth";

interface UserNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
    impersonatorEmail?: string | null;
  };
  translations?: {
    adminPortal: string;
    myLearning: string;
    settings?: string;
    logout: string;
    returnAdmin: string;
  };
}

const UserNav = ({ user, translations }: UserNavProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exiting, setExiting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const t = {
    adminPortal: translations?.adminPortal || "进入管理后台",
    myLearning: translations?.myLearning || "我的学习",
    settings: translations?.settings || "个人设置",
    logout: translations?.logout || "退出登录",
    returnAdmin: translations?.returnAdmin || "返回管理员账号"
  };

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 退出模拟登录，返回原管理员账号
  const handleExitImpersonation = async () => {
    setExiting(true);
    try {
      const res = await exitImpersonation();
      if (res.error) {
        alert(res.error);
        setExiting(false);
        return;
      }

      if (res.success && res.token && res.adminEmail) {
        // 使用返回 Token 重新登录为原管理员
        await signIn("credentials", {
          email: res.adminEmail,
          token: res.token,
          callbackUrl: "/admin/users",
          redirect: true,
        });
      }
    } catch (err) {
      alert("退出模拟登录异常");
      setExiting(false);
    }
  };

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "0.5rem", 
          padding: "0.4rem 0.8rem", 
          background: user.impersonatorEmail ? "var(--warning-light)" : (isOpen ? "var(--surface-muted)" : "var(--surface-subtle)"), 
          borderRadius: "20px",
          border: user.impersonatorEmail ? "1px solid var(--warning)" : "1px solid var(--border-color)",
          cursor: "pointer",
          transition: "all 0.2s",
          outline: "none"
        }}
      >
        <div style={{ 
          width: "24px", 
          height: "24px", 
          borderRadius: "50%", 
          background: user.impersonatorEmail ? "#f59f00" : "var(--primary)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          color: "#fff" 
        }}>
          <User size={14} />
        </div>
        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground-rgb)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
          {user.name?.split(' ')[0] || "学员"}
          {user.impersonatorEmail && (
            <span style={{ 
              fontSize: "0.7rem", 
              background: "var(--warning-light)", 
              color: "var(--warning)", 
              padding: "0.1rem 0.4rem", 
              borderRadius: "10px", 
              border: "1px solid var(--warning)",
              fontWeight: "bold"
            }}>
              模拟中
            </span>
          )}
        </span>
        <ChevronDown size={14} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s", color: "var(--text-muted)" }} />
      </button>

      {isOpen && (
        <div style={{ 
          position: "absolute", 
          top: "calc(100% + 8px)", 
          right: 0, 
          width: "220px", 
          background: "var(--surface-card)", 
          borderRadius: "12px", 
          boxShadow: "var(--card-shadow)",
          padding: "0.5rem",
          zIndex: 1000,
          border: "1px solid var(--border-color)",
          animation: "fadeIn 0.2s ease-out"
        }}>
          {/* User Info Header */}
          <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--border-subtle)", marginBottom: "0.5rem" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--foreground-rgb)" }}>{user.name}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</div>
            {user.impersonatorEmail && (
              <div style={{ fontSize: "0.7rem", color: "var(--warning)", marginTop: "0.25rem", fontWeight: "500" }}>
                原管理员: {user.impersonatorEmail}
              </div>
            )}
          </div>

          {/* Impersonation Exit */}
          {user.impersonatorEmail && (
            <div 
              onClick={exiting ? undefined : handleExitImpersonation}
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "0.75rem", 
                padding: "0.75rem 1rem", 
                borderRadius: "8px", 
                color: "var(--warning)", 
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: "pointer",
                background: "var(--warning-light)",
                marginBottom: "0.5rem",
                transition: "opacity 0.2s"
              }} 
              className="dropdown-item"
            >
              {exiting ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
              {t.returnAdmin}
            </div>
          )}

          {/* Admin Entry */}
          {user.role === "ADMIN" && !user.impersonatorEmail && (
            <Link href="/admin" target="_blank" onClick={() => setIsOpen(false)} style={{ textDecoration: "none" }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "0.75rem", 
                padding: "0.75rem 1rem", 
                borderRadius: "8px", 
                color: "var(--primary)", 
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: "pointer",
                background: "var(--primary-light)"
              }} className="dropdown-item">
                <Shield size={18} /> {t.adminPortal}
              </div>
            </Link>
          )}

          <Link href="/my-courses" onClick={() => setIsOpen(false)} style={{ textDecoration: "none" }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "0.75rem", 
              padding: "0.75rem 1rem", 
              borderRadius: "8px", 
              color: "var(--foreground-rgb)", 
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "background 0.2s"
            }} className="dropdown-item-hover">
              <BookOpen size={18} color="var(--text-muted)" /> {t.myLearning}
            </div>
          </Link>

          <Link href="/settings" onClick={() => setIsOpen(false)} style={{ textDecoration: "none" }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "0.75rem", 
              padding: "0.75rem 1rem", 
              borderRadius: "8px", 
              color: "var(--foreground-rgb)", 
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "background 0.2s"
            }} className="dropdown-item-hover">
              <Settings size={18} color="var(--text-muted)" /> {t.settings}
            </div>
          </Link>

          <div 
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "0.75rem", 
              padding: "0.75rem 1rem", 
              borderRadius: "8px", 
              color: "#fa5252", 
              fontSize: "0.9rem",
              cursor: "pointer",
              marginTop: "0.5rem",
              borderTop: "1px solid var(--border-subtle)"
            }}
            className="dropdown-item-hover"
          >
            <LogOut size={18} /> {t.logout}
          </div>

          <style jsx>{`
            .dropdown-item-hover:hover {
              background-color: var(--surface-muted);
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default UserNav;
