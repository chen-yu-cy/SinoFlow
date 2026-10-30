// FILE: src/lib/services/user.service.ts
import bcrypt from "bcryptjs";
import prisma from "@/lib/db/client";

export interface RegisterUserInput {
  name?: string | null;
  email: string;
  password?: string | null;
}

/**
 * 用户业务服务层 (User Service)
 * 对应架构中的核心大脑，负责处理用户注册、指纹校验等用户领域的核心数据库操作及业务逻辑。
 */
export const UserService = {
  /**
   * 注册一个全新用户
   * @param data 包含用户的基本注册信息 (email, name, password)
   * @throws 当必填项端缺失、账号已被注册时抛出 Error
   * @returns 返回新创建的用户数据库实体
   */
  async registerUser(data: RegisterUserInput) {
    if (!data.email || !data.password) {
      throw new Error("邮箱和密码不能为空");
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error("该邮箱已被注册");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
    });
  },

  /**
   * 校验用户密码指纹是否匹配
   * @param email 用户邮箱
   * @param plainPassword 待验证的明文密码
   * @throws 当账号不存在、无密码信息或比对不匹配时抛出 Error
   * @returns 返回校验通过的用户数据库实体
   */
  async verifyUserPassword(email: string, plainPassword: string) {
    if (!email || !plainPassword) {
      throw new Error("邮箱和密码不能为空");
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      throw new Error("管理员账号异常");
    }

    const isValid = await bcrypt.compare(plainPassword, user.password);
    
    if (!isValid) {
      throw new Error("管理员密码错误");
    }

    return user;
  }
};
