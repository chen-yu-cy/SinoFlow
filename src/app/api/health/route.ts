// FILE: src/app/api/health/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db/client";
import { getAppVersionInfo } from "@/lib/version";

export interface HealthCheckResponse {
  success: boolean;
  status: "ok" | "error";
  version: string;
  commitSha: string;
  timestamp: string;
  error?: string;
}

export async function GET(): Promise<NextResponse<HealthCheckResponse>> {
  const { version, commitSha } = getAppVersionInfo();

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      {
        success: true,
        status: "ok",
        version,
        commitSha,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Database healthcheck failed";
    return NextResponse.json(
      {
        success: false,
        status: "error",
        version,
        commitSha,
        timestamp: new Date().toISOString(),
        error: message,
      },
      { status: 500 }
    );
  }
}
