// FILE: src/app/api/payment/callback/route.ts
import { NextResponse } from "next/server";
import { OrderService } from "@/lib/services/order.service";
import { logger } from "@/lib/logger";
import { PaymentFactory } from "@/lib/payment/factory";

/**
 * @openapi
 * /api/payment/callback:
 *   post:
 *     summary: Payment gateway webhook listener
 *     description: Receives asynchronous payment results from WeChat/Alipay/Stripe/PayPal.
 *   get:
 *     summary: Mock payment completion (Development only)
 *     description: Manually trigger a successful payment for testing purposes.
 */

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    logger.info({ rawBody }, "收到支付平台回调 (Webhook)");

    // 1. 提取 Headers 映射表，为未来真实的签名验证做准备
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // 2. 使用工厂获取对应的支付网关验证器 (Mock 模式下统一采用 mock 校验)
    const provider = PaymentFactory.getProvider("mock");
    const verification = await provider.verifyWebhook(rawBody, headers);

    if (verification.success && verification.orderId) {
      // 3. 验证成功后，调用 OrderService 更新订单并履约解锁课程
      await OrderService.completeOrder(verification.orderId, verification.paymentId);
      logger.info({ orderId: verification.orderId, paymentId: verification.paymentId }, "Webhook 支付成功并确认履约");
      return NextResponse.json({ success: true, message: "Webhook processed successfully" });
    }

    return NextResponse.json({ success: false, error: "Signature or verification failed" }, { status: 400 });
  } catch (error) {
    logger.error({ err: error }, "Payment callback error");
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 模拟成功的辅助 GET 路由，用于前端快速付款跳转测试
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  try {
    const paymentId = `MOCK_PAY_${Date.now()}`;
    // 调用业务服务层完成订单状态更新
    await OrderService.completeOrder(orderId, paymentId);
    logger.info({ orderId, paymentId }, "本地模拟 GET 支付回调成功，已更新订单状态");

    return new Response(`
      <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <title>支付成功</title>
        </head>
        <body style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif;">
          <h1 style="color: #28a745;">支付成功！</h1>
          <p>订单 ${orderId} 已完成。</p>
          <a href="/" style="padding: 10px 20px; background: #c8102e; color: white; text-decoration: none; border-radius: 5px;">返回首页</a>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  } catch (error) {
    logger.error({ err: error, orderId }, "Callback API Error");
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
