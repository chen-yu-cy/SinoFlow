import React from "react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db/client";
import { redirect } from "next/navigation";
import CourseCard from "@/components/course/course-card";
import { OrderStatus } from "@prisma/client";

const MyCoursesPage = async () => {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
    return null;
  }

  // 获取用户已成功支付的订单及其关联的课程
  const orders = await prisma.order.findMany({
    where: {
      userId: session.user.id,
      status: OrderStatus.SUCCESS,
    },
    include: {
      course: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  const purchasedCourses = orders.map((order) => order.course);

  return (
    <div>
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>我的课程</h2>
        <p style={{ color: "#6c757d" }}>您已购买并解锁的所有学习内容。</p>
      </section>

      {purchasedCourses.length > 0 ? (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
          gap: "2rem" 
        }}>
          {purchasedCourses.map((course) => (
            <CourseCard 
              key={course.id} 
              id={course.id}
              title={course.title}
              description={course.description}
              price={course.price}
              level={course.level}
              duration={course.duration}
              thumbnail={course.thumbnail}
            />
          ))}
        </div>
      ) : (
        <div style={{ 
          textAlign: "center", 
          padding: "5rem 2rem", 
          background: "#fff", 
          borderRadius: "12px",
          border: "1px solid var(--border-color)" 
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📚</div>
          <h3>您还没有购买任何课程</h3>
          <p style={{ color: "#6c757d", marginBottom: "2rem" }}>探索我们的精选课程，开启您的中文学习之旅。</p>
          <a href="/" className="btn-primary" style={{ textDecoration: "none" }}>去浏览课程</a>
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage;
