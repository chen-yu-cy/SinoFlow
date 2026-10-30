// FILE: src/test/payment.test.ts
import { describe, it, expect } from 'vitest'
import { PaymentFactory } from '@/lib/payment/factory'
import { MockProvider } from '@/lib/payment/mock.provider'

describe('Payment System Refactoring (Factory & Provider)', () => {
  describe('PaymentFactory', () => {
    it('应根据不同支付渠道名称返回实现 PaymentProvider 接口的实例', () => {
      const mockProvider = PaymentFactory.getProvider('mock')
      expect(mockProvider).toBeInstanceOf(MockProvider)

      const stripeProvider = PaymentFactory.getProvider('stripe')
      expect(stripeProvider).toBeInstanceOf(MockProvider) // 当前降级为 MockProvider

      const defaultProvider = PaymentFactory.getProvider('unknown')
      expect(defaultProvider).toBeInstanceOf(MockProvider)
    })
  })

  describe('MockProvider', () => {
    const provider = new MockProvider()

    it('createOrder 应该生成包含订单 ID 的本地回调跳转 URL', async () => {
      const orderId = 'test_order_123'
      const { paymentUrl, outerId } = await provider.createOrder(orderId, 199.00, 'HSK Course')
      
      expect(paymentUrl).toBe(`/api/payment/callback?orderId=${orderId}`)
      expect(outerId).toContain('MOCK_OUTER_')
    })

    it('verifyWebhook 应对合法的 JSON 报文提取订单号并返回成功', async () => {
      const rawBody = JSON.stringify({ orderId: 'test_order_123' })
      const verification = await provider.verifyWebhook(rawBody, {})

      expect(verification.success).toBe(true)
      expect(verification.orderId).toBe('test_order_123')
      expect(verification.paymentId).toContain('MOCK_PAY_')
    })

    it('verifyWebhook 应对没有 orderId 的报文返回失败', async () => {
      const rawBody = JSON.stringify({ otherField: 'xxx' })
      const verification = await provider.verifyWebhook(rawBody, {})

      expect(verification.success).toBe(false)
      expect(verification.orderId).toBe('')
    })

    it('verifyWebhook 应对非法的 JSON 报文容错并返回失败', async () => {
      const rawBody = '{ invalid json'
      const verification = await provider.verifyWebhook(rawBody, {})

      expect(verification.success).toBe(false)
      expect(verification.orderId).toBe('')
    })
  })
})
