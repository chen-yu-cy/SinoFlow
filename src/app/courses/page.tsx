import React from "react";
import CourseCard from "@/components/course/course-card";
import prisma from "@/lib/db/client";
import { auth } from "@/lib/auth";
import CourseFilters from "@/components/course/course-filters";

interface AllCoursesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const AllCoursesPage = async ({ searchParams }: AllCoursesPageProps) => {
  const session = await auth();
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const resolvedParams = await searchParams;
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined;
  const level = typeof resolvedParams.level === 'string' ? resolvedParams.level : undefined;

  // 构建 Prisma 查询条件
  const where: any = {};
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } }
    ];
  }
  if (level && level !== '全部') {
    where.level = level;
  }

  const courses = await prisma.course.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "2.25rem", marginBottom: "0.5rem" }}>所有课程</h2>
        <p style={{ color: "#6c757d" }}>探索 SinoFlow 完整的课程目录，找到最适合您的学习路径。</p>
      </section>

      {/* 搜索与筛选交互组件 */}
      <CourseFilters />

      {courses.length > 0 ? (
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
            />          ))}
        </div>
      ) : (
        <div style={{ 
          textAlign: "center", 
          padding: "5rem 2rem", 
          background: "#fff", 
          borderRadius: "12px", 
          border: "1px solid var(--border-color)",
          color: "#6c757d"
        }}>
          <p style={{ fontSize: "1.2rem" }}>没有找到符合条件的课程。</p>
          <p>请尝试更换搜索词或调整筛选条件。</p>
        </div>
      )}
    </div>
  );
};

export default AllCoursesPage;
