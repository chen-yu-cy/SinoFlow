import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LessonContent from '@/components/course/lesson-content'

describe('LessonContent Component - Preview Logic', () => {
  const mockCourse = {
    id: 'c1',
    title: 'Test Course',
    description: 'Desc',
    price: 100,
    lessons: [
      { id: 'l1', title: 'Preview Lesson', videoUrl: 'preview-url', order: 1, isPreview: true },
      { id: 'l2', title: 'Paid Lesson', videoUrl: 'paid-url', order: 2, isPreview: false },
    ]
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('未购买用户应能看到试看小节的内容', () => {
    render(<LessonContent course={mockCourse} hasFullAccess={false} />)
    
    // 默认第一个小节是试看，检查标题（H1）是否正确
    expect(screen.getByRole('heading', { name: /Preview Lesson/i, level: 1 })).toBeDefined()
    // 验证没有渲染购买提示（这意味着渲染了播放器）
    expect(screen.queryByText('此内容仅限订阅学员观看')).toBeNull()
  })

  it('未购买用户点击非试看小节应显示购买提示', () => {
    render(<LessonContent course={mockCourse} hasFullAccess={false} />)
    
    // 点击侧边栏中的付费小节
    const sidebarLesson = screen.getAllByText('Paid Lesson')[0]
    fireEvent.click(sidebarLesson)
    
    expect(screen.getByText('此内容仅限订阅学员观看')).toBeDefined()
  })

  it('已购用户或管理员应能看到所有小节的内容', () => {
    render(<LessonContent course={mockCourse} hasFullAccess={true} />)
    
    // 点击付费小节
    const sidebarLesson = screen.getAllByText('Paid Lesson')[0]
    fireEvent.click(sidebarLesson)
    
    // 不应显示购买提示
    expect(screen.queryByText('此内容仅限订阅学员观看')).toBeNull()
    expect(screen.getByRole('heading', { name: /Paid Lesson/i, level: 1 })).toBeDefined()
  })
})
