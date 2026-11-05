// FILE: src/test/admin-monitoring.test.tsx
import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AdminMonitoringPage from "@/app/admin/monitoring/page";

describe("AdminMonitoringPage Component", () => {
  it("应该正确渲染标题与监控说明", () => {
    render(<AdminMonitoringPage />);
    expect(screen.getByText("视频流量与访问监控大盘")).toBeDefined();
    expect(
      screen.getByText(/基于 Caddy 反向代理网关日志与 Promtail \+ Loki 实时流/)
    ).toBeDefined();
  });

  it("应该渲染外链打开 Grafana 的链接和刷新按钮", () => {
    render(<AdminMonitoringPage />);
    const link = screen.getByRole("link", { name: /在新标签页打开 Grafana/i });
    expect(link).toBeDefined();
    expect(link.getAttribute("href")).toContain(":3001/d/sinoflow-traffic");

    const refreshBtn = screen.getByRole("button", { name: /刷新大屏/i });
    expect(refreshBtn).toBeDefined();
  });

  it("应该渲染嵌入式 Grafana iframe 容器", () => {
    render(<AdminMonitoringPage />);
    const iframe = screen.getByTitle("SinoFlow Traffic Dashboard");
    expect(iframe).toBeDefined();
    expect(iframe.getAttribute("src")).toContain(":3001/d/sinoflow-traffic");
  });

  it("应该支持在大屏标签页间切换到硬件与容器性能监控", () => {
    render(<AdminMonitoringPage />);
    const hardwareTabBtn = screen.getByRole("button", { name: /硬件与容器性能/i });
    expect(hardwareTabBtn).toBeDefined();
    fireEvent.click(hardwareTabBtn);

    const iframe = screen.getByTitle("SinoFlow Hardware Dashboard");
    expect(iframe).toBeDefined();
    expect(iframe.getAttribute("src")).toContain(":3001/d/sinoflow-hardware");
  });
});
