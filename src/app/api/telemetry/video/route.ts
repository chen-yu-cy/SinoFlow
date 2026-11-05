// FILE: src/app/api/telemetry/video/route.ts
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { enforceRateLimit } from "@/lib/security/rate-limit-guard";
import {
  type VideoTelemetryPayload,
  MAX_BYTES_PER_REPORT,
  MAX_FRAGMENTS_PER_REPORT,
} from "@/lib/telemetry/video";

export async function POST(req: Request): Promise<NextResponse> {
  // 1. IP 频控防刷拦截（普通 API 限流：120 次/分钟）
  const rateLimit = await enforceRateLimit(req, "GLOBAL");
  if (rateLimit.blocked && rateLimit.response) {
    return rateLimit.response;
  }

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Payload must be an object" },
        { status: 400 }
      );
    }

    const payload = body as Partial<VideoTelemetryPayload>;

    const bytesLoaded = Number(payload.bytesLoaded);
    const fragmentsCount = Number(payload.fragmentsCount);
    const durationSeconds = payload.durationSeconds !== undefined ? Number(payload.durationSeconds) : 0;

    // 格式与边界校验：确保上报指标为非负有效数值
    if (isNaN(bytesLoaded) || bytesLoaded < 0 || !Number.isFinite(bytesLoaded)) {
      return NextResponse.json(
        { success: false, error: "Invalid bytesLoaded value" },
        { status: 400 }
      );
    }

    if (isNaN(fragmentsCount) || fragmentsCount < 0 || !Number.isFinite(fragmentsCount)) {
      return NextResponse.json(
        { success: false, error: "Invalid fragmentsCount value" },
        { status: 400 }
      );
    }

    // 熔断保护：单次上报指标超过合理极值时拒绝
    if (bytesLoaded > MAX_BYTES_PER_REPORT) {
      return NextResponse.json(
        { success: false, error: `Reported bytes exceed maximum threshold (${MAX_BYTES_PER_REPORT})` },
        { status: 400 }
      );
    }

    if (fragmentsCount > MAX_FRAGMENTS_PER_REPORT) {
      return NextResponse.json(
        { success: false, error: `Reported fragments exceed maximum threshold (${MAX_FRAGMENTS_PER_REPORT})` },
        { status: 400 }
      );
    }

    const sourceUrl = typeof payload.sourceUrl === "string" ? payload.sourceUrl.trim() : "";
    const isCdn = sourceUrl.startsWith("http://") || sourceUrl.startsWith("https://");

    // 结构化日志输出：用于 Promtail 采集并注入 Loki
    logger.info(
      {
        type: "video_telemetry",
        courseId: typeof payload.courseId === "string" ? payload.courseId : undefined,
        lessonId: typeof payload.lessonId === "string" ? payload.lessonId : undefined,
        bytesLoaded: Math.round(bytesLoaded),
        fragmentsCount: Math.round(fragmentsCount),
        durationSeconds: Math.round(durationSeconds * 100) / 100,
        sourceUrl: sourceUrl || undefined,
        delivery: isCdn ? "cdn" : "local",
      },
      "Video playback telemetry reported"
    );

    return NextResponse.json(
      { success: true },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    logger.error({ error: message }, "Failed to process video telemetry");
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
