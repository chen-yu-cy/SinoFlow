import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createCourse, updateCourse } from '@/lib/actions/course'
import prisma from '@/lib/db/client'
import { auth } from '@/lib/auth'

describe('createCourse Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该拒绝非管理员用户的创建请求', async () => {
    (auth as any).mockResolvedValue({ user: { id: 'user-1', role: 'USER' } })

    const result = await createCourse({
      title: 'New Course',
      description: 'Desc',
      price: 100,
      lessons: [{ title: 'L1', videoUrl: 'url' }]
    })
    
    expect(result.error).toBe('未经授权的操作')
  })

  it('验证数据完整性', async () => {
    (auth as any).mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN' } })

    const result = await createCourse({
      title: '', // 标题为空
      description: 'Desc',
      price: 100,
      lessons: []
    })
    
    expect(result.error).toBe('请填写完整的课程信息并至少添加一个章节')
  })

  it('管理员应能成功创建课程', async () => {
    (auth as any).mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN' } });
    (prisma.course.create as any).mockResolvedValue({ id: 'new-course-id' })

    const result = await createCourse({
      title: 'Valid Course',
      description: 'Description',
      price: 299,
      level: '进阶级',
      duration: '15 课时',
      lessons: [
        { title: 'Lesson 1', videoUrl: '/uploads/vid1.mp4' },
        { title: 'Lesson 2', videoUrl: '/uploads/vid2.mp4' }
      ]
    })
    
    expect(result.success).toBe(true)
    expect(result.courseId).toBe('new-course-id')
    expect(prisma.course.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: 'Valid Course',
        price: 299,
        level: '进阶级',
        duration: '15 课时',
      })
    })
  })

  it('管理员应能成功更新课程', async () => {
    (auth as any).mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN' } });
    
    const result = await updateCourse('existing-id', {
      title: 'Updated Title',
      description: 'Updated Desc',
      price: 199,
      level: '高级',
      duration: '30 课时',
      lessons: [{ title: 'New L1', videoUrl: 'new-url' }]
    })

    expect(result.success).toBe(true)
    // 验证事务是否被正确调用
    expect(prisma.$transaction).toHaveBeenCalled()
  })
})
