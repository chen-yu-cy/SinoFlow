import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import AllCoursesPage from '@/app/courses/page'
import prisma from '@/lib/db/client'
import { auth } from '@/lib/auth'

// Mock next/navigation
vi.mock('next/navigation', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRouter: vi.fn(() => ({
      push: vi.fn(),
      refresh: vi.fn(),
    })),
    useSearchParams: vi.fn(() => ({
      get: vi.fn(),
      toString: vi.fn(() => ""),
    })),
    usePathname: vi.fn(),
  }
})

describe('AllCoursesPage - Search and Filter Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该根据搜索词查询数据库', async () => {
    (auth as any).mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN' } });
    (prisma.course.findMany as any).mockResolvedValue([]);

    const mockParams = Promise.resolve({ q: '汉语' })
    await AllCoursesPage({ searchParams: mockParams })

    expect(prisma.course.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            { title: { contains: '汉语', mode: 'insensitive' } }
          ])
        })
      })
    )
  })

  it('应该根据难度等级查询数据库', async () => {
    (auth as any).mockResolvedValue(null);
    (prisma.course.findMany as any).mockResolvedValue([]);

    const mockParams = Promise.resolve({ level: '高级' })
    await AllCoursesPage({ searchParams: mockParams })

    expect(prisma.course.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          level: '高级'
        })
      })
    )
  })

  it('当没有匹配结果时应显示空状态', async () => {
    (auth as any).mockResolvedValue(null);
    (prisma.course.findMany as any).mockResolvedValue([]);

    const Page = await AllCoursesPage({ searchParams: Promise.resolve({}) })
    render(Page)

    expect(screen.getByText('没有找到符合条件的课程。')).toBeDefined()
  })
})
