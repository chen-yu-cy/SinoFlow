// FILE: src/test/user.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UserService } from '@/lib/services/user.service'
import prisma from '@/lib/db/client'
import bcrypt from 'bcryptjs'

vi.mock('bcryptjs', () => {
  const hash = vi.fn()
  const compare = vi.fn()
  return {
    default: {
      hash,
      compare,
    },
    hash,
    compare,
  }
})

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('registerUser', () => {
    it('如果邮箱或密码缺失，应抛出错误', async () => {
      await expect(UserService.registerUser({ email: '', password: '' }))
        .rejects.toThrow('邮箱和密码不能为空')
    })

    it('如果邮箱已被注册，应抛出错误', async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: 'u1', email: 'test@example.com' })

      await expect(UserService.registerUser({ email: 'test@example.com', password: '123' }))
        .rejects.toThrow('该邮箱已被注册')
      expect(prisma.user.findUnique).toHaveBeenCalled()
    })

    it('如果输入合法且邮箱未注册，应哈希密码并成功写入数据库', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);
      (bcrypt.hash as any).mockResolvedValue('hashed_pwd');
      (prisma.user.create as any).mockResolvedValue({ id: 'u1', email: 'test@example.com', name: 'Test' })

      const result = await UserService.registerUser({
        name: 'Test',
        email: 'test@example.com',
        password: '123'
      })

      expect(result.id).toBe('u1')
      expect(bcrypt.hash).toHaveBeenCalledWith('123', 10)
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: 'Test',
          email: 'test@example.com',
          password: 'hashed_pwd'
        }
      })
    })
  })

  describe('verifyUserPassword', () => {
    it('如果邮箱或密码为空，应抛出错误', async () => {
      await expect(UserService.verifyUserPassword('', ''))
        .rejects.toThrow('邮箱和密码不能为空')
    })

    it('如果用户不存在或没有密码，应抛出错误（账号异常）', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null)

      await expect(UserService.verifyUserPassword('admin@example.com', '123'))
        .rejects.toThrow('管理员账号异常')
    })

    it('如果密码比对不匹配，应抛出错误（密码错误）', async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: 'admin1', password: 'hashed_admin' });
      (bcrypt.compare as any).mockResolvedValue(false)

      await expect(UserService.verifyUserPassword('admin@example.com', 'wrong_pwd'))
        .rejects.toThrow('管理员密码错误')
      expect(bcrypt.compare).toHaveBeenCalledWith('wrong_pwd', 'hashed_admin')
    })

    it('如果密码匹配成功，应返回用户实体', async () => {
      const mockUser = { id: 'admin1', email: 'admin@example.com', password: 'hashed_admin' };
      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(true)

      const result = await UserService.verifyUserPassword('admin@example.com', 'correct_pwd')

      expect(result).toEqual(mockUser)
      expect(bcrypt.compare).toHaveBeenCalledWith('correct_pwd', 'hashed_admin')
    })
  })

  describe('updateUserPassword', () => {
    it('如果参数有缺失，应抛出错误', async () => {
      await expect(UserService.updateUserPassword('', '123456', 'new_pwd'))
        .rejects.toThrow('所有密码字段均不能为空')
    })

    it('如果用户不存在，应抛出错误', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null)
      await expect(UserService.updateUserPassword('u-1', 'current_pwd', 'new_pwd'))
        .rejects.toThrow('账户不存在或无登录密码')
    })

    it('如果当前密码匹配失败，应抛出错误', async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: 'u-1', password: 'hashed_pwd' });
      (bcrypt.compare as any).mockResolvedValue(false)
      
      await expect(UserService.updateUserPassword('u-1', 'wrong_current_pwd', 'new_pwd'))
        .rejects.toThrow('当前密码错误')
    })

    it('如果新密码长度小于6位，应抛出错误', async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: 'u-1', password: 'hashed_pwd' });
      (bcrypt.compare as any).mockResolvedValue(true)
      
      await expect(UserService.updateUserPassword('u-1', 'correct_pwd', '12345'))
        .rejects.toThrow('新密码长度必须至少为 6 位字符')
    })

    it('如果输入全部合法，应哈希新密码并成功更新数据库', async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: 'u-1', password: 'hashed_pwd' });
      (bcrypt.compare as any).mockResolvedValue(true);
      (bcrypt.hash as any).mockResolvedValue('new_hashed_pwd');
      (prisma.user.update as any).mockResolvedValue({ id: 'u-1', email: 'test@example.com' })

      const result = await UserService.updateUserPassword('u-1', 'correct_pwd', 'new_secure_pwd')

      expect(result).toBeDefined()
      expect(bcrypt.hash).toHaveBeenCalledWith('new_secure_pwd', 10)
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u-1' },
        data: { password: 'new_hashed_pwd' }
      })
    })
  })
})
