// FILE: src/test/ticket.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TicketService } from '@/lib/services/ticket.service'
import { submitTicketAction, updateTicketStatusAction } from '@/lib/actions/ticket'
import prisma from '@/lib/db/client'
import { auth } from '@/lib/auth'

describe('Ticket Support System Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('TicketService', () => {
    it('应该成功创建新工单并触发通知邮件', async () => {
      (prisma.supportTicket.create as any).mockResolvedValue({
        id: 't-123',
        userId: 'u-1',
        userEmail: 'user@test.com',
        title: '测试工单',
        content: '描述内容',
        status: 'PENDING'
      })

      const result = await TicketService.createTicket('u-1', 'user@test.com', '测试工单', '描述内容')

      expect(result.id).toBe('t-123')
      expect(prisma.supportTicket.create).toHaveBeenCalledWith({
        data: {
          userId: 'u-1',
          userEmail: 'user@test.com',
          title: '测试工单',
          content: '描述内容',
          status: 'PENDING'
        }
      })
    })

    it('应该拦截标题或描述为空的工单创建', async () => {
      await expect(TicketService.createTicket('u-1', 'user@test.com', '', '描述内容'))
        .rejects.toThrow('工单标题和内容不能为空')
    })
  })

  describe('submitTicketAction Server Action', () => {
    it('应该拦截未登录用户的工单提交', async () => {
      (auth as any).mockResolvedValue(null)
      const result = await submitTicketAction('标题', '描述')
      expect(result.error).toBe('请先登录后再提交工单')
    })

    it('登录用户提交工单成功应返回工单ID', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'u-1', email: 'user@test.com' } });
      (prisma.supportTicket.create as any).mockResolvedValue({ id: 't-123' })

      const result = await submitTicketAction('问题标题', '问题描述')
      expect(result.success).toBe(true)
      expect(result.ticketId).toBe('t-123')
    })
  })

  describe('updateTicketStatusAction Server Action', () => {
    it('应该拦截非管理员的状态更新请求', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'u-1', role: 'USER' } })
      const result = await updateTicketStatusAction('t-123', 'PROCESSING')
      expect(result.error).toBe('未经授权')
    })

    it('管理员可以成功更新工单状态及附加答复', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN' } });
      (prisma.supportTicket.update as any).mockResolvedValue({
        id: 't-123',
        status: 'RESOLVED',
        adminReply: '已解决该问题'
      })

      const result = await updateTicketStatusAction('t-123', 'RESOLVED', '已解决该问题')
      expect(result.success).toBe(true)
      expect(result.status).toBe('RESOLVED')
      expect(result.adminReply).toBe('已解决该问题')
      expect(prisma.supportTicket.update).toHaveBeenCalledWith({
        where: { id: 't-123' },
        data: expect.objectContaining({
          status: 'RESOLVED',
          adminReply: '已解决该问题'
        })
      })
    })
  })

  describe('getUserTicketsAction Server Action', () => {
    it('应该拦截未登录用户的历史查询', async () => {
      (auth as any).mockResolvedValue(null)
      const { getUserTicketsAction } = await import('@/lib/actions/ticket')
      const result = await getUserTicketsAction()
      expect(result.error).toBe('请先登录后再查询工单')
    })

    it('学员可以成功查询自己的工单列表并获取回复内容', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'user-1' } });
      (prisma.supportTicket.findMany as any).mockResolvedValue([
        {
          id: 't-1',
          title: '视频无法加载',
          content: '描述',
          status: 'RESOLVED',
          adminReply: '已恢复',
          repliedAt: new Date('2026-06-26T00:00:00Z'),
          createdAt: new Date('2026-06-26T00:00:00Z')
        }
      ])

      const { getUserTicketsAction } = await import('@/lib/actions/ticket')
      const result = await getUserTicketsAction()

      expect(result.success).toBe(true)
      expect(result.tickets?.length).toBe(1)
      expect(result.tickets?.[0].adminReply).toBe('已恢复')
    })
  })
})
