// FILE: src/test/admin-user-management.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateImpersonationToken, verifyImpersonationToken } from '@/lib/auth-impersonate'
import { impersonateUser, exitImpersonation } from '@/lib/actions/auth'
import { revokeCourseAccess } from '@/lib/actions/order'
import { auth } from '@/lib/auth'
import { OrderService } from '@/lib/services/order.service'

vi.mock('@/lib/services/order.service', () => ({
  OrderService: {
    revokeUserAccess: vi.fn(),
  }
}))

describe('Admin User Management & Impersonation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('auth-impersonate utility', () => {
    it('应生成并在有效期内验证合法的 impersonation token', () => {
      const email = 'student@example.com'
      const token = generateImpersonationToken(email, 'admin@example.com')
      
      expect(token).toBeDefined()
      expect(token).toContain(':')
      
      const verification = verifyImpersonationToken(email, token)
      expect(verification.isValid).toBe(true)
      expect(verification.adminEmail).toBe('admin@example.com')
    })

    it('如果使用错误的邮箱，验证应失败', () => {
      const email = 'student@example.com'
      const token = generateImpersonationToken(email, 'admin@example.com')
      
      const verification = verifyImpersonationToken('another@example.com', token)
      expect(verification.isValid).toBe(false)
    })

    it('过期的 token 应验证失败', () => {
      const email = 'student@example.com'
      // 模拟过期的 timestamp (例如 10 秒前)
      const expiresAt = Date.now() - 10000
      const crypto = require('crypto')
      const signature = crypto
        .createHmac("sha256", process.env.AUTH_SECRET || "default_secret")
        .update(`${email}:admin@example.com:${expiresAt}`)
        .digest("hex")
      const expiredToken = `admin@example.com:${expiresAt}:${signature}`

      const verification = verifyImpersonationToken(email, expiredToken)
      expect(verification.isValid).toBe(false)
    })
  })

  describe('impersonateUser Server Action', () => {
    it('非管理员（USER）调用模拟登录应被拦截并报错', async () => {
      (auth as any).mockResolvedValue({
        user: { id: 'user-1', role: 'USER', email: 'user@example.com' }
      })

      const res = await impersonateUser('student@example.com')
      expect(res.error).toBe('未经授权')
    })

    it('未登录用户调用模拟登录应被拦截并报错', async () => {
      (auth as any).mockResolvedValue(null)

      const res = await impersonateUser('student@example.com')
      expect(res.error).toBe('未经授权')
    })

    it('超级管理员（ADMIN）调用模拟登录应成功生成 Token', async () => {
      (auth as any).mockResolvedValue({
        user: { id: 'admin-1', role: 'ADMIN', email: 'admin@example.com' }
      })

      const res = await impersonateUser('student@example.com')
      expect(res.success).toBe(true)
      expect(res.token).toBeDefined()
    })
  })

  describe('revokeCourseAccess Server Action', () => {
    it('非管理员（USER）调用撤销授权应被拦截并报错', async () => {
      (auth as any).mockResolvedValue({
        user: { id: 'user-1', role: 'USER', email: 'user@example.com' }
      })

      const res = await revokeCourseAccess('student@example.com', 'course-123')
      expect(res.error).toBe('未经授权')
    })

    it('超级管理员（ADMIN）调用撤销授权应成功调用 OrderService', async () => {
      (auth as any).mockResolvedValue({
        user: { id: 'admin-1', role: 'ADMIN', email: 'admin@example.com' }
      })
      ;(OrderService.revokeUserAccess as any).mockResolvedValue(1)

      const res = await revokeCourseAccess('student@example.com', 'course-123')
      expect(res.success).toBe(true)
      expect(res.deletedCount).toBe(1)
      expect(OrderService.revokeUserAccess).toHaveBeenCalledWith('student@example.com', 'course-123')
    })
  })

  describe('exitImpersonation Server Action', () => {
    it('非模拟登录状态调用退出应返回错误', async () => {
      (auth as any).mockResolvedValue({
        user: { id: 'user-1', role: 'USER', email: 'user@example.com' }
      })

      const res = await exitImpersonation()
      expect(res.error).toBe('当前非模拟登录状态')
    })

    it('模拟登录状态下管理员退出模拟应成功生成返回 Token', async () => {
      (auth as any).mockResolvedValue({
        user: { 
          id: 'user-1', 
          role: 'USER', 
          email: 'user@example.com',
          impersonatorEmail: 'admin@example.com' 
        }
      })

      const res = await exitImpersonation()
      expect(res.success).toBe(true)
      expect(res.adminEmail).toBe('admin@example.com')
      expect(res.token).toBeDefined()
    })
  })
})
