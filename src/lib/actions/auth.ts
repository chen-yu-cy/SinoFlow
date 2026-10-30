// FILE: src/lib/actions/auth.ts
"use server";

import { auth } from "@/lib/auth";
import { UserService } from "@/lib/services/user.service";
import { logger } from "@/lib/logger";

/**
 * 身份验证与用户管理 Server Actions
 * 职责：作为 Web 前端的入口层，处理 HTTP/Action 副作用，权限验证，并调用 Service 核心层。
 */

/**
 * 注册新用户 Action
 * @param formData 包含 name, email, password 的表单对象
 */
export async function registerUser(formData: FormData) {
  logger.info("[Auth Action] 开始处理注册请求...");
  
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    // 委托给 Service 层处理注册逻辑
    await UserService.registerUser({ name, email, password });
    logger.info({ email }, "[Auth Action] 用户注册成功");
    return { success: true };
  } catch (error: any) {
    logger.error({ err: error, email }, "[Auth Action] 注册错误");
    return { error: error.message || "注册失败，请稍后再试" };
  }
}

/**
 * 管理员密码二次验证 Action
 * 应用场景：执行删除课程等高危操作前的强制安全校验。
 * @param password 待验证的明文密码
 */
export async function verifyAdminPassword(password: string) {
  const session = await auth();

  // 第一层防御：校验 Session 中的 Role 权限
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { error: "未经授权" };
  }

  try {
    // 委托给 Service 层执行密码指纹对比
    await UserService.verifyUserPassword(session.user.email as string, password);
    return { success: true };
  } catch (error: any) {
    logger.error({ err: error, email: session.user.email }, "[Auth Action] 密码对比校验失败");
    return { error: error.message || "验证失败" };
  }
}


