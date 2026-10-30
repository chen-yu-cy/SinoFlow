import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import MyCoursesPage from '@/app/my-courses/page'
import prisma from '@/lib/db/client'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

describe('MyCoursesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('未登录用户应被重定向到登录页', async () => {
    (auth as any).mockResolvedValue(null)
    
    await MyCoursesPage()
    
    expect(redirect).toHaveBeenCalledWith('/login')
  })

  it('没有购买记录的用户应看到空状态提示', async () => {
    (auth as any).mockResolvedValue({ user: { id: 'user-1' } });
    (prisma.order.findMany as any).mockResolvedValue([])

    const Page = await MyCoursesPage()
    render(Page)

    expect(screen.getByText('您还没有购买任何课程')).toBeDefined()
  })

  it('已购用户应看到对应的课程卡片', async () => {
    (auth as any).mockResolvedValue({ user: { id: 'user-1' } });
    (prisma.order.findMany as any).mockResolvedValue([
      { 
        id: 'order-1', 
        status: 'SUCCESS',
        course: {
          id: 'c1',
          title: '已购课程 A',
          description: '描述',
          price: 100,
          level: '入门级',
          duration: '10课时'
        }
      }
    ])

    const Page = await MyCoursesPage()
    render(Page)

    expect(screen.getByText('已购课程 A')).toBeDefined()
    expect(screen.getByText('入门级')).toBeDefined() 
  })
})
