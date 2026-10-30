"use client";

import React, { useState } from "react";
import { registerUser } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

const RegisterPage = () => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("正在提交注册表单...");
    const formData = new FormData(e.currentTarget);
    try {
      const result = await registerUser(formData);
      console.log("注册结果:", result);
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/login");
      }
    } catch (err) {
      console.error("提交表单时发生异常:", err);
      setError("网络或系统错误，请稍后再试");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "4rem auto", padding: "2rem", background: "#fff", borderRadius: "8px", boxShadow: "var(--card-shadow)" }}>
      <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>创建账号</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>姓名</label>
          <input name="name" type="text" style={{ width: "100%", padding: "0.75rem", borderRadius: "4px", border: "1px solid var(--border-color)" }} required />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>邮箱</label>
          <input name="email" type="email" style={{ width: "100%", padding: "0.75rem", borderRadius: "4px", border: "1px solid var(--border-color)" }} required />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>密码</label>
          <input name="password" type="password" style={{ width: "100%", padding: "0.75rem", borderRadius: "4px", border: "1px solid var(--border-color)" }} required />
        </div>
        {error && <p style={{ color: "var(--primary)", fontSize: "0.85rem", margin: 0 }}>{error}</p>}
        <button type="submit" className="btn-primary" style={{ padding: "0.75rem", marginTop: "1rem" }}>立即注册</button>
      </form>
      <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem" }}>
        已有账号？ <Link href="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>立即登录</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
