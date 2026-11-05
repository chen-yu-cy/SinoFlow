// FILE: src/app/api/health/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db/client";
import { getAppVersionInfo } from "@/lib/version";
import { getRedisClient } from "@/lib/redis/client";

export interface HealthCheckResponse {
  success: boolean;
  status: "ok" | "error";
  version: string;
  commitSha: string;
  timestamp: string;
  error?: string;
  services?: {
    database: "ok" | "error";
    redis: "ok" | "error" | "skipped";
  };
  durationMs?: number;
}

export async function GET(
  req: Request
): Promise<NextResponse<HealthCheckResponse> | NextResponse<string>> {
  const startTime = performance.now();
  const { version, commitSha } = getAppVersionInfo();

  let dbHealthy = false;
  let dbError: string | undefined;
  let redisHealthy = true;
  let redisStatus: "ok" | "error" | "skipped" = "skipped";

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbHealthy = true;
  } catch (error: unknown) {
    dbHealthy = false;
    dbError = error instanceof Error ? error.message : "Database healthcheck failed";
  }

  const redisClient = getRedisClient();
  if (redisClient) {
    try {
      const pong = await Promise.race([
        redisClient.ping(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Redis ping timeout")), 1500)
        ),
      ]);
      if (pong === "PONG") {
        redisStatus = "ok";
        redisHealthy = true;
      } else {
        redisStatus = "error";
        redisHealthy = false;
      }
    } catch {
      redisStatus = "error";
      redisHealthy = false;
    }
  }

  const isHealthy = dbHealthy;
  const overallStatus: "ok" | "error" = isHealthy ? "ok" : "error";
  const durationMs = performance.now() - startTime;

  // 检查是否为 Prometheus 探测请求（通过 ?format=prometheus 参数或 Accept 头判断）
  const url = req?.url ? new URL(req.url) : null;
  const acceptHeader = req?.headers?.get("accept") || "";
  const isPrometheus =
    url?.searchParams.get("format") === "prometheus" ||
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

  return NextResponse.json(
    {
      success: isHealthy,
      status: overallStatus,
      version,
      commitSha,
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealthy ? "ok" : "error",
        redis: redisStatus,
      },
      durationMs: Math.round(durationMs),
      ...(dbError ? { error: dbError } : {}),
    },
    {
      status: isHealthy ? 200 : 500,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    }
  );
}
