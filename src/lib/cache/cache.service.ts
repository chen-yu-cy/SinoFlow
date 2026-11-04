// FILE: src/lib/cache/cache.service.ts
import { getRedisClient, isRedisConnected } from "@/lib/redis/client";
import { logger } from "@/lib/logger";

/**
 * 生产级缓存服务 (Cache-Aside 模式)
 * 职责：提供高性能数据缓存、自动过期与失效控制，具备断线静默降级与非阻塞扫描删除能力。
 */
export const CacheService = {
  /**
   * 获取指定缓存项
   */
  async get<T>(key: string): Promise<T | null> {
    const client = getRedisClient();
    if (!client || !isRedisConnected()) {
      return null;
    }

    try {
      const data = await client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      logger.warn({ error: errMsg, key }, "读取 Redis 缓存失败，降级为穿透");
      return null;
    }
  },

  /**
   * 写入指定缓存项并配置 TTL 过期时间
   */
  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const client = getRedisClient();
    if (!client || !isRedisConnected()) {
      return;
    }

    try {
      const serialized = JSON.stringify(value);
      await client.set(key, serialized, "EX", ttlSeconds);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      logger.warn({ error: errMsg, key }, "写入 Redis 缓存失败");
    }
  },

  /**
   * 显式删除一个或多个缓存项
   */
  async del(keys: string | string[]): Promise<void> {
    const client = getRedisClient();
    if (!client || !isRedisConnected()) {
      return;
    }

    try {
      const keyList = Array.isArray(keys) ? keys : [keys];
      if (keyList.length > 0) {
        await client.del(...keyList);
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      logger.warn({ error: errMsg, keys }, "删除 Redis 缓存键失败");
    }
  },

  /**
   * Cache-Aside 自动穿透查询封装
   * 若缓存命中则毫秒级直出；未命中则执行 fetcher 并回填 Redis
   * @param key 缓存键
   * @param ttlSeconds 缓存有效期（秒）
   * @param fetcher 穿透数据源获取函数（通常为 Prisma 数据库查询）
   */
  async getOrSet<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    // 缓存未命中或 Redis 断开，执行业务查询
    const freshData = await fetcher();

    // 异步回填缓存，不阻塞主业务响应
    if (freshData !== null && freshData !== undefined) {
      this.set<T>(key, freshData, ttlSeconds).catch(() => {});
    }

    return freshData;
  },

  /**
   * 基于游标非阻塞扫描并批量剔除匹配键 (SCAN 代替阻塞式的 KEYS)
   * @param pattern 键匹配规则，例如 'course:*'
   */
  async invalidatePattern(pattern: string): Promise<void> {
    const client = getRedisClient();
    if (!client || !isRedisConnected()) {
      return;
    }

    try {
      let cursor = "0";
      do {
        const [nextCursor, matchedKeys] = await client.scan(cursor, "MATCH", pattern, "COUNT", 100);
        cursor = nextCursor;
        if (matchedKeys.length > 0) {
          await client.del(...matchedKeys);
        }
      } while (cursor !== "0");
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      logger.warn({ error: errMsg, pattern }, "根据模式批量剔除 Redis 缓存键失败");
    }
  },
};
