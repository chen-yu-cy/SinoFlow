import { NextResponse } from "next/server";
import prisma from "@/lib/db/client";
import { OrderStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    // 微信/支付宝的回调通常需要读取原始 Body 进行签名校验
    const rawBody = await req.text();
    
    // 这里应该是解析 XML (微信) 或 JSON (支付宝) 的逻辑
    // 以及签名验证 logic
    
    console.log("收到支付平台回调:", rawBody);

    // 示例解析（实际需要根据具体 SDK 处理）
    // 假设我们从回调中获取到了订单 ID 和支付状态
    // const { out_trade_no, trade_status } = parseCallback(rawBody);
    
    // 为了原型演示，我们添加一个专门用于模拟成功的回调逻辑
    return NextResponse.json({ message: "Mock callback received" });

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
    await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: OrderStatus.SUCCESS,
        paymentId: `MOCK_PAY_${Date.now()}`
      }
    });

    return new Response(`
      <html>
        <body style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif;">
          <h1 style="color: #28a745;">支付成功！</h1>
          <p>订单 ${orderId} 已完成。</p>
          <a href="/" style="padding: 10px 20px; background: #c8102e; color: white; text-decoration: none; border-radius: 5px;">返回首页</a>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
