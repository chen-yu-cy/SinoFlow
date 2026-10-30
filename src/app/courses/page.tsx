import React from "react";
import CourseCard from "@/components/course/course-card";
import prisma from "@/lib/db/client";
import { auth } from "@/lib/auth";

const AllCoursesPage = async () => {
  const session = await auth();
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "2.25rem", marginBottom: "0.5rem" }}>所有课程</h2>
        <p style={{ color: "#6c757d" }}>探索 SinoFlow 完整的课程目录，找到最适合您的学习路径。</p>
      </section>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {courses.map(course => (
          <CourseCard 
            key={course.id} 
            id={course.id}
            title={course.title}
            description={course.description}
            price={course.price}
            level={course.level}
            duration={course.duration}
            thumbnail={course.thumbnail}
            layout="list"
            isAdmin={isAdmin}
          />
        ))}
      </div>
    </div>
  );
};

export default AllCoursesPage;
