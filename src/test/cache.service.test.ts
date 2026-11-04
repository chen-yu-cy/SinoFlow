// FILE: src/test/cache.service.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { CacheService } from "@/lib/cache/cache.service";
import * as redisClientModule from "@/lib/redis/client";

describe("Cache Service Tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("Cache-Aside getOrSet", () => {
    it("缓存命中时应直接返回缓存数据，且不触发 fetcher 函数", async () => {
      const mockCourse = { id: "c1", title: "Cached Course" };
      const mockGet = vi.fn().mockResolvedValue(JSON.stringify(mockCourse));
      const mockRedis = { get: mockGet, status: "ready" } as any;

      vi.spyOn(redisClientModule, "getRedisClient").mockReturnValue(mockRedis);
      vi.spyOn(redisClientModule, "isRedisConnected").mockReturnValue(true);

      const fetcher = vi.fn().mockResolvedValue({ id: "c1", title: "DB Course" });

      const result = await CacheService.getOrSet("course:c1", 300, fetcher);

      expect(result).toEqual(mockCourse);
      expect(mockGet).toHaveBeenCalledWith("course:c1");
      expect(fetcher).not.toHaveBeenCalled();
    });

    it("缓存未命中时应调用 fetcher 并回填 Redis", async () => {
      const freshData = { id: "c2", title: "Fresh Course from DB" };
      const mockGet = vi.fn().mockResolvedValue(null);
      const mockSet = vi.fn().mockResolvedValue("OK");
      const mockRedis = { get: mockGet, set: mockSet, status: "ready" } as any;

      vi.spyOn(redisClientModule, "getRedisClient").mockReturnValue(mockRedis);
      vi.spyOn(redisClientModule, "isRedisConnected").mockReturnValue(true);

      const fetcher = vi.fn().mockResolvedValue(freshData);

      const result = await CacheService.getOrSet("course:c2", 300, fetcher);

      expect(result).toEqual(freshData);
      expect(fetcher).toHaveBeenCalledTimes(1);
      expect(mockSet).toHaveBeenCalledWith("course:c2", JSON.stringify(freshData), "EX", 300);
    });

    it("Redis 断开时应静默降级直接执行 fetcher，绝不影响主流程", async () => {
      vi.spyOn(redisClientModule, "getRedisClient").mockReturnValue(null);
      vi.spyOn(redisClientModule, "isRedisConnected").mockReturnValue(false);

      const dbData = { id: "c3", title: "Fallback Course" };
      const fetcher = vi.fn().mockResolvedValue(dbData);

      const result = await CacheService.getOrSet("course:c3", 300, fetcher);

      expect(result).toEqual(dbData);
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it("空值防穿透：当 fetcher 返回 null 时，应缓存哨兵标记并设置 30 秒短 TTL", async () => {
      const mockGet = vi.fn().mockResolvedValue(null);
      const mockSet = vi.fn().mockResolvedValue("OK");
      const mockRedis = { get: mockGet, set: mockSet, status: "ready" } as any;

      vi.spyOn(redisClientModule, "getRedisClient").mockReturnValue(mockRedis);
      vi.spyOn(redisClientModule, "isRedisConnected").mockReturnValue(true);

      const fetcher = vi.fn().mockResolvedValue(null);

      const result = await CacheService.getOrSet("course:not-found-id", 300, fetcher);

      expect(result).toBeNull();
      expect(fetcher).toHaveBeenCalledTimes(1);
      // 应写入 NULL_CACHE_SENTINEL 且 TTL 为 30 秒
      expect(mockSet).toHaveBeenCalledWith("course:not-found-id", "__NULL_CACHE_SENTINEL__", "EX", 30);
    });

    it("空值防穿透：命中哨兵标记时，直接返回 null 且绝不调用 fetcher 回源查库", async () => {
      const mockGet = vi.fn().mockResolvedValue("__NULL_CACHE_SENTINEL__");
      const mockRedis = { get: mockGet, status: "ready" } as any;

      vi.spyOn(redisClientModule, "getRedisClient").mockReturnValue(mockRedis);
      vi.spyOn(redisClientModule, "isRedisConnected").mockReturnValue(true);

      const fetcher = vi.fn().mockResolvedValue({ id: "unexpected" });

      const result = await CacheService.getOrSet("course:not-found-id", 300, fetcher);

      expect(result).toBeNull();
      expect(fetcher).not.toHaveBeenCalled();
    });
  });

  describe("del & invalidatePattern", () => {
    it("del 应该正确删除指定的键", async () => {
      const mockDel = vi.fn().mockResolvedValue(1);
      const mockRedis = { del: mockDel, status: "ready" } as any;

      vi.spyOn(redisClientModule, "getRedisClient").mockReturnValue(mockRedis);
      vi.spyOn(redisClientModule, "isRedisConnected").mockReturnValue(true);

      await CacheService.del("course:c1");
      expect(mockDel).toHaveBeenCalledWith("course:c1");
    });

    it("invalidatePattern 应该通过 SCAN 游标非阻塞批量删除匹配的键", async () => {
      const mockScan = vi
        .fn()
        .mockResolvedValueOnce(["10", ["course:1", "course:2"]])
        .mockResolvedValueOnce(["0", ["course:3"]]);
      const mockDel = vi.fn().mockResolvedValue(1);
      const mockRedis = { scan: mockScan, del: mockDel, status: "ready" } as any;

      vi.spyOn(redisClientModule, "getRedisClient").mockReturnValue(mockRedis);
      vi.spyOn(redisClientModule, "isRedisConnected").mockReturnValue(true);

      await CacheService.invalidatePattern("course:*");

      expect(mockScan).toHaveBeenCalledTimes(2);
      expect(mockDel).toHaveBeenCalledWith("course:1", "course:2");
      expect(mockDel).toHaveBeenCalledWith("course:3");
    });
  });
});
