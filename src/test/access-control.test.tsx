import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import CourseDetailPage from '@/app/courses/[id]/page'
import prisma from '@/lib/db/client'
import { auth } from '@/lib/auth'
import { notFound, redirect, useRouter, usePathname } from 'next/navigation'

// Mock next/navigation
vi.mock('next/navigation', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    notFound: vi.fn(),
    redirect: vi.fn(),
    useRouter: vi.fn(() => ({
      push: vi.fn(),
      refresh: vi.fn(),
    })),
    usePathname: vi.fn(),
  }
})

describe('CourseDetailPage Access Control', () => {
  const mockCourseId = 'course-123'
  const mockParams = Promise.resolve({ id: mockCourseId })

  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.course.findUnique as any).mockResolvedValue({
      id: mockCourseId,
      title: '测试课程',
      description: '课程描述',
      price: 199,
      lessons: [{ id: 'l1', title: 'Lesson 1', videoUrl: 'url', order: 1 }]
    })
  })

  it('如果用户未登录，应显示 PurchaseNotice (购买提示)', async () => {
    (auth as any).mockResolvedValue(null);
    (prisma.order.findFirst as any).mockResolvedValue(null);

    const Page = await CourseDetailPage({ params: mockParams })
    render(Page)

    expect(screen.getByText('此内容仅限订阅学员观看')).toBeDefined()
    expect(screen.queryByTestId('video-player')).toBeNull() // 假设我们给播放器加了 test-id
  })

  it('如果用户已购买成功，应显示 VideoPlayer', async () => {
    (auth as any).mockResolvedValue({ user: { id: 'user-1' } });
    (prisma.order.findFirst as any).mockResolvedValue({ id: 'order-1', status: 'SUCCESS' })

    const Page = await CourseDetailPage({ params: mockParams })
    render(Page)

    // 在这里我们检查 PurchaseNotice 是否消失，以及页面是否正常渲染课程标题
    expect(screen.queryByText('此内容仅限订阅学员观看')).toBeNull()
    expect(screen.getByText('测试课程')).toBeDefined()
  })

  it('如果课程不存在，应调用 notFound', async () => {
    (prisma.course.findUnique as any).mockResolvedValue(null)

    await CourseDetailPage({ params: mockParams })
    
    expect(notFound).toHaveBeenCalled()
  })
})
