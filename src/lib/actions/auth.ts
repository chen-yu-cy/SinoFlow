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

/**
 * 模拟登录其他用户 Action
 * @param targetEmail 目标用户邮箱
 */
export async function impersonateUser(targetEmail: string) {
  const session = await auth();

  // 安全检查：只有管理员有权执行此操作
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { error: "未经授权" };
  }

  try {
    const { generateImpersonationToken } = await import("@/lib/auth-impersonate");
    const token = generateImpersonationToken(targetEmail, session.user.email as string);
    logger.info(
      { adminEmail: session.user.email, targetEmail },
      "[Auth Action] 管理员生成了模拟登录 Token"
    );
    return { success: true, token };
  } catch (error: any) {
    logger.error({ err: error, targetEmail }, "[Auth Action] 生成模拟登录 Token 失败");
    return { error: "模拟登录请求失败，请稍后再试" };
  }
}

/**
 * 退出模拟登录并返回管理员账号 Action
 */
export async function exitImpersonation() {
  const session = await auth();

  // 安全检查：只有当前为模拟登录状态时才允许执行
  const impersonatorEmail = (session?.user as any)?.impersonatorEmail;
  if (!session?.user || !impersonatorEmail) {
    return { error: "当前非模拟登录状态" };
  }

  try {
    const { generateImpersonationToken } = await import("@/lib/auth-impersonate");
    // 生成原管理员重新登录的 Token
    const token = generateImpersonationToken(impersonatorEmail, "");
    logger.info(
      { impersonatorEmail, targetEmail: session.user.email },
      "[Auth Action] 模拟登录退出，生成管理员返回 Token"
    );
    return { success: true, token, adminEmail: impersonatorEmail };
  } catch (error: any) {
    logger.error({ err: error }, "[Auth Action] 退出模拟登录失败");
    return { error: "退出模拟登录失败，请稍后再试" };
  }
}

/**
 * 个人设置：修改用户密码 Server Action
 */
export async function updateUserPasswordAction(currentPassword: string, newPassword: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "请先登录后再修改密码" };
  }

  try {
    await UserService.updateUserPassword(session.user.id, currentPassword, newPassword);
    logger.info({ userId: session.user.id }, "[Auth Action] 用户修改密码成功");
    return { success: true };
  } catch (error: any) {
    logger.error({ err: error, userId: session.user.id }, "[Auth Action] 修改密码失败");
    return { error: error.message || "修改密码失败，请稍后再试" };
  }
}


