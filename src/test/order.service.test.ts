import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OrderService } from '@/lib/services/order.service'
import prisma from '@/lib/db/client'

describe('OrderService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createOrder', () => {
    it('成功创建新订单', async () => {
      (prisma.course.findUnique as any).mockResolvedValue({ id: 'c1', price: 100 });
      (prisma.order.findFirst as any).mockResolvedValue(null);
      (prisma.order.create as any).mockResolvedValue({ id: 'o1' });

      const result = await OrderService.createOrder('u1', 'c1')

      expect(result.id).toBe('o1')
      expect(prisma.order.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'u1',
          courseId: 'c1',
          amount: 100,
          status: 'PENDING'
        })
      })
    })

    it('拦截重复购买', async () => {
      (prisma.course.findUnique as any).mockResolvedValue({ id: 'c1', price: 100 });
      (prisma.order.findFirst as any).mockResolvedValue({ id: 'old-o' });

      await expect(OrderService.createOrder('u1', 'c1'))
        .rejects.toThrow('您已购买过此课程')
    })
  })

  describe('completeOrder', () => {
    it('更新订单状态为 SUCCESS', async () => {
      await OrderService.completeOrder('o1', 'pay-123')
      
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'o1' },
        data: expect.objectContaining({
          status: 'SUCCESS',
          paymentId: 'pay-123'
        })
      })
    })
  })

  describe('revokeUserAccess', () => {
    it('成功撤销所有课程权限', async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: 'user-1', email: 'test@example.com' });
      (prisma.order.deleteMany as any).mockResolvedValue({ count: 2 });

      const result = await OrderService.revokeUserAccess('test@example.com')

      expect(result).toBe(2)
    })
  })
})
