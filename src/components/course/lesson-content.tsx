"use client";

import React, { useState } from "react";
import VideoPlayer from "@/components/course/video-player";
import PurchaseNotice from "@/components/course/purchase-notice";
import { PlayCircle, Lock, Info, BookText } from "lucide-react";

interface LessonContentProps {
  course: {
    id: string;
    title: string;
    description: string;
    price: number;
    lessons: { id: string; title: string; videoUrl: string; order: number; isPreview: boolean }[];
  };
  hasFullAccess: boolean;
}

const LessonContent = ({ course, hasFullAccess }: LessonContentProps) => {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const currentLesson = course.lessons[currentLessonIndex];

  // A user has access if they have full access OR the current lesson is a preview
  const canViewCurrentLesson = hasFullAccess || currentLesson?.isPreview;

  const handleLessonClick = (index: number) => {
    setCurrentLessonIndex(index);
    setHasInteracted(true);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '3rem' }}>
      {/* Main Content: Video and Description */}
      <section>
        <div style={{ marginBottom: "2rem" }}>
          {canViewCurrentLesson ? (
            <VideoPlayer url={currentLesson?.videoUrl || ""} autoPlay={hasInteracted} />
          ) : (
            <PurchaseNotice price={course.price} />
          )}
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--primary)", marginBottom: "1rem" }}>
          <BookText size={24} />
          <span style={{ fontWeight: "700", fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "1px" }}>正在学习</span>
        </div>

        <h1 style={{ fontSize: "2.5rem", marginBottom: "1.5rem", fontWeight: "800" }}>{currentLesson?.title || course.title}</h1>
        
        <div style={{ background: "#fff", padding: "2rem", borderRadius: "12px", border: "1px solid var(--border-color)", boxShadow: "var(--card-shadow)" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <Info size={20} color="var(--primary)" /> 课程简介
          </h3>
          <p style={{ color: '#495057', lineHeight: '1.8', fontSize: "1.05rem" }}>{course.description}</p>
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
            {course.lessons.map((lesson, index) => {
              const isActive = index === currentLessonIndex;
              const isLocked = !hasFullAccess && !lesson.isPreview;

              return (
                <li 
                  key={lesson.id} 
                  onClick={() => handleLessonClick(index)}
                  style={{ 
                    padding: '1.25rem 1.5rem', 
                    borderBottom: index === course.lessons.length - 1 ? 'none' : '1px solid #f1f3f5', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: "space-between",
                    background: isActive ? "var(--primary-light)" : "transparent",
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ 
                      width: '28px', 
                      height: '28px', 
                      borderRadius: '50%', 
                      background: isActive ? "var(--primary)" : (isLocked ? '#f1f3f5' : 'var(--success-light)'), 
                      color: isActive ? "#fff" : (isLocked ? '#adb5bd' : 'var(--success)'),
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: "700"
                    }}>
                      {lesson.order}
                    </span>
                    <span style={{ 
                      fontSize: '1rem', 
                      fontWeight: isActive ? "700" : "500",
                      color: isActive ? "var(--primary)" : "var(--foreground-rgb)"
                    }}>
                      {lesson.title}
                    </span>
                  </div>
                  {isLocked ? (
                    <Lock size={16} color="#adb5bd" />
                  ) : (
                    lesson.isPreview && !hasFullAccess ? (
                      <span style={{ fontSize: "0.7rem", color: "var(--success)", fontWeight: "bold", border: "1px solid var(--success)", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>试看</span>
                    ) : (
                      <PlayCircle size={18} color={isActive ? "var(--primary)" : "#adb5bd"} />
                    )
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default LessonContent;
