import React from "react";
import CourseCard from "@/components/course/course-card";
import prisma from "@/lib/db/client";

const HomePage = async () => {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      {/* Hero Section */}
      <section style={{ 
        padding: "4rem 0", 
        textAlign: "center", 
        borderBottom: "1px solid var(--border-color)",
        marginBottom: "3rem"
      }}>
        <h2 style={{ fontSize: "2.5rem", marginBottom: "1rem", color: "var(--foreground-rgb)" }}>
          开启您的中文学习之旅
        </h2>
        <p style={{ fontSize: "1.2rem", color: "#6c757d", maxWidth: "700px", margin: "0 auto" }}>
          源自权威报社的优质内容，结合加密流媒体技术，为您提供沉浸式、高品质的语言学习体验。
        </p>
      </section>
      
      {/* Featured Courses */}
      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "1.75rem", margin: 0 }}>精选课程</h3>
          <span style={{ color: "var(--primary)", cursor: "pointer", fontWeight: 600 }}>查看全部 &rarr;</span>
        </div>
        
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
          gap: "2rem" 
        }}>
          {courses.map(course => (
            <CourseCard 
              key={course.id} 
              id={course.id}
              title={course.title}
              description={course.description}
              price={course.price}
              level="基础级" // 之后可以在 schema 中增加这个字段
              duration="20 课时" // 之后可以在 schema 中增加这个字段
            />
          ))}
        </div>
      </section>

      {/* Trust Banner */}
      <section style={{ 
        marginTop: "5rem", 
        padding: "3rem", 
        background: "#fff", 
        borderRadius: "12px", 
        border: "1px solid var(--border-color)",
        textAlign: "center"
      }}>
        <h4 style={{ color: "var(--primary)", marginBottom: "1rem" }}>权威背书</h4>
        <p style={{ fontSize: "1.1rem" }}>由国家级报社专业团队编写教材，确保语言表达的准确性与时代性。</p>
      </section>
    </div>
  );
};

export default HomePage;
