// FILE: src/lib/auth-impersonate.ts
import crypto from "crypto";

const AUTH_SECRET = process.env.AUTH_SECRET || "default_secret";

/**
 * 生成临时模拟登录 Token (HMAC-SHA256)
 * @param email 目标学员的注册邮箱
 * @param adminEmail 操作管理员的邮箱 (可选)
 * @returns 包含操作人、过期时间戳与 HMAC 签名的 Token 字符串
 */
export function generateImpersonationToken(email: string, adminEmail: string = ""): string {
  const expiresAt = Date.now() + 60 * 1000; // 60 秒有效时间
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(`${email}:${adminEmail}:${expiresAt}`)
    .digest("hex");
  return `${adminEmail}:${expiresAt}:${signature}`;
}

/**
 * 验证模拟登录 Token 的有效性并解析管理员邮箱
 * @param email 目标学员的注册邮箱
 * @param token 待校验的 Token 字符串
 * @returns 包含验证状态与原管理员邮箱的返回结果
 */
export function verifyImpersonationToken(
  email: string,
  token: string
): { isValid: boolean; adminEmail: string | null } {
  try {
    const [adminEmail, expiresAtStr, signature] = token.split(":");
    const expiresAt = parseInt(expiresAtStr, 10);
    
    // 检查时效性
    if (isNaN(expiresAt) || expiresAt < Date.now()) {
      return { isValid: false, adminEmail: null };
    }

    const expectedSignature = crypto
      .createHmac("sha256", AUTH_SECRET)
      .update(`${email}:${adminEmail}:${expiresAt}`)
      .digest("hex");
    
    // 安全地进行时间常数对比，防范时序攻击
    const sigBuffer = Buffer.from(signature, "hex");
    const expSigBuffer = Buffer.from(expectedSignature, "hex");
    
    if (sigBuffer.length !== expSigBuffer.length) {
      return { isValid: false, adminEmail: null };
    }

    const isValid = crypto.timingSafeEqual(sigBuffer, expSigBuffer);
    return {
      isValid,
      adminEmail: isValid && adminEmail ? adminEmail : null
    };
  } catch (error) {
    return { isValid: false, adminEmail: null };
  }
}
