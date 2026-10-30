import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OrderService } from '@/lib/services/order.service'
import prisma from '@/lib/db/client'

describe('OrderService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('revokeUserAccess', () => {
    it('成功撤销所有课程权限', async () => {
      // 模拟用户存在
      (prisma.user.findUnique as any).mockResolvedValue({ id: 'user-1', email: 'test@example.com' });
      // 模拟删除成功并返回数量
      (prisma.order.deleteMany as any).mockResolvedValue({ count: 2 });

      const result = await OrderService.revokeUserAccess('test@example.com')

      expect(result).toBe(2)
      expect(prisma.order.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          status: 'SUCCESS'
        }
      })
    })

    it('成功撤销指定课程权限', async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: 'user-1', email: 'test@example.com' });
      (prisma.order.deleteMany as any).mockResolvedValue({ count: 1 });

      const result = await OrderService.revokeUserAccess('test@example.com', 'course-123')

      expect(result).toBe(1)
      expect(prisma.order.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          courseId: 'course-123',
          status: 'SUCCESS'
        }
      })
    })

    it('如果用户不存在应抛出错误', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null)

      await expect(OrderService.revokeUserAccess('nonexistent@example.com'))
        .rejects.toThrow('找不到用户: nonexistent@example.com')
    })
  })
})
