// FILE: src/app/api/payment/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db/client";
import { logger } from "@/lib/logger";

/**
 * @openapi
 * /api/payment:
 *   post:
 *     summary: Initiate a payment for an order
 *     description: Creates a payment session with WeChat or Alipay for a specific order.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - paymentMethod
 *             properties:
 *               orderId:
 *                 type: string
 *                 example: "order_123"
 *               paymentMethod:
 *                 type: string
 *                 enum: [wechat, alipay]
 *                 example: "alipay"
 *     responses:
 *       200:
 *         description: Payment initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 paymentUrl:
 *                   type: string
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - User not logged in
 *       404:
 *         description: Order not found
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, paymentMethod } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { course: true }
    });

    if (!order || order.userId !== session.user.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 这里通常会调用微信或支付宝的 SDK 来获取预支付信息 (Prepay ID / URL)
    // 示例：alipay.trade.page.pay 或 wechat.pay.transactions.jsapi
    
    logger.info({ orderId, paymentMethod, userId: session.user.id }, "准备支付订单");

    // 模拟支付成功（实际流程中，用户会被重定向到支付平台，然后平台回调 callback 路由）
    // 为了原型演示，我们返回一个模拟的支付 URL
    const mockPaymentUrl = `/api/payment/callback?orderId=${orderId}`;

    return NextResponse.json({ 
      success: true, 
      paymentUrl: mockPaymentUrl,
      message: "支付跳转中..."
    });

  } catch (error) {
    logger.error({ err: error }, "Payment initiation error");
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
