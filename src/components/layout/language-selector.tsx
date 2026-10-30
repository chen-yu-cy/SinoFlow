// FILE: src/components/layout/language-selector.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { setLocaleAction } from "@/lib/actions/locale";
import { useRouter } from "next/navigation";
import { Globe, ChevronDown } from "lucide-react";

export function LanguageSelector({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSelect = async (locale: string) => {
    await setLocaleAction(locale);
    setIsOpen(false);
    router.refresh();
  };

  return (
    <div style={{ position: "relative" }} ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "none",
          border: "1px solid var(--border-color)",
          borderRadius: "20px",
          padding: "0.4rem 0.8rem",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          cursor: "pointer",
          fontSize: "0.85rem",
          fontWeight: 600,
          color: "var(--foreground-rgb)",
          transition: "all 0.2s"
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--primary)"}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.borderColor = "var(--border-color)";
        }}
      >
        <Globe size={16} color="#6c757d" />
        <span>{currentLocale === "en" ? "English" : currentLocale === "es" ? "Español" : "中文"}</span>
        <ChevronDown size={14} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s", color: "#adb5bd" }} />
      </button>
 
      {isOpen && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          right: 0,
          background: "#fff",
          borderRadius: "10px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          border: "1px solid var(--border-color)",
          padding: "0.4rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.2rem",
          zIndex: 1000,
          width: "120px"
        }}>
          <button
            onClick={() => handleSelect("zh")}
            style={{
              background: currentLocale === "zh" ? "var(--primary-light)" : "none",
              color: currentLocale === "zh" ? "var(--primary)" : "#495057",
              border: "none",
              borderRadius: "6px",
              padding: "0.5rem 0.75rem",
              textAlign: "left",
              fontSize: "0.85rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "background 0.2s"
            }}
            onMouseEnter={(e) => {
              if (currentLocale !== "zh") e.currentTarget.style.background = "#f8f9fa";
            }}
            onMouseLeave={(e) => {
              if (currentLocale !== "zh") e.currentTarget.style.background = "none";
            }}
          >
            中文
          </button>
          <button
            onClick={() => handleSelect("en")}
            style={{
              background: currentLocale === "en" ? "var(--primary-light)" : "none",
              color: currentLocale === "en" ? "var(--primary)" : "#495057",
              border: "none",
              borderRadius: "6px",
              padding: "0.5rem 0.75rem",
              textAlign: "left",
              fontSize: "0.85rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "background 0.2s"
            }}
            onMouseEnter={(e) => {
              if (currentLocale !== "en") e.currentTarget.style.background = "#f8f9fa";
            }}
            onMouseLeave={(e) => {
              if (currentLocale !== "en") e.currentTarget.style.background = "none";
            }}
          >
            English
          </button>
          <button
            onClick={() => handleSelect("es")}
            style={{
              background: currentLocale === "es" ? "var(--primary-light)" : "none",
              color: currentLocale === "es" ? "var(--primary)" : "#495057",
              border: "none",
              borderRadius: "6px",
              padding: "0.5rem 0.75rem",
              textAlign: "left",
              fontSize: "0.85rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "background 0.2s"
            }}
            onMouseEnter={(e) => {
              if (currentLocale !== "es") e.currentTarget.style.background = "#f8f9fa";
            }}
            onMouseLeave={(e) => {
              if (currentLocale !== "es") e.currentTarget.style.background = "none";
            }}
          >
            Español
          </button>
        </div>
      )}
    </div>
  );
}
