// FILE: src/components/settings-form.tsx
"use client";

import React, { useState } from "react";
import { Lock, Mail, User, ShieldCheck, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { updateUserPasswordAction } from "@/lib/actions/auth";

interface SettingsFormProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
  translations: {
    pageTitle: string;
    pageSubtitle: string;
    labelEmail: string;
    labelName: string;
    titleChangePassword: string;
    labelCurrentPassword: string;
    labelNewPassword: string;
    labelConfirmNewPassword: string;
    placeholderCurrentPassword: string;
    placeholderNewPassword: string;
    placeholderConfirmNewPassword: string;
    btnUpdate: string;
    btnUpdating: string;
    errMismatch: string;
    errRequired: string;
    successMessage: string;
  };
}

export const SettingsForm = ({ user, translations }: SettingsFormProps) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Client-side validations
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setErrorMsg(translations.errRequired);
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg(translations.placeholderNewPassword); // "请输入至少6位新密码..."
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg(translations.errMismatch);
      return;
    }

    setLoading(true);

    try {
      const res = await updateUserPasswordAction(currentPassword, newPassword);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(translations.successMessage);
        // Clear password fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "0 1rem" }}>
      {/* Toast Notification Container */}
      {(successMsg || errorMsg) && (
        <div style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          zIndex: 9999,
          background: successMsg ? "#ebfbee" : "#fff5f5",
          border: `1px solid ${successMsg ? "#40c057" : "#fa5252"}`,
          borderRadius: "8px",
          padding: "1rem 1.25rem",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          maxWidth: "400px",
          animation: "slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
        }}>
          {successMsg ? (
            <ShieldCheck size={20} color="#40c057" />
          ) : (
            <AlertCircle size={20} color="#fa5252" />
          )}
          <span style={{ fontSize: "0.9rem", color: successMsg ? "#2b8a3e" : "#c92a2a", fontWeight: 500 }}>
            {successMsg || errorMsg}
          </span>
          <button 
            onClick={() => { setSuccessMsg(null); setErrorMsg(null); }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              marginLeft: "1rem",
              color: "#adb5bd",
              fontSize: "1.1rem"
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Main Settings Card */}
      <div style={{
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.05)",
        border: "1px solid var(--border-color)",
        overflow: "hidden"
      }}>
        {/* Card Header */}
        <div style={{
          padding: "2rem",
          borderBottom: "1px solid #f1f3f5",
          background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)"
        }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--foreground-rgb)", margin: "0 0 0.5rem 0" }}>
            {translations.pageTitle}
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#868e96", margin: 0 }}>
            {translations.pageSubtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Read-only User Details Section */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", paddingBottom: "1.5rem", borderBottom: "1px solid #f1f3f5" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#495057" }}>
                {translations.labelName}
              </label>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                background: "#f8f9fa",
                border: "1px solid #e9ecef",
                color: "#868e96"
              }}>
                <User size={18} color="#adb5bd" />
                <span style={{ fontSize: "0.9rem" }}>{user.name || "N/A"}</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#495057" }}>
                {translations.labelEmail}
              </label>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                background: "#f8f9fa",
                border: "1px solid #e9ecef",
                color: "#868e96"
              }}>
                <Mail size={18} color="#adb5bd" />
                <span style={{ fontSize: "0.9rem" }}>{user.email || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Change Password Fields Section */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--foreground-rgb)", margin: "0 0 0.25rem 0" }}>
              {translations.titleChangePassword}
            </h3>

            {/* Current Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#495057" }}>
                {translations.labelCurrentPassword} <span style={{ color: "#fa5252" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={translations.placeholderCurrentPassword}
                  style={{
                    width: "100%",
                    padding: "0.75rem 2.5rem 0.75rem 1rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    fontSize: "0.9rem",
                    outline: "none",
                    transition: "border-color 0.2s"
                  }}
                  className="input-focus"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    color: "#adb5bd"
                  }}
                >
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#495057" }}>
                {translations.labelNewPassword} <span style={{ color: "#fa5252" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={translations.placeholderNewPassword}
                  style={{
                    width: "100%",
                    padding: "0.75rem 2.5rem 0.75rem 1rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    fontSize: "0.9rem",
                    outline: "none",
                    transition: "border-color 0.2s"
                  }}
                  className="input-focus"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    color: "#adb5bd"
                  }}
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#495057" }}>
                {translations.labelConfirmNewPassword} <span style={{ color: "#fa5252" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={translations.placeholderConfirmNewPassword}
                  style={{
                    width: "100%",
                    padding: "0.75rem 2.5rem 0.75rem 1rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    fontSize: "0.9rem",
                    outline: "none",
                    transition: "border-color 0.2s"
                  }}
                  className="input-focus"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    color: "#adb5bd"
                  }}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "0.5rem",
              background: "var(--primary)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "0.85rem",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              boxShadow: "0 4px 12px rgba(224, 49, 49, 0.2)",
              transition: "all 0.2s"
            }}
            className="btn-update-hover"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {translations.btnUpdating}
              </>
            ) : (
              translations.btnUpdate
            )}
          </button>
        </form>
      </div>

      <style jsx global>{`
        .input-focus:focus {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 3px rgba(224, 49, 49, 0.15);
        }
        .btn-update-hover:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(224, 49, 49, 0.3) !important;
          background: #c01e1e !important;
        }
        .btn-update-hover:active:not(:disabled) {
          transform: translateY(0);
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%) translateY(-10px);
            opacity: 0;
          }
          to {
            transform: translateX(0) translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
