import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/db/client";
import { auth } from "@/lib/auth";
import PurchaseButton from "@/components/course/purchase-button";
import { OrderStatus } from "@prisma/client";
import LessonContent from "@/components/course/lesson-content";

interface CourseDetailPageProps {
  params: Promise<{ id: string }>;
}

const CourseDetailPage = async ({ params }: CourseDetailPageProps) => {
  const { id } = await params;
  const session = await auth();

  const course = await prisma.course.findUnique({
    where: { id },
    include: { lessons: { orderBy: { order: 'asc' } } }
  });

  if (!course) {
    notFound();
    return null;
  }

  // 检查当前用户全权限：管理员拥有上帝视角，普通用户需检查购买记录
  let hasFullAccess = false;
  if (session?.user?.id) {
    if ((session.user as any).role === "ADMIN") {
      hasFullAccess = true;
    } else {
      const order = await prisma.order.findFirst({
        where: {
          userId: session.user.id,
          courseId: id,
          status: OrderStatus.SUCCESS
        }
      });
      hasFullAccess = !!order;
    }
  }

  return (
    <div className="course-detail-container">
      {/* Interactive Lesson Content & Sidebar */}
      <LessonContent course={course} hasFullAccess={hasFullAccess} />
      
      {/* Purchase Banner (Show only if not purchased) */}
      {!hasFullAccess && (
        <section style={{ marginTop: '2rem' }}>
          <div style={{ padding: '2rem', background: 'var(--primary-light)', borderRadius: '12px', border: '1px solid rgba(200, 16, 46, 0.1)' }}>
            <h3 style={{ marginBottom: "1.5rem" }}>获取完整课程权限</h3>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "0.9rem", color: "var(--primary)", fontWeight: "600", marginBottom: "0.25rem" }}>全额购买</div>
                <span style={{ color: 'var(--foreground-rgb)', fontWeight: '800', fontSize: '2rem' }}>¥{course.price.toFixed(2)}</span>
              </div>
              <div style={{ width: "240px" }}>
                <PurchaseButton courseId={course.id} price={course.price} />
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default CourseDetailPage;
