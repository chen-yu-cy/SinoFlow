"use server";

import bcrypt from "bcryptjs";
import prisma from "@/lib/db/client";
import { auth } from "@/lib/auth";

/**
 * 身份验证与用户管理 Server Actions
 * 职责：处理用户注册、密码二次校验等安全敏感逻辑。
 */

/**
 * 注册新用户 Action
 * @param formData 包含 name, email, password 的表单对象
 */
export async function registerUser(formData: FormData) {
  console.log("[Auth] 开始处理注册请求...");
  
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // 1. 基础数据验证
  if (!email || !password) {
    return { error: "邮箱和密码不能为空" };
  }

  // 2. 查重校验
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "该邮箱已被注册" };
  }

  // 3. 密码加盐哈希（安全性核心）
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // 4. 写入数据库
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    console.log("[Auth] 用户注册成功:", email);
    return { success: true };
  } catch (error) {
    console.error("[Auth] 数据库写入错误:", error);
    return { error: "注册失败，请稍后再试" };
  }
}

/**
 * 管理员密码二次验证 Action
 * 应用场景：执行删除课程等高危操作前的强制安全校验。
 * @param password 待验证的明文密码
 */
export async function verifyAdminPassword(password: string) {
  const session = await auth();

  // 1. 第一层防御：校验 Session 中的 Role
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { error: "未经授权" };
  }

  // 2. 获取数据库中最新的管理员信息
  const user = await prisma.user.findUnique({
    where: { email: session.user.email as string },
  });

  if (!user || !user.password) {
    return { error: "管理员账号异常" };
  }

  // 3. 执行指纹对比
  const isValid = await bcrypt.compare(password, user.password);
  
  if (!isValid) {
    return { error: "管理员密码错误" };
  }

  return { success: true };
}
