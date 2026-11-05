// FILE: src/app/not-found.tsx
import React from "react";
import Link from "next/link";
import { getTranslation } from "@/lib/i18n";
import { Compass, Home } from "lucide-react";

export default async function NotFound() {
  const { t } = await getTranslation();

  return (
    <div style={{
      minHeight: "70vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "2rem 1rem",
    }}>
      <div style={{
        fontSize: "5rem",
        fontWeight: "900",
        color: "var(--primary)",
        lineHeight: 1,
        marginBottom: "1rem",
        fontFamily: "monospace"
      }}>
        404
      </div>
      <h2 style={{
        fontSize: "1.75rem",
        fontWeight: "800",
        marginBottom: "0.75rem",
        color: "var(--foreground-rgb)"
      }} className="font-serif-zh-en">
        {t("notFound.title")}
      </h2>
      <p style={{
        color: "var(--text-muted)",
        maxWidth: "460px",
        marginBottom: "2rem",
        lineHeight: "1.6",
        fontSize: "1rem"
      }}>
        {t("notFound.subtitle")}
      </p>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/" className="btn-primary" style={{
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.65rem 1.75rem",
          borderRadius: "24px",
          fontWeight: "600"
        }}>
          <Home size={18} /> {t("notFound.btnHome")}
        </Link>
        <Link href="/courses" className="btn-secondary-outline" style={{
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.65rem 1.75rem",
          borderRadius: "24px",
          fontWeight: "600"
        }}>
          <Compass size={18} /> {t("notFound.btnCourses")}
        </Link>
      </div>
    </div>
  );
}
