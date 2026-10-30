// FILE: src/test/health.route.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/health/route";
import prisma from "@/lib/db/client";

describe("Health Check API Route (/api/health)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("当数据库连接正常时应返回 200、status: ok 以及版本信息", async () => {
    (prisma.$queryRaw as ReturnType<typeof vi.fn>).mockResolvedValueOnce([{ "?column?": 1 }]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.status).toBe("ok");
    expect(body.version).toBeDefined();
    expect(body.commitSha).toBeDefined();
    expect(body.timestamp).toBeDefined();
  });

  it("当数据库连接异常时应返回 500、错误信息以及版本信息", async () => {
    (prisma.$queryRaw as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Connection refused"));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.status).toBe("error");
    expect(body.version).toBeDefined();
    expect(body.commitSha).toBeDefined();
    expect(body.error).toBe("Connection refused");
  });
});
