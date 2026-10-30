import { NextResponse } from "next/server";
import { OrderService } from "@/lib/services/order.service";

/**
 * @openapi
 * /api/payment/callback:
 *   post:
 *     summary: Payment gateway webhook listener
 *     description: Receives asynchronous payment results from WeChat/Alipay.
 *   get:
 *     summary: Mock payment completion (Development only)
 *     description: Manually trigger a successful payment for testing purposes.
 */

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    console.log("收到支付平台回调 (Webhook):", rawBody);

    // 逻辑：验证签名 -> 解析数据 -> 调用 Service
    // await OrderService.completeOrder(parsedOrderId, parsedPaymentId);

    return NextResponse.json({ message: "Webhook received" });
  } catch (error) {
    console.error("Payment callback error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 模拟成功的辅助路由，用于本地演示
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  try {
    // 调用业务服务层完成订单状态更新
    await OrderService.completeOrder(orderId, `MOCK_PAY_${Date.now()}`);

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
    console.error("Callback API Error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
