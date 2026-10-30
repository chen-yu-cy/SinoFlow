"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const LoginPage = () => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("邮箱或密码错误");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "4rem auto", padding: "2rem", background: "#fff", borderRadius: "8px", boxShadow: "var(--card-shadow)" }}>
      <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>登录 SinoFlow</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>邮箱</label>
          <input name="email" type="email" style={{ width: "100%", padding: "0.75rem", borderRadius: "4px", border: "1px solid var(--border-color)" }} required />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>密码</label>
          <input name="password" type="password" style={{ width: "100%", padding: "0.75rem", borderRadius: "4px", border: "1px solid var(--border-color)" }} required />
        </div>
        {error && <p style={{ color: "var(--primary)", fontSize: "0.85rem", margin: 0 }}>{error}</p>}
        <button type="submit" className="btn-primary" style={{ padding: "0.75rem", marginTop: "1rem" }}>登录</button>
      </form>
      <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem" }}>
        还没有账号？ <Link href="/register" style={{ color: "var(--primary)", fontWeight: 600 }}>立即注册</Link>
      </p>
    </div>
  );
};

export default LoginPage;
