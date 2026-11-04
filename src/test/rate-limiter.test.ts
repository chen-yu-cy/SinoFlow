// FILE: src/test/rate-limiter.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  checkRateLimit,
  _resetInMemoryRateLimiter,
  RATE_LIMIT_POLICIES,
} from "@/lib/security/rate-limiter";
import * as redisClientModule from "@/lib/redis/client";

describe("Rate Limiter System Tests", () => {
  beforeEach(() => {
    _resetInMemoryRateLimiter();
    vi.restoreAllMocks();
  });

  describe("In-Memory Fallback Rate Limiter", () => {
    it("未超限时应放行并正确递减剩余次数", async () => {
      // 模拟 Redis 未连接，走内存降级
      vi.spyOn(redisClientModule, "getRedisClient").mockReturnValue(null);
      vi.spyOn(redisClientModule, "isRedisConnected").mockReturnValue(false);

      const res1 = await checkRateLimit("user-1", "AUTH");
      expect(res1.success).toBe(true);
      expect(res1.limit).toBe(RATE_LIMIT_POLICIES.AUTH.limit);
      expect(res1.remaining).toBe(RATE_LIMIT_POLICIES.AUTH.limit - 1);

      const res2 = await checkRateLimit("user-1", "AUTH");
      expect(res2.success).toBe(true);
      expect(res2.remaining).toBe(RATE_LIMIT_POLICIES.AUTH.limit - 2);
    });

    it("超过 AUTH 策略限制（5次）时应拦截并返回 429 信息", async () => {
      vi.spyOn(redisClientModule, "getRedisClient").mockReturnValue(null);
      vi.spyOn(redisClientModule, "isRedisConnected").mockReturnValue(false);

      const limit = RATE_LIMIT_POLICIES.AUTH.limit;
      for (let i = 0; i < limit; i++) {
        const res = await checkRateLimit("attacker-ip", "AUTH");
        expect(res.success).toBe(true);
      }

      // 第 6 次请求应被拦截
      const blockedRes = await checkRateLimit("attacker-ip", "AUTH");
      expect(blockedRes.success).toBe(false);
      expect(blockedRes.remaining).toBe(0);
      expect(blockedRes.resetSeconds).toBeGreaterThan(0);
    });

    it("不同标识符之间互不影响", async () => {
      vi.spyOn(redisClientModule, "getRedisClient").mockReturnValue(null);
      vi.spyOn(redisClientModule, "isRedisConnected").mockReturnValue(false);

      const limit = RATE_LIMIT_POLICIES.AUTH.limit;
      for (let i = 0; i < limit; i++) {
        await checkRateLimit("user-a", "AUTH");
      }

      // user-a 被封禁
      expect((await checkRateLimit("user-a", "AUTH")).success).toBe(false);

      // user-b 仍正常可用
      const userBRes = await checkRateLimit("user-b", "AUTH");
      expect(userBRes.success).toBe(true);
      expect(userBRes.remaining).toBe(limit - 1);
    });
  });

  describe("Redis Lua Sliding Window Rate Limiter", () => {
    it("Redis 正常响应时应通过 EVAL 返回放行状态", async () => {
      const mockEval = vi.fn().mockResolvedValue([1, 4]); // [allowed=1, remaining=4]
      const mockRedis = { eval: mockEval, status: "ready" } as any;

      vi.spyOn(redisClientModule, "getRedisClient").mockReturnValue(mockRedis);
      vi.spyOn(redisClientModule, "isRedisConnected").mockReturnValue(true);

      const res = await checkRateLimit("192.168.1.100", "ACTION");
      expect(res.success).toBe(true);
      expect(res.remaining).toBe(4);
      expect(mockEval).toHaveBeenCalled();
    });

    it("Redis EVAL 报告超限时应返回拦截状态", async () => {
      const mockEval = vi.fn().mockResolvedValue([0, 0]); // [allowed=0, remaining=0]
      const mockRedis = { eval: mockEval, status: "ready" } as any;

      vi.spyOn(redisClientModule, "getRedisClient").mockReturnValue(mockRedis);
      vi.spyOn(redisClientModule, "isRedisConnected").mockReturnValue(true);

      const res = await checkRateLimit("192.168.1.100", "ACTION");
      expect(res.success).toBe(false);
      expect(res.remaining).toBe(0);
    });

    it("Redis 执行异常时应平滑静默降级为本地内存限流", async () => {
      const mockEval = vi.fn().mockRejectedValue(new Error("Redis connection lost"));
      const mockRedis = { eval: mockEval, status: "ready" } as any;

      vi.spyOn(redisClientModule, "getRedisClient").mockReturnValue(mockRedis);
      vi.spyOn(redisClientModule, "isRedisConnected").mockReturnValue(true);

      // 第一次调用触发降级
      const res = await checkRateLimit("degrade-user", "GLOBAL");
      expect(res.success).toBe(true);
      expect(res.limit).toBe(RATE_LIMIT_POLICIES.GLOBAL.limit);
    });
  });
});
