// FILE: src/app/admin/users/page.tsx
import React from "react";
import prisma from "@/lib/db/client";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserTable, type UserWithOrders } from "@/components/admin/user-table";

const AdminUsersPage = async () => {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // 查询所有注册用户，并包含成功付款的订单及其关联课程
  const users = await prisma.user.findMany({
    include: {
      orders: {
        where: { status: 'SUCCESS' },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              price: true,
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // 进行数据序列化以防 Next.js Server/Client Component 边界传递 Date 对象报错
  const serializedUsers: UserWithOrders[] = users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    orders: user.orders.map(order => ({
      id: order.id,
      courseId: order.courseId,
      course: {
        id: order.course.id,
        title: order.course.title,
        price: order.course.price,
      }
    }))
  }));

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.5rem", fontWeight: "700", margin: "0 0 0.5rem 0" }}>用户管理</h3>
        <p style={{ color: "#6c757d", fontSize: "0.9rem", margin: 0 }}>查看并管理 SinoFlow 平台的所有注册学员及管理员，进行授权撤销和模拟登录排查。</p>
      </div>

      <UserTable initialUsers={serializedUsers} currentUserId={session.user.id} />
    </div>
  );
};

export default AdminUsersPage;
