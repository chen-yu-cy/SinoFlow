// FILE: src/app/admin/monitoring/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Activity, ExternalLink, ShieldCheck, HardDrive, RefreshCw } from "lucide-react";

export default function AdminMonitoringPage() {
  const [grafanaUrl, setGrafanaUrl] = useState<string>("http://localhost:3001/d/sinoflow-traffic");
  const [iframeKey, setIframeKey] = useState<number>(Date.now());

  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname || "localhost";
      const protocol = window.location.protocol || "http:";
      // 动态拼装同主机的 3001 端口 Grafana 地址
      setGrafanaUrl(`${protocol}//${host}:3001/d/sinoflow-traffic?kiosk=tv`);
    }
  }, []);

  const handleRefresh = () => {
    setIframeKey(Date.now());
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* 顶部标题与说明卡片 */}
      <div
        style={{
          background: "var(--surface-card, #fff)",
          padding: "1.5rem 2rem",
          borderRadius: "12px",
          boxShadow: "var(--card-shadow, 0 4px 12px rgba(0,0,0,0.05))",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "rgba(76, 110, 245, 0.1)",
                color: "#4c6ef5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Activity size={22} />
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "700", margin: 0, color: "var(--text-main, #212529)" }}>
              视频流量与访问监控大盘
            </h1>
          </div>
          <p style={{ margin: 0, color: "var(--text-muted, #6c757d)", fontSize: "0.9rem" }}>
            基于 Caddy 反向代理网关日志与 Promtail + Loki 实时流，精准采集视频切片传输字节数 (Range 206)、出网带宽及页面浏览量 (PV)。
          </p>
        </div>

        {/* 操作按钮区 */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button
            onClick={handleRefresh}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.6rem 1rem",
              borderRadius: "8px",
              border: "1px solid var(--border-color, #dee2e6)",
              background: "var(--surface-muted, #f8f9fa)",
              color: "var(--text-main, #495057)",
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            <RefreshCw size={16} /> 刷新大屏
          </button>
          <a
            href={grafanaUrl.replace("?kiosk=tv", "")}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.6rem 1.25rem",
              borderRadius: "8px",
              background: "var(--primary, #4c6ef5)",
              color: "#fff",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: "600",
              boxShadow: "0 2px 6px rgba(76, 110, 245, 0.3)",
            }}
          >
            <ExternalLink size={16} /> 在新标签页打开 Grafana
          </a>
        </div>
      </div>

      {/* 架构元数据信息栏 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1rem",
        }}
      >
        <div
          style={{
            background: "var(--surface-card, #fff)",
            padding: "1rem 1.25rem",
            borderRadius: "10px",
            border: "1px solid var(--border-color, #e9ecef)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <HardDrive size={20} color="#4c6ef5" />
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted, #868e96)" }}>采集管道 (Collector)</div>
            <div style={{ fontSize: "0.9rem", fontWeight: "600" }}>Caddy (JSON Access Log)</div>
          </div>
        </div>
        <div
          style={{
            background: "var(--surface-card, #fff)",
            padding: "1rem 1.25rem",
            borderRadius: "10px",
            border: "1px solid var(--border-color, #e9ecef)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <ShieldCheck size={20} color="#40c057" />
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted, #868e96)" }}>存储与索引 (Storage)</div>
            <div style={{ fontSize: "0.9rem", fontWeight: "600" }}>Grafana Loki (端口 3100)</div>
          </div>
        </div>
        <div
          style={{
            background: "var(--surface-card, #fff)",
            padding: "1rem 1.25rem",
            borderRadius: "10px",
            border: "1px solid var(--border-color, #e9ecef)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <Activity size={20} color="#fab005" />
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted, #868e96)" }}>默认登录账号凭证</div>
            <div style={{ fontSize: "0.9rem", fontWeight: "600" }}>admin / admin</div>
          </div>
        </div>
      </div>

      {/* 嵌入式 Grafana 视图 */}
      <div
        style={{
          background: "var(--surface-card, #fff)",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "var(--card-shadow, 0 4px 12px rgba(0,0,0,0.05))",
          minHeight: "750px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <iframe
          key={iframeKey}
          src={grafanaUrl}
          title="SinoFlow Traffic Dashboard"
          style={{
            width: "100%",
            height: "750px",
            border: "none",
            display: "block",
          }}
        />
      </div>
    </div>
  );
}
