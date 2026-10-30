// FILE: src/app/admin/orders/page.tsx
import React from "react";
import prisma from "@/lib/db/client";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OrderTable, type OrderWithDetails } from "@/components/admin/order-table";

const AdminOrdersPage = async () => {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  // 查询所有订单，包含购买用户和对应的课程信息
  const orders = await prisma.order.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        }
      },
      course: {
        select: {
          title: true,
          price: true,
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  // 序列化 Date 对象，避免 Next.js Client/Server Component 边界传输报错
  const serializedOrders: OrderWithDetails[] = orders.map((order) => ({
    id: order.id,
    userId: order.userId,
    courseId: order.courseId,
    amount: order.amount,
    status: order.status,
    paymentId: order.paymentId,
    createdAt: order.createdAt.toISOString(),
    user: order.user ? {
      name: order.user.name,
      email: order.user.email,
    } : null,
    course: order.course ? {
      title: order.course.title,
      price: order.course.price,
    } : null,
  }));

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.5rem", fontWeight: "700", margin: "0 0 0.5rem 0" }}>订单管理</h3>
        <p style={{ color: "#6c757d", fontSize: "0.9rem", margin: 0 }}>
          查看 SinoFlow 平台的所有订单记录。您可以搜索订单，或者撤销已购用户的课程授权与订单记录。
        </p>
      </div>

      <OrderTable initialOrders={serializedOrders} />
    </div>
  );
};

export default AdminOrdersPage;
