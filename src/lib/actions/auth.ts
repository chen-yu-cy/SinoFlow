"use server";

import bcrypt from "bcryptjs";
import prisma from "@/lib/db/client";
import { auth } from "@/lib/auth";

export async function registerUser(formData: FormData) {
  console.log("开始处理注册请求...");
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "邮箱和密码不能为空" };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "该邮箱已被注册" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    console.log("用户注册成功:", email);
    return { success: true };
  } catch (error) {
    console.error("注册过程发生错误:", error);
    return { error: "注册失败，请稍后再试" };
  }
}

export async function verifyAdminPassword(password: string) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { error: "未经授权" };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email as string },
  });

  if (!user || !user.password) {
    return { error: "用户不存在" };
  }

  const isValid = await bcrypt.compare(password, user.password);
  
  if (!isValid) {
    return { error: "管理员密码错误" };
  }

  return { success: true };
}

