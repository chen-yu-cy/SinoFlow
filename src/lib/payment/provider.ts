// FILE: src/lib/payment/provider.ts
export interface PaymentProvider {
  /**
   * 创建支付会话/订单
   * @param orderId 内部订单号
   * @param amount 支付金额
   * @param description 商品描述（课程名称）
   * @returns 包含支付跳转 URL 和可能存在的外部交易 ID
   */
  createOrder(
    orderId: string,
    amount: number,
    description: string
  ): Promise<{ paymentUrl: string; outerId?: string }>;

  /**
   * 验证支付平台 Webhook 异步回调
   * @param rawBody 原始请求体报文
   * @param headers 请求头映射表
   * @returns 解析并验证后的订单号、支付流水号和成功状态
   */
  verifyWebhook(
    rawBody: string,
    headers: Record<string, string>
  ): Promise<{ orderId: string; paymentId: string; success: boolean }>;
}
