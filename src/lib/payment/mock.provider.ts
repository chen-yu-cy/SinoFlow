// FILE: src/lib/payment/mock.provider.ts
import { PaymentProvider } from "./provider";

/**
 * 模拟支付实现类 (Mock Payment Provider)
 * 职责：用于开发环境的本地支付模拟，实现完整的订单重定向与 Webhook 自签名验证。
 */
export class MockProvider implements PaymentProvider {
  /**
   * 创建模拟支付会话
   * 逻辑：跳转到系统的本地模拟收银台路由
   */
  async createOrder(orderId: string, amount: number, description: string) {
    const paymentUrl = `/api/payment/callback?orderId=${orderId}`;
    return {
      paymentUrl,
      outerId: `MOCK_OUTER_${Date.now()}`,
    };
  }

  /**
   * 验证模拟支付回调
   * 逻辑：验证 rawBody 中的 JSON 参数，确认支付订单
   */
  async verifyWebhook(rawBody: string, headers: Record<string, string>) {
    try {
      const data = JSON.parse(rawBody);
      const orderId = data.orderId;
      
      if (!orderId) {
        throw new Error("Missing orderId in payload");
      }

      return {
        orderId,
        paymentId: `MOCK_PAY_${Date.now()}`,
        success: true,
      };
    } catch (err) {
      return {
        orderId: "",
        paymentId: "",
        success: false,
      };
    }
  }
}
