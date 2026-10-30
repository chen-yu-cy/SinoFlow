// FILE: src/components/auth/auth-modal.tsx
"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X, Mail, Lock, User, AlertCircle, CheckCircle2 } from "lucide-react";
import { registerUser } from "@/lib/actions/auth";

interface AuthModalProps {
  initialMode: "login" | "register";
  translations: {
    loginTitle: string;
    emailLabel: string;
    passwordLabel: string;
    loginButton: string;
    noAccount: string;
    registerLink: string;
    loginError: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    closeButton: string;
    registerTitle: string;
    nameLabel: string;
    namePlaceholder: string;
    registerButton: string;
    haveAccount: string;
    loginLink: string;
    registerSuccess: string;
  };
}

export const AuthModal = ({ initialMode, translations: t }: AuthModalProps) => {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const switchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    setError(null);
    setSuccessMsg(null);
    // Dynamically update URL without refreshing
    window.history.pushState({}, "", `/${newMode}`);
  };

  const handleLoginSubmit = async (formData: FormData) => {
    const email = formData.get("email");
    const password = formData.get("password");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(t.loginError);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  const handleRegisterSubmit = async (formData: FormData) => {
    const result = await registerUser(formData);
    if (result.error) {
      setError(result.error);
    } else {
      // Clear errors, show success message, and switch to login
      setSuccessMsg(t.registerSuccess);
      setMode("login");
      window.history.pushState({}, "", "/login");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const formData = new FormData(e.currentTarget);
    try {
      if (mode === "login") {
        await handleLoginSubmit(formData);
      } else {
        await handleRegisterSubmit(formData);
      }
    } catch (err) {
      setError(mode === "login" ? t.loginError : "网络或系统错误，请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
        padding: "1rem",
        animation: "fadeIn 0.25s ease-out"
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div 
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.5)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.15)",
          padding: "2.5rem 2rem",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          animation: "scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
        }}
      >
        {/* Close Button */}
        <button 
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "1.25rem",
            right: "1.25rem",
            border: "none",
            background: "none",
            cursor: "pointer",
            color: "#6c757d",
            padding: "0.25rem",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s"
          }}
          title={t.closeButton}
          className="close-hover"
        >
          <X size={20} />
        </button>

        <h2 style={{ 
          fontSize: "1.75rem", 
          fontWeight: 800, 
          textAlign: "center", 
          marginBottom: "2rem",
          color: "var(--foreground-rgb)",
          letterSpacing: "-0.5px"
        }}>
          {mode === "login" ? t.loginTitle : t.registerTitle}
        </h2>

        {successMsg && (
          <div style={{ 
            color: "var(--success)", 
            fontSize: "0.85rem", 
            marginBottom: "1.25rem", 
            background: "var(--success-light)", 
            padding: "0.6rem 0.8rem", 
            borderRadius: "8px",
            border: "1px solid rgba(40, 167, 69, 0.12)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontWeight: 500
          }}>
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {mode === "register" && (
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: 600, color: "#495057" }}>
                {t.nameLabel}
              </label>
              <div style={{ position: "relative" }}>
                <User size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#adb5bd" }} />
                <input 
                  name="name" 
                  type="text" 
                  placeholder={t.namePlaceholder}
                  style={{ 
                    width: "100%", 
                    padding: "0.75rem 1rem 0.75rem 2.5rem", 
                    borderRadius: "8px", 
                    border: "1px solid #dee2e6",
                    fontSize: "0.95rem",
                    background: "#f8f9fa",
                    transition: "all 0.2s"
                  }} 
                  required 
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: 600, color: "#495057" }}>
              {t.emailLabel}
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#adb5bd" }} />
              <input 
                name="email" 
                type="email" 
                placeholder={t.emailPlaceholder}
                style={{ 
                  width: "100%", 
                  padding: "0.75rem 1rem 0.75rem 2.5rem", 
                  borderRadius: "8px", 
                  border: "1px solid #dee2e6",
                  fontSize: "0.95rem",
                  background: "#f8f9fa",
                  transition: "all 0.2s"
                }} 
                required 
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: 600, color: "#495057" }}>
              {t.passwordLabel}
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#adb5bd" }} />
              <input 
                name="password" 
                type="password" 
                placeholder={t.passwordPlaceholder}
                style={{ 
                  width: "100%", 
                  padding: "0.75rem 1rem 0.75rem 2.5rem", 
                  borderRadius: "8px", 
                  border: "1px solid #dee2e6",
                  fontSize: "0.95rem",
                  background: "#f8f9fa",
                  transition: "all 0.2s"
                }} 
                required 
              />
            </div>
          </div>

          {error && (
            <div style={{ 
              color: "var(--primary)", 
              fontSize: "0.85rem", 
              margin: 0, 
              background: "var(--primary-light)", 
              padding: "0.6rem 0.8rem", 
              borderRadius: "8px",
              border: "1px solid rgba(200, 16, 46, 0.1)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontWeight: 500
            }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ 
              padding: "0.8rem", 
              marginTop: "0.5rem",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: 600,
              opacity: loading ? 0.75 : 1
            }}
          >
            {loading ? "..." : (mode === "login" ? t.loginButton : t.registerButton)}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.9rem", color: "#6c757d", margin: "2rem 0 0 0" }}>
          {mode === "login" ? (
            <>
              {t.noAccount}{" "}
              <button 
                onClick={() => switchMode("register")}
                style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none", border: "none", background: "none", cursor: "pointer", padding: 0 }}
              >
                {t.registerLink}
              </button>
            </>
          ) : (
            <>
              {t.haveAccount}{" "}
              <button 
                onClick={() => switchMode("login")}
                style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none", border: "none", background: "none", cursor: "pointer", padding: 0 }}
              >
                {t.loginLink}
              </button>
            </>
          )}
        </p>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .close-hover:hover {
          background-color: #f1f3f5 !important;
          color: #212529 !important;
        }
      `}</style>
    </div>
  );
};
