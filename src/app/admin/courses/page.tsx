import React from "react";
import prisma from "@/lib/db/client";
import Link from "next/link";
import { Plus } from "lucide-react";
import CourseActions from "@/components/admin/course-actions";
import CourseFeaturedToggler from "@/components/admin/course-featured-toggler";

const AdminCoursesPage = async () => {
  const courses = await prisma.course.findMany({
    include: {
      _count: {
        select: { lessons: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h3>课程列表</h3>
        <Link href="/admin/courses/new">
          <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Plus size={18} /> 新增课程
          </button>
        </Link>
      </div>

      <div style={{ background: "var(--surface-card)", borderRadius: "12px", border: "1px solid var(--border-color)", boxShadow: "var(--card-shadow)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "var(--surface-muted)", borderBottom: "1px solid var(--border-color)" }}>
              <th style={{ padding: "1rem 1.5rem", width: "120px", color: "var(--text-secondary)", fontWeight: "600" }}>操作</th>
              <th style={{ padding: "1rem 1.5rem", width: "80px", color: "var(--text-secondary)", fontWeight: "600" }}>精选</th>
              <th style={{ padding: "1rem 1.5rem", color: "var(--text-secondary)", fontWeight: "600" }}>课程名称</th>
              <th style={{ padding: "1rem 1.5rem", color: "var(--text-secondary)", fontWeight: "600" }}>课时数</th>
              <th style={{ padding: "1rem 1.5rem", color: "var(--text-secondary)", fontWeight: "600" }}>价格</th>
              <th style={{ padding: "1rem 1.5rem", color: "var(--text-secondary)", fontWeight: "600" }}>创建时间</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(course => (
              <tr key={course.id} style={{ borderBottom: "1px solid var(--border-subtle, var(--border-color))" }}>
                <td style={{ padding: "1.25rem 1.5rem" }}>
                  <CourseActions courseId={course.id} courseTitle={course.title} />
                </td>
                <td style={{ padding: "1.25rem 1.5rem" }}>
                  <CourseFeaturedToggler courseId={course.id} initialFeatured={course.isFeatured} />
                </td>
                <td style={{ padding: "1.25rem 1.5rem" }}>
                  <div style={{ fontWeight: "600", color: "var(--foreground-rgb)" }}>{course.title}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>ID: {course.id}</div>
                </td>
                <td style={{ padding: "1.25rem 1.5rem", color: "var(--text-secondary)" }}>{course._count.lessons} 节课</td>
                <td style={{ padding: "1.25rem 1.5rem", fontWeight: "700", color: "var(--primary)" }}>¥{course.price.toFixed(2)}</td>
                <td style={{ padding: "1.25rem 1.5rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                  {new Date(course.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCoursesPage;
