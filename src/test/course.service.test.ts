import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CourseService } from '@/lib/services/course.service'
import prisma from '@/lib/db/client'

describe('CourseService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createCourse', () => {
    it('应该正确调用 prisma.create', async () => {
      const mockData = {
        title: 'New Course',
        description: 'Desc',
        price: 99,
        level: '入门级',
        duration: '10h',
        isFree: true,
        lessons: [{ title: 'L1', videoUrl: 'url', isPreview: true }]
      };
      
      (prisma.course.create as any).mockResolvedValue({ id: 'c1', ...mockData });

      const result = await CourseService.createCourse(mockData)

      expect(result.id).toBe('c1')
      expect(prisma.course.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          isFree: true
        })
      })
    })
  })

  describe('deleteCourse', () => {
    it('应该使用事务执行级联删除', async () => {
      await CourseService.deleteCourse('c1')
      expect(prisma.$transaction).toHaveBeenCalled()
    })
  })
})
