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
})
