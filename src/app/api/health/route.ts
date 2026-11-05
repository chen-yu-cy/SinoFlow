// FILE: src/app/api/health/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db/client";
import { getAppVersionInfo } from "@/lib/version";
import { getRedisClient } from "@/lib/redis/client";

export interface ServiceHealthDetail {
  status: "ok" | "error" | "skipped";
  latencyMs?: number;
  message?: string;
}

export interface HealthCheckResponse {
  success: boolean;
  status: "ok" | "error";
  version: string;
  commitSha: string;
  commitUrl?: string;
  repoUrl: string;
  timestamp: string;
  error?: string;
  services?: {
    database: "ok" | "error";
    redis: "ok" | "error" | "skipped";
    system?: {
      nodeVersion: string;
      platform: string;
      uptimeSeconds: number;
    };
  };
  serviceDetails?: {
    database: ServiceHealthDetail;
    redis: ServiceHealthDetail;
  };
  durationMs?: number;
}

function renderHealthHtml(data: HealthCheckResponse, isHealthy: boolean): string {
  const isOk = isHealthy && data.status === "ok";
  const statusColor = isOk ? "#10b981" : "#ef4444";
  const statusBg = isOk ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)";
  const statusBorder = isOk ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)";
  const statusText = isOk ? "ALL SYSTEMS OPERATIONAL" : "SYSTEM DEGRADED";

  const dbDetail = data.serviceDetails?.database;
  const redisDetail = data.serviceDetails?.redis;

  const dbColor = dbDetail?.status === "ok" ? "#10b981" : "#ef4444";
  const redisColor =
    redisDetail?.status === "ok" ? "#10b981" : redisDetail?.status === "skipped" ? "#94a3b8" : "#ef4444";

  const commitLink = data.commitUrl
    ? `<a href="${data.commitUrl}" target="_blank" rel="noopener noreferrer" class="link-commit">${data.commitSha} ↗</a>`
    : `<span class="badge-plain">${data.commitSha}</span>`;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>SinoFlow · 平台健康与运行状态</title>
  <link rel="icon" href="/icon.svg" type="image/svg+xml" />
  <style>
    :root {
      --bg: #0b0f17;
      --card-bg: rgba(22, 30, 46, 0.7);
      --card-border: rgba(255, 255, 255, 0.08);
      --text-main: #f8fafc;
      --text-sub: #94a3b8;
      --accent: #b91c1c;
      --accent-glow: rgba(185, 28, 28, 0.25);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Noto Sans SC", sans-serif;
      background: radial-gradient(circle at 50% 0%, #1e293b 0%, #0b0f17 70%);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
    }
    .container {
      width: 100%;
      max-width: 720px;
      backdrop-filter: blur(16px);
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      padding: 2.25rem;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5), 0 0 50px -10px var(--accent-glow);
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 1.5rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .logo-group {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }
    .logo-seal {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #b91c1c, #7f1d1d);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: #fff;
      font-size: 1.1rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .title {
      font-size: 1.35rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .subtitle {
      font-size: 0.8rem;
      color: var(--text-sub);
    }
    .overall-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: ${statusBg};
      border: 1px solid ${statusBorder};
      color: ${statusColor};
      padding: 0.5rem 1rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${statusColor};
      box-shadow: 0 0 10px ${statusColor};
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
      margin-bottom: 1.75rem;
    }
    .service-card {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 1.15rem 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: border-color 0.2s ease;
    }
    .service-card:hover {
      border-color: rgba(255, 255, 255, 0.16);
    }
    .service-info h4 {
      font-size: 0.95rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .service-info p {
      font-size: 0.75rem;
      color: var(--text-sub);
    }
    .status-tag {
      font-size: 0.78rem;
      font-weight: 700;
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      text-transform: uppercase;
    }
    .meta-list {
      background: rgba(15, 23, 42, 0.4);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 1.25rem;
      font-size: 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .meta-label {
      color: var(--text-sub);
    }
    .meta-value {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-weight: 500;
      color: var(--text-main);
    }
    .link-commit {
      color: #60a5fa;
      text-decoration: none;
      background: rgba(96, 165, 250, 0.12);
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      border: 1px solid rgba(96, 165, 250, 0.25);
      transition: all 0.2s;
    }
    .link-commit:hover {
      background: rgba(96, 165, 250, 0.22);
      border-color: #60a5fa;
    }
    .badge-plain {
      background: rgba(255, 255, 255, 0.08);
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
    }
    .footer {
      margin-top: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
      color: var(--text-sub);
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .footer-links a {
      color: var(--text-sub);
      text-decoration: none;
      margin-left: 1rem;
      transition: color 0.2s;
    }
    .footer-links a:hover {
      color: var(--text-main);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-group">
        <div class="logo-seal">华</div>
        <div>
          <h1 class="title">SinoFlow Health</h1>
          <p class="subtitle">线上汉语教学平台服务探针与运行时监控</p>
        </div>
      </div>
      <div class="overall-badge">
        <span class="pulse-dot"></span>
        ${statusText}
      </div>
    </div>

    <div class="services-grid">
      <!-- Database Card -->
      <div class="service-card">
        <div class="service-info">
          <h4>🗄️ PostgreSQL Database</h4>
          <p>主数据库连接与核心数据持久化</p>
        </div>
        <div class="status-tag" style="background: ${dbColor}22; color: ${dbColor}; border: 1px solid ${dbColor}44;">
          ${dbDetail?.status.toUpperCase() || "UNKNOWN"}
          ${dbDetail?.latencyMs !== undefined ? ` · ${dbDetail.latencyMs}ms` : ""}
        </div>
      </div>

      <!-- Redis Card -->
      <div class="service-card">
        <div class="service-info">
          <h4>⚡ Redis Cache & RateLimiter</h4>
          <p>高频课程查询与限流熔断高速缓存</p>
        </div>
        <div class="status-tag" style="background: ${redisColor}22; color: ${redisColor}; border: 1px solid ${redisColor}44;">
          ${redisDetail?.status.toUpperCase() || "SKIPPED"}
          ${redisDetail?.latencyMs !== undefined ? ` · ${redisDetail.latencyMs}ms` : ""}
        </div>
      </div>
    </div>

    <div class="meta-list">
      <div class="meta-row">
        <span class="meta-label">应用版本 (Version)</span>
        <span class="meta-value">v${data.version}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Git Commit 指针</span>
        <span class="meta-value">${commitLink}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">探针总耗时 (Latency)</span>
        <span class="meta-value">${data.durationMs ?? 0} ms</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">系统运行时间 (Uptime)</span>
        <span class="meta-value">${Math.floor(data.services?.system?.uptimeSeconds || 0)} 秒</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Node / 架构环境</span>
        <span class="meta-value">${data.services?.system?.nodeVersion || "unknown"} (${data.services?.system?.platform || "linux"})</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">最新检测时间 (UTC)</span>
        <span class="meta-value">${data.timestamp}</span>
      </div>
    </div>

    <div class="footer">
      <div>自动探测刷新：每 10 秒</div>
      <div class="footer-links">
        <a href="/api/health?format=json">JSON Raw 数据</a>
        <a href="/api/health?format=prometheus">Prometheus 指标</a>
        <a href="${data.repoUrl}" target="_blank" rel="noopener noreferrer">GitHub 仓库 ↗</a>
      </div>
    </div>
  </div>
  <script>
    // 页面每 10 秒平滑轻量刷新一次健康状态
    setTimeout(() => {
      window.location.reload();
    }, 10000);
  </script>
</body>
</html>`;
}

export async function GET(
  req: Request
): Promise<NextResponse<HealthCheckResponse> | NextResponse<string>> {
  const startTime = performance.now();
  const { version, commitSha, commitUrl, repoUrl } = getAppVersionInfo();

  let dbHealthy = false;
  let dbError: string | undefined;
  let dbLatencyMs = 0;

  let redisHealthy = true;
  let redisStatus: "ok" | "error" | "skipped" = "skipped";
  let redisLatencyMs: number | undefined;

  // 1. 检查 PostgreSQL
  const dbStart = performance.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbHealthy = true;
    dbLatencyMs = Math.round(performance.now() - dbStart);
  } catch (error: unknown) {
    dbHealthy = false;
    dbError = error instanceof Error ? error.message : "Database healthcheck failed";
    dbLatencyMs = Math.round(performance.now() - dbStart);
  }

  // 2. 检查 Redis
  const redisClient = getRedisClient();
  if (redisClient) {
    const redisStart = performance.now();
    try {
      const pong = await Promise.race([
        redisClient.ping(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Redis ping timeout")), 1500)
        ),
      ]);
      redisLatencyMs = Math.round(performance.now() - redisStart);
      if (pong === "PONG") {
        redisStatus = "ok";
        redisHealthy = true;
      } else {
        redisStatus = "error";
        redisHealthy = false;
      }
    } catch {
      redisLatencyMs = Math.round(performance.now() - redisStart);
      redisStatus = "error";
      redisHealthy = false;
    }
  }

  const isHealthy = dbHealthy;
  const overallStatus: "ok" | "error" = isHealthy ? "ok" : "error";
  const durationMs = performance.now() - startTime;

  const url = req?.url ? new URL(req.url) : null;
  const acceptHeader = req?.headers?.get("accept") || "";
  const formatQuery = url?.searchParams.get("format");

  // 3. Prometheus 指标探测适配
  const isPrometheus =
    formatQuery === "prometheus" ||
    acceptHeader.includes("text/plain") ||
    acceptHeader.includes("application/openmetrics-text");

  if (isPrometheus) {
    const lines = [
      "# HELP sinoflow_app_healthy Core App business health status (1 = healthy, 0 = error)",
      "# TYPE sinoflow_app_healthy gauge",
      `sinoflow_app_healthy{version="${version}",commit="${commitSha}",status="${overallStatus}"} ${isHealthy ? 1 : 0}`,
      "",
      "# HELP sinoflow_db_healthy PostgreSQL database connection probe (1 = connected, 0 = disconnected)",
      "# TYPE sinoflow_db_healthy gauge",
      `sinoflow_db_healthy ${dbHealthy ? 1 : 0}`,
      "",
      "# HELP sinoflow_redis_healthy Redis cache connection probe (1 = connected/skipped, 0 = error)",
      "# TYPE sinoflow_redis_healthy gauge",
      `sinoflow_redis_healthy ${redisHealthy ? 1 : 0}`,
      "",
      "# HELP sinoflow_health_duration_seconds End-to-end health probe execution latency in seconds",
      "# TYPE sinoflow_health_duration_seconds gauge",
      `sinoflow_health_duration_seconds ${(durationMs / 1000).toFixed(4)}`,
      "",
    ];

    return new NextResponse(lines.join("\n"), {
      status: isHealthy ? 200 : 500,
      headers: {
        "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    }) as NextResponse<string>;
  }

  const healthData: HealthCheckResponse = {
    success: isHealthy,
    status: overallStatus,
    version,
    commitSha,
    commitUrl,
    repoUrl,
    timestamp: new Date().toISOString(),
    services: {
      database: dbHealthy ? "ok" : "error",
      redis: redisStatus,
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        uptimeSeconds: process.uptime ? process.uptime() : 0,
      },
    },
    serviceDetails: {
      database: {
        status: dbHealthy ? "ok" : "error",
        latencyMs: dbLatencyMs,
        ...(dbError ? { message: dbError } : {}),
      },
      redis: {
        status: redisStatus,
        latencyMs: redisLatencyMs,
      },
    },
    durationMs: Math.round(durationMs),
    ...(dbError ? { error: dbError } : {}),
  };

  // 4. 浏览器访问（Accept 包含 text/html 且未明确要求 ?format=json 时渲染专属美观的监控看板界面）
  const wantsHtml =
    formatQuery === "html" ||
    (acceptHeader.includes("text/html") && formatQuery !== "json");

  if (wantsHtml) {
    const html = renderHealthHtml(healthData, isHealthy);
    return new NextResponse(html, {
      status: isHealthy ? 200 : 500,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    }) as NextResponse<string>;
  }

  // 5. 默认返回结构化 JSON
  return NextResponse.json(healthData, {
    status: isHealthy ? 200 : 500,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
