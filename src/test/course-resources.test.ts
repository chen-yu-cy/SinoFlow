// FILE: src/test/course-resources.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/courses/[id]/resources/[resourceId]/route'
import prisma from '@/lib/db/client'
import { auth } from '@/lib/auth'
import fs from 'fs'

vi.mock('fs', () => {
  const existsSync = vi.fn()
  const readFileSync = vi.fn()
  return {
    default: {
      existsSync,
      readFileSync,
    },
    existsSync,
    readFileSync,
  };
})

describe('Course Resources Secure Download API Route', () => {
  const mockCourseId = 'course-123'
  const mockResourceId = 'res-456'
  const mockParams = Promise.resolve({ id: mockCourseId, resourceId: mockResourceId })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('未登录用户下载应被拒绝 (401)', async () => {
    (auth as any).mockResolvedValue(null)

    const response = await GET(new Request('http://localhost'), { params: mockParams })
    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toBe('请先登录')
  })

  it('普通已登录用户但未购买课程下载应被拒绝 (403)', async () => {
    (auth as any).mockResolvedValue({ user: { id: 'user-1', role: 'USER' } })
    ;(prisma.order.findFirst as any).mockResolvedValue(null) // No successful order

    const response = await GET(new Request('http://localhost'), { params: mockParams })
    expect(response.status).toBe(403)
    const body = await response.json()
    expect(body.error).toContain('请先购买课程')
  })

  it('已购课普通用户下载，资源不存在应返回 404', async () => {
    (auth as any).mockResolvedValue({ user: { id: 'user-1', role: 'USER' } })
    ;(prisma.order.findFirst as any).mockResolvedValue({ id: 'ord-1' })
    ;(prisma.resource.findUnique as any).mockResolvedValue(null) // Resource record missing

    const response = await GET(new Request('http://localhost'), { params: mockParams })
    expect(response.status).toBe(404)
    const body = await response.json()
    expect(body.error).toBe('找不到指定的学习资料')
  })

  it('管理员直接下载，无需购买订单且能获得文件流 (200)', async () => {
    (auth as any).mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN' } })
    ;(prisma.resource.findUnique as any).mockResolvedValue({
      id: mockResourceId,
      title: '学习资料.pdf',
      fileUrl: '/uploads/resources/test.pdf',
      courseId: mockCourseId
    })
    ;(fs.existsSync as any).mockReturnValue(true)
    ;(fs.readFileSync as any).mockReturnValue(Buffer.from('mock pdf data'))

    const response = await GET(new Request('http://localhost'), { params: mockParams })
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/pdf')
    expect(response.headers.get('Content-Disposition')).toContain('filename*=UTF-8\'\'%E5%AD%A6%E4%B9%A0%E8%B5%84%E6%96%99.pdf')
    const body = await response.text()
    expect(body).toBe('mock pdf data')
  })

  it('已购课用户下载，如果本地物理文件不存在应返回 404', async () => {
    (auth as any).mockResolvedValue({ user: { id: 'user-1', role: 'USER' } })
    ;(prisma.order.findFirst as any).mockResolvedValue({ id: 'ord-1' })
    ;(prisma.resource.findUnique as any).mockResolvedValue({
      id: mockResourceId,
      title: '学习资料.pdf',
      fileUrl: '/uploads/resources/test-missing.pdf',
      courseId: mockCourseId
    })
    ;(fs.existsSync as any).mockReturnValue(false)

    const response = await GET(new Request('http://localhost'), { params: mockParams })
    expect(response.status).toBe(404)
    const body = await response.json()
    expect(body.error).toBe('文件不存在或已被删除')
  })
})
