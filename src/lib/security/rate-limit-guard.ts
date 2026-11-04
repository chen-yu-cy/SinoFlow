// FILE: src/lib/security/rate-limit-guard.ts
import { NextResponse } from "next/server";
import { checkRateLimit, type RateLimitPolicyName } from "./rate-limiter";
import { getClientIp } from "./ip";

export interface RateLimitCheckResult {
  blocked: boolean;
  response?: NextResponse;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

/**
 * 在 API 路由处理函数中执行限流守卫拦截
 * @param req Web 标准 Request 对象
 * @param policy 限流策略（AUTH | ACTION | ADMIN_PRESIGN | GLOBAL）
 * @param customIdentifier 自定义标识（如传入 userId，默认使用客户端 IP）
 */
export async function enforceRateLimit(
  req: Request,
  policy: RateLimitPolicyName = "GLOBAL",
  customIdentifier?: string
): Promise<RateLimitCheckResult> {
  const ip = getClientIp(req);
  const identifier = customIdentifier ? `${customIdentifier}:${ip}` : ip;

  const result = await checkRateLimit(identifier, policy);

  if (!result.success) {
    const errorResponse = NextResponse.json(
      {
        success: false,
        error: "请求过于频繁，请稍后再试 (Too Many Requests)",
        retryAfter: result.resetSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": result.resetSeconds.toString(),
          "X-RateLimit-Limit": result.limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": result.resetSeconds.toString(),
        },
      }
    );

    return {
      blocked: true,
      response: errorResponse,
      limit: result.limit,
      remaining: 0,
      resetSeconds: result.resetSeconds,
    };
  }

  return {
    blocked: false,
    limit: result.limit,
    remaining: result.remaining,
    resetSeconds: result.resetSeconds,
  };
}
