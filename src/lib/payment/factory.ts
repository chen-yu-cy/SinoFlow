// FILE: src/lib/payment/factory.ts
import { PaymentProvider } from "./provider";
import { MockProvider } from "./mock.provider";

/**
 * 支付服务提供商工厂 (Payment Factory)
 * 职责：根据传入的支付渠道标识，多态实例化对应的支付网关提供者。
 */
export const PaymentFactory = {
  /**
   * 获取指定的支付 Provider 实例
   * @param method 支付渠道名称，如 'stripe', 'paypal', 'wechat', 'alipay', 'mock'
   * @returns 实现了 PaymentProvider 接口的具体支付网关实例
   */
  getProvider(method: string): PaymentProvider {
    switch (method?.toLowerCase()) {
      case "wechat":
      case "alipay":
      case "stripe":
      case "paypal":
        // 目前仅支持 mockProvider，在未来上线对接真实 API 时扩展
        return new MockProvider();
      default:
        return new MockProvider();
    }
  }
};
