import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createOrder } from '@/lib/actions/order'
import prisma from '@/lib/db/client'
import { auth } from '@/lib/auth'

describe('createOrder Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该拦截未登录用户的购买请求', async () => {
    // 模拟未登录状态
    (auth as any).mockResolvedValue(null)

    const result = await createOrder('course-123')
    
    expect(result.error).toBe('请先登录后再进行购买')
  })

  it('应该拦截购买不存在课程的请求', async () => {
    // 模拟已登录
    (auth as any).mockResolvedValue({ user: { id: 'user-1' } });
    // 模拟课程不存在
    (prisma.course.findUnique as any).mockResolvedValue(null)

    const result = await createOrder('invalid-course')
    
    expect(result.error).toBe('课程不存在')
  })

  it('应该拦截重复购买已拥有课程的请求', async () => {
    (auth as any).mockResolvedValue({ user: { id: 'user-1' } });
    (prisma.course.findUnique as any).mockResolvedValue({ id: 'course-1', price: 100 });
    // 模拟已存在成功的订单
    (prisma.order.findFirst as any).mockResolvedValue({ id: 'order-1', status: 'SUCCESS' })

    const result = await createOrder('course-1')
    
    expect(result.error).toBe('您已购买过此课程')
    expect(result.alreadyOwned).toBe(true)
  })

  it('验证通过后应成功创建订单', async () => {
    (auth as any).mockResolvedValue({ user: { id: 'user-1' } });
    (prisma.course.findUnique as any).mockResolvedValue({ id: 'course-1', price: 100 });
    (prisma.order.findFirst as any).mockResolvedValue(null);
    (prisma.order.create as any).mockResolvedValue({ id: 'new-order-id' })

    const result = await createOrder('course-1')
    
    expect(result.success).toBe(true)
    expect(result.orderId).toBe('new-order-id')
    expect(prisma.order.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        courseId: 'course-1',
        amount: 100,
        status: 'PENDING'
      }
    })
  })
})
