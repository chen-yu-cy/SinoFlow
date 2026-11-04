// FILE: src/test/rate-limit-guard.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { enforceRateLimit } from "@/lib/security/rate-limit-guard";
import { getClientIp } from "@/lib/security/ip";
import * as rateLimiterModule from "@/lib/security/rate-limiter";

describe("Rate Limit Guard & IP Tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getClientIp", () => {
    it("应正确解析 x-forwarded-for 中的第一个客户端 IP", () => {
      const req = new Request("http://localhost/api/test", {
        headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18, 150.172.238.178" },
      });
      expect(getClientIp(req)).toBe("203.0.113.195");
    });

    it("当没有 x-forwarded-for 时，应退回使用 x-real-ip", () => {
      const req = new Request("http://localhost/api/test", {
        headers: { "x-real-ip": "198.51.100.1" },
      });
      expect(getClientIp(req)).toBe("198.51.100.1");
    });

    it("当无任何 IP 头信息时，应安全退回 127.0.0.1", () => {
      const req = new Request("http://localhost/api/test");
      expect(getClientIp(req)).toBe("127.0.0.1");
    });
  });

  describe("enforceRateLimit", () => {
    it("未达到限额时应返回 blocked: false", async () => {
      vi.spyOn(rateLimiterModule, "checkRateLimit").mockResolvedValue({
        success: true,
        limit: 10,
        remaining: 9,
        resetSeconds: 60,
      });

      const req = new Request("http://localhost/api/payment", { method: "POST" });
      const result = await enforceRateLimit(req, "ACTION", "user-123");

      expect(result.blocked).toBe(false);
      expect(result.remaining).toBe(9);
      expect(result.response).toBeUndefined();
    });

    it("达到限额时应返回 blocked: true 以及 429 NextResponse", async () => {
      vi.spyOn(rateLimiterModule, "checkRateLimit").mockResolvedValue({
        success: false,
        limit: 10,
        remaining: 0,
        resetSeconds: 45,
      });

      const req = new Request("http://localhost/api/payment", { method: "POST" });
      const result = await enforceRateLimit(req, "ACTION", "user-123");

      expect(result.blocked).toBe(true);
      expect(result.response).toBeDefined();
      expect(result.response?.status).toBe(429);
      expect(result.response?.headers.get("Retry-After")).toBe("45");
      expect(result.response?.headers.get("X-RateLimit-Limit")).toBe("10");
    });
  });
});
