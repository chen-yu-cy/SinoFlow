"use client";

import React, { useState } from "react";
import { X, ShieldAlert, Loader2 } from "lucide-react";
import { verifyAdminPassword } from "@/lib/actions/auth";

interface AdminConfirmModalProps {
  title: string;
  description: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  confirmText?: string;
}

const AdminConfirmModal = ({ title, description, onConfirm, onCancel, confirmText = "确认执行" }: AdminConfirmModalProps) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsVerifying(true);

    try {
      const result = await verifyAdminPassword(password);
      if (result.success) {
        await onConfirm();
        onCancel();
      } else {
        setError(result.error || "验证失败");
      }
    } catch (err) {
      setError("系统繁忙，请稍后再试");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div style={{ 
      position: "fixed", 
      top: 0, 
      left: 0, 
      width: "100%", 
      height: "100%", 
      background: "rgba(0,0,0,0.4)", 
      backdropFilter: "blur(4px)",
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      zIndex: 2000 
    }}>
      <div style={{ 
        width: "100%", 
        maxWidth: "400px", 
        background: "#fff", 
        borderRadius: "16px", 
        boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
        overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{ padding: "1.5rem", borderBottom: "1px solid #f1f3f5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--primary)", fontWeight: "bold" }}>
            <ShieldAlert size={20} /> 安全验证
          </div>
          <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer", color: "#adb5bd" }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: "2.5rem 2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h3 style={{ marginTop: 0, marginBottom: "0.75rem", fontSize: "1.25rem", color: "#212529", fontWeight: "800" }}>{title}</h3>
            <p style={{ color: "#6c757d", fontSize: "0.95rem", lineHeight: "1.6", margin: 0 }}>{description}</p>
          </div>
          
          <div style={{ marginBottom: "2rem", padding: "1.5rem", background: "#f8f9fa", borderRadius: "12px", border: "1px solid #eee" }}>
            <label style={{ display: "block", marginBottom: "0.75rem", fontSize: "0.85rem", color: "#495057", fontWeight: "700", textAlign: "center" }}>
              请输入您的管理员登录密码确认
            </label>
            <input 
              type="password" 
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="管理员密码"
              style={{ 
                width: "100%", 
                padding: "0.8rem", 
                borderRadius: "8px", 
                border: error ? "2px solid #fa5252" : "1px solid #ddd",
                textAlign: "center",
                fontSize: "1rem"
              }}
              required
            />
            {error && <div style={{ color: "#fa5252", fontSize: "0.8rem", marginTop: "0.6rem", textAlign: "center", fontWeight: "600" }}>{error}</div>}
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button type="button" onClick={onCancel} style={{ flex: 1, padding: "0.8rem", borderRadius: "10px", border: "1px solid #dee2e6", background: "#fff", cursor: "pointer", fontWeight: "600", color: "#495057" }}>取消</button>
            <button 
              type="submit" 
              disabled={isVerifying}
              className="btn-primary" 
              style={{ 
                flex: 1, 
                padding: "0.8rem", 
                borderRadius: "10px", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                gap: "0.5rem", 
                opacity: isVerifying ? 0.7 : 1,
                fontSize: "1rem"
              }}
            >
              {isVerifying ? <Loader2 size={18} className="animate-spin" /> : confirmText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminConfirmModal;
