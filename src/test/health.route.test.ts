// FILE: src/test/health.route.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/health/route";
import prisma from "@/lib/db/client";
import { getRedisClient } from "@/lib/redis/client";

vi.mock("@/lib/redis/client", () => ({
  getRedisClient: vi.fn(),
  isRedisConnected: vi.fn(),
}));

describe("Health Check API Route (/api/health)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getRedisClient as ReturnType<typeof vi.fn>).mockReturnValue(null);
  });

  it("当数据库连接正常时应返回 200、status: ok 以及版本信息", async () => {
    (prisma.$queryRaw as ReturnType<typeof vi.fn>).mockResolvedValueOnce([{ "?column?": 1 }]);

    const req = new Request("http://localhost:3000/api/health");
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.status).toBe("ok");
    expect(body.version).toBeDefined();
    expect(body.commitSha).toBeDefined();
    expect(body.timestamp).toBeDefined();
    expect(body.services.database).toBe("ok");
    expect(body.services.redis).toBe("skipped");
  });

  it("当数据库连接异常时应返回 500、脱敏后的错误信息以及版本信息，同时避免泄漏内网敏感错误栈", async () => {
    (prisma.$queryRaw as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Connection refused at 10.0.1.12:5432"));

    const req = new Request("http://localhost:3000/api/health");
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.status).toBe("error");
    expect(body.version).toBeDefined();
    expect(body.commitSha).toBeDefined();
    // 验证安全脱敏：不泄漏 10.0.1.12:5432 等底层内网拓扑
    expect(body.error).toBe("Database service unavailable");
    expect(body.services.database).toBe("error");
  });

  it("当请求携带 ?format=prometheus 时应返回 200 与 Prometheus 文本格式指标", async () => {
    (prisma.$queryRaw as ReturnType<typeof vi.fn>).mockResolvedValueOnce([{ "?column?": 1 }]);

    const req = new Request("http://localhost:3000/api/health?format=prometheus");
    const response = await GET(req);
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/plain");
    expect(text).toContain("sinoflow_app_healthy{");
    expect(text).toContain("} 1");
    expect(text).toContain("sinoflow_db_healthy 1");
    expect(text).toContain("sinoflow_health_duration_seconds ");
  });

  it("当数据库故障且请求为 Prometheus 格式时应返回 500 与健康值为 0 的指标", async () => {
    (prisma.$queryRaw as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("DB Down"));

    const req = new Request("http://localhost:3000/api/health?format=prometheus");
    const response = await GET(req);
    const text = await response.text();

    expect(response.status).toBe(500);
    expect(text).toContain("sinoflow_app_healthy{");
    expect(text).toContain("} 0");
    expect(text).toContain("sinoflow_db_healthy 0");
  });

  it("当客户端发送 Accept: text/plain 请求时应识别并返回 Prometheus 文本指标", async () => {
    (prisma.$queryRaw as ReturnType<typeof vi.fn>).mockResolvedValueOnce([{ "?column?": 1 }]);

    const req = new Request("http://localhost:3000/api/health", {
      headers: { accept: "text/plain; version=0.0.4" },
    });
    const response = await GET(req);
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toContain("sinoflow_app_healthy");
    expect(text).toContain("sinoflow_db_healthy 1");
  });

  it("当 Redis 连通并成功响应 PONG 时，指标中正确体现 redisHealthy = 1", async () => {
    (prisma.$queryRaw as ReturnType<typeof vi.fn>).mockResolvedValueOnce([{ "?column?": 1 }]);
    const mockRedis = {
      ping: vi.fn().mockResolvedValue("PONG"),
    };
    (getRedisClient as ReturnType<typeof vi.fn>).mockReturnValue(mockRedis);

    const req = new Request("http://localhost:3000/api/health?format=prometheus");
    const response = await GET(req);
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toContain("sinoflow_redis_healthy 1");
  });

  it("当 Redis 响应异常时，指标中正确体现 redisHealthy = 0", async () => {
    (prisma.$queryRaw as ReturnType<typeof vi.fn>).mockResolvedValueOnce([{ "?column?": 1 }]);
    const mockRedis = {
      ping: vi.fn().mockRejectedValue(new Error("Redis offline")),
    };
    (getRedisClient as ReturnType<typeof vi.fn>).mockReturnValue(mockRedis);

    const req = new Request("http://localhost:3000/api/health?format=prometheus");
    const response = await GET(req);
    const text = await response.text();

    expect(response.status).toBe(200); // 整体由 DB 主导，但 redis 为 0
    expect(text).toContain("sinoflow_redis_healthy 0");
  });

  it("当浏览器请求 Accept: text/html 时应返回精致的 HTML 监控页面与 GitHub 仓库/Commit 链接", async () => {
    (prisma.$queryRaw as ReturnType<typeof vi.fn>).mockResolvedValueOnce([{ "?column?": 1 }]);
    process.env.GIT_SHA = "a1b2c3d4e5f6";

    const req = new Request("http://localhost:3000/api/health", {
      headers: { accept: "text/html,application/xhtml+xml" },
    });
    const response = await GET(req);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
    expect(html).toContain("SinoFlow Health");
    expect(html).toContain("ALL SYSTEMS OPERATIONAL");
    expect(html).toContain("https://github.com/chen-yu-cy/SinoFlow/commit/a1b2c3d4e5f6");
    expect(html).toContain("PostgreSQL Database");
    expect(html).toContain("Redis Cache");

    delete process.env.GIT_SHA;
  });

  it("当通过 ?format=json 显式请求时应强制返回 JSON 即使带了 text/html Accept 头", async () => {
    (prisma.$queryRaw as ReturnType<typeof vi.fn>).mockResolvedValueOnce([{ "?column?": 1 }]);

    const req = new Request("http://localhost:3000/api/health?format=json", {
      headers: { accept: "text/html" },
    });
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.services.system.runtime).toBe("Node.js (Serverless/Container)");
    expect(body.serviceDetails.database.status).toBe("ok");
  });
});
