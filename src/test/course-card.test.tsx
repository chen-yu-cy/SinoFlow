import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CourseCard from '@/components/course/course-card'

describe('CourseCard Component - Visual Logic', () => {
  const defaultProps = {
    id: 'course-1',
    title: 'Test Course',
    description: 'Description',
    price: 100,
    duration: '10 hours',
  }

  it('应该为“入门级”显示绿色样式', () => {
    render(<CourseCard {...defaultProps} level="入门级" />)
    const levelTag = screen.getByText('入门级')
    const styles = window.getComputedStyle(levelTag)
    expect(styles.color).toBe('var(--success)')
  })

  it('应该为“进阶级”显示黄色样式', () => {
    render(<CourseCard {...defaultProps} level="进阶级" />)
    const levelTag = screen.getByText('进阶级')
    const styles = window.getComputedStyle(levelTag)
    expect(styles.color).toBe('var(--warning)')
  })

  it('应该为“高级”显示红色样式', () => {
    render(<CourseCard {...defaultProps} level="高级" />)
    const levelTag = screen.getByText('高级')
    const styles = window.getComputedStyle(levelTag)
    expect(styles.color).toBe('var(--primary)')
  })

  it('非管理员不应看到编辑图标', () => {
    render(<CourseCard {...defaultProps} level="入门级" isAdmin={false} />)
    expect(screen.queryByTitle('快速编辑')).toBeNull()
  })

  it('管理员应该能看到快速编辑图标', () => {
    render(<CourseCard {...defaultProps} level="入门级" isAdmin={true} />)
    expect(screen.getByTitle('快速编辑')).toBeDefined()
  })
})
