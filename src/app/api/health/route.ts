// FILE: src/app/api/health/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db/client";

export interface HealthCheckResponse {
  success: boolean;
  status: "ok" | "error";
  timestamp: string;
  error?: string;
}

export async function GET(): Promise<NextResponse<HealthCheckResponse>> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      {
        success: true,
        status: "ok",
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
        timestamp: new Date().toISOString(),
        error: message,
      },
      { status: 500 }
    );
  }
}
