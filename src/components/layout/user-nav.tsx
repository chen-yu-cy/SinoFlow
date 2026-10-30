"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, LayoutDashboard, Shield, ChevronDown, BookOpen } from "lucide-react";
import { signOut } from "next-auth/react";

interface UserNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

const UserNav = ({ user }: UserNavProps) => {
  const [isOpen, setIsState] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsState(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <button 
        onClick={() => setIsState(!isOpen)}
        style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "0.5rem", 
          padding: "0.4rem 0.8rem", 
          background: isOpen ? "#e9ecef" : "#f1f3f5", 
          borderRadius: "20px",
          border: "none",
          cursor: "pointer",
          transition: "all 0.2s",
          outline: "none"
        }}
      >
        <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
          <User size={14} />
        </div>
        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground-rgb)" }}>
          {user.name?.split(' ')[0] || "学员"}
        </span>
        <ChevronDown size={14} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s", color: "#adb5bd" }} />
      </button>

      {isOpen && (
        <div style={{ 
          position: "absolute", 
          top: "calc(100% + 8px)", 
          right: 0, 
          width: "220px", 
          background: "#fff", 
          borderRadius: "12px", 
          boxShadow: "0 10px 25px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.1)",
          padding: "0.5rem",
          zIndex: 1000,
          border: "1px solid var(--border-color)",
          animation: "fadeIn 0.2s ease-out"
        }}>
          {/* User Info Header */}
          <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #f1f3f5", marginBottom: "0.5rem" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--foreground-rgb)" }}>{user.name}</div>
            <div style={{ fontSize: "0.75rem", color: "#adb5bd", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</div>
          </div>

          {/* Admin Entry */}
          {user.role === "ADMIN" && (
            <Link href="/admin" onClick={() => setIsState(false)} style={{ textDecoration: "none" }}>
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
                <Shield size={18} /> 进入管理后台
              </div>
            </Link>
          )}

          <Link href="/my-courses" onClick={() => setIsState(false)} style={{ textDecoration: "none" }}>
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
              <BookOpen size={18} color="#adb5bd" /> 我的学习
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
              borderTop: "1px solid #f1f3f5"
            }}
            className="dropdown-item-hover"
          >
            <LogOut size={18} /> 退出登录
          </div>

          <style jsx>{`
            .dropdown-item-hover:hover {
              background-color: #f8f9fa;
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
