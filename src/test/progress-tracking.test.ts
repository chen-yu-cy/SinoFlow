// FILE: src/test/progress-tracking.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProgressService } from '@/lib/services/progress.service'
import { toggleLessonProgressAction } from '@/lib/actions/progress'
import prisma from '@/lib/db/client'
import { auth } from '@/lib/auth'

describe('Learning Progress Tracking System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ProgressService', () => {
    it('getCompletedLessonIds 应查询并返回状态为 completed 的课时 ID 集合', async () => {
      ;(prisma.lessonProgress.findMany as any).mockResolvedValue([
        { lessonId: 'l-1' },
        { lessonId: 'l-3' },
      ])

      const result = await ProgressService.getCompletedLessonIds('user-1', 'course-1')
      
      expect(result).toEqual(['l-1', 'l-3'])
      expect(prisma.lessonProgress.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          lesson: { courseId: 'course-1' },
          completed: true,
        },
        select: { lessonId: true },
      })
    })

    it('toggleLessonProgress 应通过 upsert 更新打卡状态', async () => {
      ;(prisma.lessonProgress.upsert as any).mockResolvedValue({ id: 'prog-1', completed: true })

      await ProgressService.toggleLessonProgress('user-1', 'lesson-1', true)

      expect(prisma.lessonProgress.upsert).toHaveBeenCalledWith({
        where: {
          userId_lessonId: { userId: 'user-1', lessonId: 'lesson-1' },
        },
        update: { completed: true },
        create: { userId: 'user-1', lessonId: 'lesson-1', completed: true },
      })
    })

    it('getCoursesProgress 应统计和汇总多门课程的总课时数与已学完课时数', async () => {
      ;(prisma.lesson.count as any).mockResolvedValue(10)
      ;(prisma.lessonProgress.count as any).mockResolvedValue(3)

      const result = await ProgressService.getCoursesProgress('user-1', ['course-1'])

      expect(result).toEqual({
        'course-1': { completedCount: 3, totalCount: 10 }
      })
      expect(prisma.lesson.count).toHaveBeenCalledWith({ where: { courseId: 'course-1' } })
      expect(prisma.lessonProgress.count).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          lesson: { courseId: 'course-1' },
          completed: true,
        }
      })
    })
  })

  describe('toggleLessonProgressAction Server Action', () => {
    it('未登录用户打卡应被拦截', async () => {
      (auth as any).mockResolvedValue(null)

      const res = await toggleLessonProgressAction('lesson-1', true)
      expect(res.error).toBe('请先登录')
    })

    it('课程未购买且不是试看章节应拦截普通用户打卡', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'user-1', role: 'USER' } })
      ;(prisma.lesson.findUnique as any).mockResolvedValue({ id: 'lesson-1', courseId: 'course-1', isPreview: false })
      ;(prisma.order.findFirst as any).mockResolvedValue(null) // 没有购买记录

      const res = await toggleLessonProgressAction('lesson-1', true)
      
      expect(res.error).toBe('您没有该课程的访问权限，无法打卡')
      expect(prisma.order.findFirst).toHaveBeenCalled()
    })

    it('超级管理员（ADMIN）调用应允许打卡，无需检查购买订单', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN' } })
      ;(prisma.lesson.findUnique as any).mockResolvedValue({ id: 'lesson-1', courseId: 'course-1', isPreview: false })
      ;(prisma.lessonProgress.upsert as any).mockResolvedValue({ id: 'prog-1' })

      const res = await toggleLessonProgressAction('lesson-1', true)
      
      expect(res.success).toBe(true)
      expect(prisma.lessonProgress.upsert).toHaveBeenCalled()
      expect(prisma.order.findFirst).not.toHaveBeenCalled()
    })

    it('若是试看章节，应允许未购买课程的用户进行打卡', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'user-1', role: 'USER' } })
      ;(prisma.lesson.findUnique as any).mockResolvedValue({ id: 'lesson-1', courseId: 'course-1', isPreview: true })
      ;(prisma.lessonProgress.upsert as any).mockResolvedValue({ id: 'prog-1' })

      const res = await toggleLessonProgressAction('lesson-1', true)
      
      expect(res.success).toBe(true)
      expect(prisma.lessonProgress.upsert).toHaveBeenCalled()
      expect(prisma.order.findFirst).not.toHaveBeenCalled()
    })
  })
})
