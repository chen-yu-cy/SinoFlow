import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/db/client";
import VideoPlayer from "@/components/course/video-player";
import PurchaseButton from "@/components/course/purchase-button";

interface CourseDetailPageProps {
  params: Promise<{ id: string }>;
}

const CourseDetailPage = async ({ params }: CourseDetailPageProps) => {
  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: { id },
    include: { lessons: { orderBy: { order: 'asc' } } }
  });

  if (!course) {
    notFound();
  }

  return (
    <div className="course-detail-container">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        {/* Main Content: Video and Description */}
        <section>
          <VideoPlayer url={course.lessons[0]?.videoUrl || ""} />
          <h1 style={{ marginTop: '1.5rem' }}>{course.title}</h1>
          <p style={{ color: '#666', lineHeight: '1.6' }}>{course.description}</p>
          
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
            <h3>关于本课程</h3>
            <div style={{ marginBottom: '1.5rem' }}>
              <p>价格: <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>¥{course.price.toFixed(2)}</span></p>
            </div>
            <PurchaseButton courseId={course.id} price={course.price} />
          </div>
        </section>

        {/* Sidebar: Lesson List */}
        <aside>
          <div style={{ border: '1px solid #eaeaea', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ padding: '1rem', background: '#fafafa', borderBottom: '1px solid #eaeaea' }}>
              <h3 style={{ margin: 0 }}>课程目录</h3>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {course.lessons.map((lesson) => (
                <li key={lesson.id} style={{ 
                  padding: '1rem', 
                  borderBottom: '1px solid #eaeaea', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{ 
                    width: '24px', 
                    height: '24px', 
                    borderRadius: '50%', 
                    background: '#eee', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginRight: '0.8rem',
                    fontSize: '0.8rem'
                  }}>
                    {lesson.order}
                  </span>
                  <span style={{ fontSize: '0.9rem' }}>{lesson.title}</span>
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
