import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/db/client";
import { auth } from "@/lib/auth";
import VideoPlayer from "@/components/course/video-player";
import PurchaseButton from "@/components/course/purchase-button";
import PurchaseNotice from "@/components/course/purchase-notice";
import { OrderStatus } from "@prisma/client";
import { PlayCircle, Lock, Info, BookText } from "lucide-react";

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
    return null; // Ensure subsequent code doesn't execute in tests
  }

  // 检查当前用户是否已购买
  let isPurchased = false;
  if (session?.user?.id) {
    const order = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        courseId: id,
        status: OrderStatus.SUCCESS
      }
    });
    isPurchased = !!order;
  }

  return (
    <div className="course-detail-container">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '3rem' }}>
        {/* Main Content: Video and Description */}
        <section>
          <div style={{ marginBottom: "2rem" }}>
            {isPurchased ? (
              <VideoPlayer url={course.lessons[0]?.videoUrl || ""} />
            ) : (
              <PurchaseNotice price={course.price} />
            )}
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--primary)", marginBottom: "1rem" }}>
            <BookText size={24} />
            <span style={{ fontWeight: "700", fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "1px" }}>Course Detail</span>
          </div>

          <h1 style={{ fontSize: "2.5rem", marginBottom: "1.5rem", fontWeight: "800" }}>{course.title}</h1>
          
          <div style={{ background: "#fff", padding: "2rem", borderRadius: "12px", border: "1px solid var(--border-color)", boxShadow: "var(--card-shadow)" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
              <Info size={20} color="var(--primary)" /> 课程简介
            </h3>
            <p style={{ color: '#495057', lineHeight: '1.8', fontSize: "1.05rem" }}>{course.description}</p>
          </div>
          
          <div style={{ marginTop: '2rem', padding: '2rem', background: 'var(--primary-light)', borderRadius: '12px', border: '1px solid rgba(200, 16, 46, 0.1)' }}>
            <h3 style={{ marginBottom: "1.5rem" }}>获取课程权限</h3>
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

        {/* Sidebar: Lesson List */}
        <aside>
          <div style={{ background: "#fff", border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', boxShadow: "var(--card-shadow)", position: "sticky", top: "100px" }}>
            <div style={{ padding: '1.25rem 1.5rem', background: '#f8f9fa', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <PlayCircle size={20} /> 课程目录
              </h3>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {course.lessons.map((lesson, index) => (
                <li key={lesson.id} style={{ 
                  padding: '1.25rem 1.5rem', 
                  borderBottom: index === course.lessons.length - 1 ? 'none' : '1px solid #f1f3f5', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: "space-between",
                  transition: "background 0.2s"
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ 
                      width: '28px', 
                      height: '28px', 
                      borderRadius: '50%', 
                      background: isPurchased ? 'var(--primary-light)' : '#f1f3f5', 
                      color: isPurchased ? 'var(--primary)' : '#adb5bd',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: "700"
                    }}>
                      {lesson.order}
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: "500" }}>{lesson.title}</span>
                  </div>
                  {isPurchased ? (
                    <PlayCircle size={18} color="#adb5bd" />
                  ) : (
                    <Lock size={16} color="#adb5bd" />
                  )}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CourseDetailPage;
