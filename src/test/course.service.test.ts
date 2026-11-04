// FILE: src/test/course.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CourseService } from '@/lib/services/course.service'
import prisma from '@/lib/db/client'
import { CacheService } from '@/lib/cache/cache.service'

describe('CourseService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createCourse', () => {
    it('应该正确调用 prisma.create 并清除相关列表缓存', async () => {
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
      vi.spyOn(CacheService, 'invalidatePattern').mockResolvedValue();

      const result = await CourseService.createCourse(mockData)

      expect(result.id).toBe('c1')
      expect(prisma.course.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          isFree: true
        })
      })
      expect(CacheService.invalidatePattern).toHaveBeenCalledWith('courses:*')
    })
  })

  describe('getFeaturedCourses', () => {
    it('应该优先通过缓存服务获取精选课程', async () => {
      const mockFeatured = [
        { id: 'f1', title: 'Featured 1', isFeatured: true },
        { id: 'f2', title: 'Featured 2', isFeatured: true },
        { id: 'f3', title: 'Featured 3', isFeatured: true },
        { id: 'f4', title: 'Featured 4', isFeatured: true },
      ]
      vi.spyOn(CacheService, 'getOrSet').mockImplementation(async (key, ttl, fetcher) => {
        return fetcher()
      });
      (prisma.course.findMany as any).mockResolvedValue(mockFeatured);

      const result = await CourseService.getFeaturedCourses(4)
      expect(result).toEqual(mockFeatured)
      expect(prisma.course.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { isFeatured: true }
      }))
    })
  })

  describe('getDefaultCourseList', () => {
    it('应该通过缓存服务获取全部默认课程列表', async () => {
      const mockAll = [{ id: 'c1', title: 'Course 1' }]
      vi.spyOn(CacheService, 'getOrSet').mockImplementation(async (key, ttl, fetcher) => {
        return fetcher()
      });
      (prisma.course.findMany as any).mockResolvedValue(mockAll);

      const result = await CourseService.getDefaultCourseList()
      expect(result).toEqual(mockAll)
    })
  })

  describe('deleteCourse', () => {
    it('应该使用事务执行级联删除并清除缓存', async () => {
      vi.spyOn(CacheService, 'del').mockResolvedValue()
      vi.spyOn(CacheService, 'invalidatePattern').mockResolvedValue()

      await CourseService.deleteCourse('c1')
      expect(prisma.$transaction).toHaveBeenCalled()
      expect(CacheService.del).toHaveBeenCalledWith('course:c1')
      expect(CacheService.invalidatePattern).toHaveBeenCalledWith('courses:*')
    })
  })
})
