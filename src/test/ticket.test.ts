// FILE: src/test/ticket.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TicketService } from '@/lib/services/ticket.service'
import { submitTicketAction, updateTicketStatusAction, addMessageAction, getUserTicketsAction } from '@/lib/actions/ticket'
import prisma from '@/lib/db/client'
import { auth } from '@/lib/auth'

describe('Ticket Support System Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('TicketService', () => {
    it('应该成功创建新工单并触发首个留言创建', async () => {
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
        data: expect.objectContaining({
          userId: 'u-1',
          userEmail: 'user@test.com',
          title: '测试工单',
          content: '描述内容',
          status: 'PENDING',
          messages: {
            create: {
              senderId: 'u-1',
              senderRole: 'USER',
              content: '描述内容'
            }
          }
        }),
        include: {
          messages: true
        }
      })
    })

    it('应该拦截标题或描述为空的工单创建', async () => {
      await expect(TicketService.createTicket('u-1', 'user@test.com', '', '描述内容'))
        .rejects.toThrow('工单标题和内容不能为空')
    })

    it('getTickets 应该支持按创建时间 desc 获取全部工单，且留言列表按 asc 排序', async () => {
      (prisma.supportTicket.findMany as any).mockResolvedValue([
        { id: 't-1', title: '工单 1', messages: [] }
      ])

      const result = await TicketService.getTickets()
      expect(result.length).toBe(1)
      expect(prisma.supportTicket.findMany).toHaveBeenLastCalledWith({
        include: {
          user: {
            select: { name: true, email: true }
          },
          messages: {
            orderBy: { createdAt: "asc" },
            include: {
              sender: {
                select: { name: true, email: true }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" }
      })
    })

    it('getUserTickets 应该按创建时间 desc 获取指定用户的工单，且留言列表按 asc 排序', async () => {
      (prisma.supportTicket.findMany as any).mockResolvedValue([
        { id: 't-2', title: '工单 2', messages: [] }
      ])

      const result = await TicketService.getUserTickets('u-2')
      expect(result.length).toBe(1)
      expect(prisma.supportTicket.findMany).toHaveBeenLastCalledWith({
        where: { userId: 'u-2' },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            include: {
              sender: {
                select: { name: true, email: true }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" }
      })
    })

    it('getTicket 应该获取单个工单详情，且留言列表按 asc 排序', async () => {
      (prisma.supportTicket.findUnique as any).mockResolvedValue({
        id: 't-3',
        title: '工单 3',
        messages: []
      })

      const result = await TicketService.getTicket('t-3')
      expect(result?.id).toBe('t-3')
      expect(prisma.supportTicket.findUnique).toHaveBeenLastCalledWith({
        where: { id: 't-3' },
        include: {
          user: {
            select: { name: true, email: true }
          },
          messages: {
            orderBy: { createdAt: "asc" },
            include: {
              sender: {
                select: { name: true, email: true }
              }
            }
          }
        }
      })
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

  describe('addMessageAction Server Action', () => {
    it('应该拦截未登录用户的留言回复', async () => {
      (auth as any).mockResolvedValue(null)
      const result = await addMessageAction('t-123', '留言内容')
      expect(result.error).toBe('请先登录后再回复留言')
    })

    it('学员追加留言成功并重置状态为 PENDING', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'u-1', role: 'USER' } });
      (prisma.supportTicket.findUnique as any).mockResolvedValue({ id: 't-123', title: '测试工单' });
      (prisma.supportTicketMessage.create as any).mockResolvedValue({
        id: 'msg-1',
        senderId: 'u-1',
        senderRole: 'USER',
        content: '我的追问',
        createdAt: new Date(),
        sender: { name: '学生', email: 'u1@test.com' }
      })

      const result = await addMessageAction('t-123', '我的追问', 'PENDING')
      expect(result.success).toBe(true)
      expect(result.message?.content).toBe('我的追问')
      expect(prisma.supportTicketMessage.create).toHaveBeenCalledWith({
        data: {
          ticketId: 't-123',
          senderId: 'u-1',
          senderRole: 'USER',
          content: '我的追问'
        },
        include: {
          sender: {
            select: { name: true, email: true }
          }
        }
      })
      expect(prisma.supportTicket.update).toHaveBeenCalledWith({
        where: { id: 't-123' },
        data: { status: 'PENDING' }
      })
    })
  })

  describe('updateTicketStatusAction Server Action', () => {
    it('应该拦截非管理员的状态更新请求', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'u-1', role: 'USER' } })
      const result = await updateTicketStatusAction('t-123', 'PROCESSING')
      expect(result.error).toBe('未经授权')
    })

    it('管理员可以成功更新工单状态', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN' } });
      (prisma.supportTicket.update as any).mockResolvedValue({
        id: 't-123',
        status: 'RESOLVED'
      })

      const result = await updateTicketStatusAction('t-123', 'RESOLVED')
      expect(result.success).toBe(true)
      expect(result.status).toBe('RESOLVED')
      expect(prisma.supportTicket.update).toHaveBeenCalledWith({
        where: { id: 't-123' },
        data: { status: 'RESOLVED' }
      })
    })
  })

  describe('getUserTicketsAction Server Action', () => {
    it('应该拦截未登录用户的历史查询', async () => {
      (auth as any).mockResolvedValue(null)
      const result = await getUserTicketsAction()
      expect(result.error).toBe('请先登录后再查询工单')
    })

    it('学员可以成功查询自己的工单列表并获取消息时间线', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'user-1' } });
      (prisma.supportTicket.findMany as any).mockResolvedValue([
        {
          id: 't-1',
          title: '视频无法加载',
          content: '描述',
          status: 'RESOLVED',
          createdAt: new Date('2026-06-26T00:00:00Z'),
          messages: [
            {
              id: 'm-1',
              senderId: 'user-1',
              senderRole: 'USER',
              content: '首个提问',
              createdAt: new Date('2026-06-26T00:00:00Z'),
              sender: { name: '学生', email: 'user@test.com' }
            },
            {
              id: 'm-2',
              senderId: 'admin-1',
              senderRole: 'ADMIN',
              content: '已解决',
              createdAt: new Date('2026-06-26T01:00:00Z'),
              sender: { name: '管理员', email: 'admin@test.com' }
            }
          ]
        }
      ])

      const result = await getUserTicketsAction()

      expect(result.success).toBe(true)
      expect(result.tickets?.length).toBe(1)
      expect(result.tickets?.[0].messages.length).toBe(2)
      expect(result.tickets?.[0].messages[1].content).toBe('已解决')
    })
  })
})
