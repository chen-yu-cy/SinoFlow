// FILE: src/lib/security/rate-limiter.ts
import { getRedisClient, isRedisConnected } from "@/lib/redis/client";
import { logger } from "@/lib/logger";

export interface RateLimitPolicy {
  limit: number;
  windowMs: number;
}

export type RateLimitPolicyName = "AUTH" | "ACTION" | "ADMIN_PRESIGN" | "GLOBAL";

export const RATE_LIMIT_POLICIES: Record<RateLimitPolicyName, RateLimitPolicy> = {
  // 敏感身份认证操作（防暴力破解、撞库）：5 次 / 60 秒
  AUTH: { limit: 5, windowMs: 60 * 1000 },
  // 关键业务动作（下单、工单提交等）：10 次 / 60 秒
  ACTION: { limit: 10, windowMs: 60 * 1000 },
  // 管理员直传预签名申请：30 次 / 60 秒
  ADMIN_PRESIGN: { limit: 30, windowMs: 60 * 1000 },
  // 全局 API 防刷（普通请求）：120 次 / 60 秒
  GLOBAL: { limit: 120, windowMs: 60 * 1000 },
};

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

/**
 * 本地内存滑动窗口降级存储
 * 用于 Redis 临时断开或未配置环境时的无缝安全降级
 */
const inMemoryStore = new Map<string, number[]>();

function checkInMemoryRateLimit(key: string, policy: RateLimitPolicy): RateLimitResult {
  const now = Date.now();
  const windowStart = now - policy.windowMs;

  const timestamps = (inMemoryStore.get(key) || []).filter((t) => t > windowStart);

  if (timestamps.length >= policy.limit) {
    const oldest = timestamps[0] || now;
    const resetSeconds = Math.max(1, Math.ceil((oldest + policy.windowMs - now) / 1000));
    return {
      success: false,
      limit: policy.limit,
      remaining: 0,
      resetSeconds,
    };
  }

  timestamps.push(now);
  inMemoryStore.set(key, timestamps);

  // 定期清理过期 key
  if (inMemoryStore.size > 10000) {
    for (const [k, v] of inMemoryStore.entries()) {
      const valid = v.filter((t) => t > windowStart);
      if (valid.length === 0) {
        inMemoryStore.delete(k);
      } else {
        inMemoryStore.set(k, valid);
      }
    }
  }

  return {
    success: true,
    limit: policy.limit,
    remaining: policy.limit - timestamps.length,
    resetSeconds: Math.ceil(policy.windowMs / 1000),
  };
}

/**
 * Redis Lua 原子脚本：滑动窗口算法
 * KEYS[1]: 键名 (带 {} Hash Tag 以兼容 Redis Cluster)
 * ARGV[1]: 当前时间戳 (毫秒)
 * ARGV[2]: 窗口大小 (毫秒)
 * ARGV[3]: 最大限制数
 * ARGV[4]: 键过期时间 (秒)
 */
const SLIDING_WINDOW_LUA = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local windowMs = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local expireSec = tonumber(ARGV[4])

local windowStart = now - windowMs

-- 1. 移除时间戳小于 windowStart 的过期请求
redis.call('ZREMRANGEBYSCORE', key, '-inf', windowStart)

-- 2. 统计当前窗口内剩余的请求总数
local currentCount = redis.call('ZCARD', key)

if currentCount < limit then
  -- 3. 未超限，记录本次请求并刷新过期时间
  local member = now .. '-' .. math.random(1000, 9999)
  redis.call('ZADD', key, now, member)
  redis.call('EXPIRE', key, expireSec)
  return {1, limit - currentCount - 1}
else
  -- 4. 超限拦截
  return {0, 0}
end
`;

/**
 * 执行分布式 API 限流检查
 * @param identifier 唯一识别标识（客户端真实 IP、用户 ID 或 API Key）
 * @param policyName 限流策略名称，默认为 'GLOBAL'
 */
export async function checkRateLimit(
  identifier: string,
  policyName: RateLimitPolicyName = "GLOBAL"
): Promise<RateLimitResult> {
  const policy = RATE_LIMIT_POLICIES[policyName] || RATE_LIMIT_POLICIES.GLOBAL;
  // 遵循 Redis Cluster Hash Tag 规范：{ratelimit:POLICY}:identifier
  const redisKey = `{ratelimit:${policyName}}:${identifier}`;

  const client = getRedisClient();

  // 若 Redis 未初始化或处于断开状态，平滑降级至本地内存滑动窗口
  if (!client || !isRedisConnected()) {
    return checkInMemoryRateLimit(redisKey, policy);
  }

  const now = Date.now();
  const expireSec = Math.ceil((policy.windowMs * 2) / 1000);

  try {
    const rawResult = (await client.eval(
      SLIDING_WINDOW_LUA,
      1,
      redisKey,
      now.toString(),
      policy.windowMs.toString(),
      policy.limit.toString(),
      expireSec.toString()
    )) as [number, number];

    const isAllowed = rawResult[0] === 1;
    const remaining = rawResult[1];

    return {
      success: isAllowed,
      limit: policy.limit,
      remaining: Math.max(0, remaining),
      resetSeconds: Math.ceil(policy.windowMs / 1000),
    };
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger.warn({ error: errMsg, redisKey }, "Redis 执行限流 Lua 脚本异常，降级为本地内存");
    return checkInMemoryRateLimit(redisKey, policy);
  }
}

/**
 * 仅用于单元测试：清空本地内存限流器状态
 */
export function _resetInMemoryRateLimiter(): void {
  inMemoryStore.clear();
}
