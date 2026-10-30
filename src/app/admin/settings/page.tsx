import React from "react";
import { Settings as SettingsIcon, Globe, Bell, ShieldCheck } from "lucide-react";

const AdminSettingsPage = () => {
  return (
    <div style={{ maxWidth: "800px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h3>系统设置</h3>
        <p style={{ color: "#6c757d", fontSize: "0.9rem" }}>配置 SinoFlow 平台的全局参数及安全选项。</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <section style={{ background: "#fff", padding: "2rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <Globe size={20} color="var(--primary)" />
            <h4 style={{ margin: 0 }}>基础配置</h4>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "#495057" }}>平台名称</label>
              <input type="text" defaultValue="SinoFlow" style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #ddd" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "#495057" }}>官方联系邮箱</label>
              <input type="email" defaultValue="contact@sinoflow.cn" style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #ddd" }} />
            </div>
          </div>
        </section>

        <section style={{ background: "#fff", padding: "2rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <ShieldCheck size={20} color="#40c057" />
            <h4 style={{ margin: 0 }}>安全设置</h4>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", background: "#f8f9fa", borderRadius: "8px" }}>
            <div>
              <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>维护模式</div>
              <div style={{ fontSize: "0.8rem", color: "#6c757d" }}>开启后，普通学员将无法访问课程内容，仅管理员可见。</div>
            </div>
            <div style={{ width: "40px", height: "20px", background: "#adb5bd", borderRadius: "10px", position: "relative" }}>
              <div style={{ width: "16px", height: "16px", background: "#fff", borderRadius: "50%", position: "absolute", left: "2px", top: "2px" }}></div>
            </div>
          </div>
        </section>
        
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="btn-primary" style={{ padding: "0.75rem 3rem" }}>保存更改</button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
