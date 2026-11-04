// FILE: src/lib/redis/client.ts
import Redis, { type RedisOptions } from "ioredis";
import { logger } from "@/lib/logger";

declare global {
  // eslint-disable-next-line no-var
  var __redisClient: Redis | undefined;
}

const REDIS_URL = process.env.REDIS_URL || "redis://:sinoflow_redis_pass@localhost:6379/0";

const defaultOptions: RedisOptions = {
  maxRetriesPerRequest: 1,
  connectTimeout: 3000,
  lazyConnect: true,
  retryStrategy(times: number) {
    if (times > 5) {
      // 停止持续高频重试，每 10 秒尝试重连一次
      return 10000;
    }
    return Math.min(times * 500, 2000);
  },
  reconnectOnError(err: Error) {
    const targetError = "READONLY";
    if (err.message.includes(targetError)) {
      // 当发生主从切换变只读时强制重连
      return true;
    }
    return false;
  },
};

let clientInstance: Redis | null = null;
let isConnected = false;

/**
 * 初始化并获取 Redis 客户端单例
 * 在生产环境与开发热重载环境下保持单一连接池
 */
export function getRedisClient(): Redis | null {
  if (process.env.NODE_ENV === "test" && !process.env.REDIS_URL) {
    // 单元测试若未显式指定 REDIS_URL，直接返回 null 触发内存降级
    return null;
  }

  if (globalThis.__redisClient) {
    return globalThis.__redisClient;
  }

  if (clientInstance) {
    return clientInstance;
  }

  try {
    const client = new Redis(REDIS_URL, defaultOptions);

    client.on("connect", () => {
      isConnected = true;
      logger.info({ url: REDIS_URL.replace(/:[^:@]+@/, ":***@") }, "Redis 连接成功");
    });

    client.on("ready", () => {
      isConnected = true;
    });

    client.on("error", (err: unknown) => {
      isConnected = false;
      const errMsg = err instanceof Error ? err.message : String(err);
      // 仅记录警告，避免未启动 Redis 时的开发环境或测试环境刷屏崩溃
      logger.warn({ error: errMsg }, "Redis 连接异常，系统将自动降级为本地内存与直接回源");
    });

    client.on("close", () => {
      isConnected = false;
    });

    // 尝试异步连接
    client.connect().catch((err: unknown) => {
      isConnected = false;
      const errMsg = err instanceof Error ? err.message : String(err);
      logger.warn({ error: errMsg }, "Redis 初始连接未就绪，开启降级模式");
    });

    clientInstance = client;
    if (process.env.NODE_ENV !== "production") {
      globalThis.__redisClient = client;
    }

    return client;
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger.error({ error: errMsg }, "创建 Redis 客户端实例失败");
    return null;
  }
}

/**
 * 检查当前 Redis 客户端是否处于可用连通状态
 */
export function isRedisConnected(): boolean {
  return isConnected && clientInstance !== null && clientInstance.status === "ready";
}

/**
 * 安全断开 Redis 连接（用于测试清理与优雅停机）
 */
export async function closeRedisConnection(): Promise<void> {
  const client = globalThis.__redisClient || clientInstance;
  if (client) {
    try {
      await client.quit();
    } catch {
      client.disconnect();
    } finally {
      globalThis.__redisClient = undefined;
      clientInstance = null;
      isConnected = false;
    }
  }
}
