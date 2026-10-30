// FILE: src/components/course/lesson-content.tsx
"use client";

import React, { useState } from "react";
import VideoPlayer from "@/components/course/video-player";
import PurchaseNotice from "@/components/course/purchase-notice";
import { PlayCircle, Lock, Info, BookText } from "lucide-react";
import { toggleLessonProgressAction } from "@/lib/actions/progress";

interface LessonContentProps {
  course: {
    id: string;
    title: string;
    description: string;
    price: number;
    lessons: { id: string; title: string; videoUrl: string; order: number; isPreview: boolean }[];
  };
  hasFullAccess: boolean;
  initialCompletedLessonIds?: string[];
  labels?: {
    learningTitle: string;
    introTitle: string;
    curriculumTitle: string;
    progressTitle: string;
  };
}

const LessonContent = ({ course, hasFullAccess, initialCompletedLessonIds = [], labels }: LessonContentProps) => {
  const t = labels || {
    learningTitle: "正在学习",
    introTitle: "课程简介",
    curriculumTitle: "课程目录",
    progressTitle: "学习进度",
  };

  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [completedIds, setCompletedIds] = useState<string[]>(initialCompletedLessonIds);
  const currentLesson = course.lessons[currentLessonIndex];

  // A user has access if they have full access OR the current lesson is a preview
  const canViewCurrentLesson = hasFullAccess || currentLesson?.isPreview;

  const handleLessonClick = (index: number) => {
    setCurrentLessonIndex(index);
    setHasInteracted(true);
  };

  // 手动切换打卡状态
  const handleToggleProgress = async (lessonId: string) => {
    const isCompleted = completedIds.includes(lessonId);
    
    // 乐观 UI 更新
    if (isCompleted) {
      setCompletedIds((prev) => prev.filter((id) => id !== lessonId));
    } else {
      setCompletedIds((prev) => [...prev, lessonId]);
    }

    try {
      const res = await toggleLessonProgressAction(lessonId, !isCompleted);
      if (res.error) {
        alert(res.error);
        // 发生错误时回滚状态
        if (isCompleted) {
          setCompletedIds((prev) => [...prev, lessonId]);
        } else {
          setCompletedIds((prev) => prev.filter((id) => id !== lessonId));
        }
      }
    } catch (err) {
      // 发生异常时回滚状态
      if (isCompleted) {
        setCompletedIds((prev) => [...prev, lessonId]);
      } else {
        setCompletedIds((prev) => prev.filter((id) => id !== lessonId));
      }
    }
  };

  // 视频播放结束自动打卡
  const handleVideoEnded = async () => {
    if (!currentLesson) return;

    // 如果还没有打卡，且拥有访问权限，则触发自动打卡
    if (!completedIds.includes(currentLesson.id) && hasFullAccess) {
      try {
        const res = await toggleLessonProgressAction(currentLesson.id, true);
        if (res.success) {
          setCompletedIds((prev) => [...prev, currentLesson.id]);
        }
      } catch (err) {
        console.error("自动打卡失败:", err);
      }
    }
  };

  // 计算当前的进度
  const completedLessonsCount = course.lessons.filter((l) => completedIds.includes(l.id)).length;
  const progressPercentage = Math.round((completedLessonsCount / (course.lessons.length || 1)) * 100);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '3rem' }}>
      {/* Main Content: Video and Description */}
      <section>
        <div style={{ marginBottom: "2rem" }}>
          {canViewCurrentLesson ? (
            <VideoPlayer 
              url={currentLesson?.videoUrl || ""} 
              autoPlay={hasInteracted} 
              onEnded={handleVideoEnded}
            />
          ) : (
            <PurchaseNotice price={course.price} />
          )}
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--primary)", marginBottom: "1rem" }}>
          <BookText size={24} />
          <span style={{ fontWeight: "700", fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "1px" }}>{t.learningTitle}</span>
        </div>

        <h1 style={{ fontSize: "2.5rem", marginBottom: "1.5rem", fontWeight: "800" }}>{currentLesson?.title || course.title}</h1>
        
        <div style={{ background: "#fff", padding: "2rem", borderRadius: "12px", border: "1px solid var(--border-color)", boxShadow: "var(--card-shadow)" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <Info size={20} color="var(--primary)" /> {t.introTitle}
          </h3>
          <p style={{ color: '#495057', lineHeight: '1.8', fontSize: "1.05rem" }}>{course.description}</p>
        </div>
      </section>

      {/* Sidebar: Lesson List */}
      <aside>
        <div style={{ background: "#fff", border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', boxShadow: "var(--card-shadow)", position: "sticky", top: "100px" }}>
          
          {/* Sidebar Header & Progress Bar */}
          <div style={{ padding: '1.25rem 1.5rem', background: '#f8f9fa', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: "0 0 0.75rem 0", display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <PlayCircle size={20} /> {t.curriculumTitle}
            </h3>
            {hasFullAccess && (
              <div style={{ marginTop: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#6c757d", marginBottom: "0.3rem", fontWeight: "600" }}>
                  <span>{t.progressTitle}: {progressPercentage}%</span>
                  <span>{completedLessonsCount} / {course.lessons.length}</span>
                </div>
                <div style={{ width: "100%", height: "6px", background: "#dee2e6", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${progressPercentage}%`, height: "100%", background: "var(--success)", transition: "width 0.3s ease" }}></div>
                </div>
              </div>
            )}
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {course.lessons.map((lesson, index) => {
              const isActive = index === currentLessonIndex;
              const isLocked = !hasFullAccess && !lesson.isPreview;
              const isCompleted = completedIds.includes(lesson.id);

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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                    {/* Checkbox for tracking completed status manually */}
                    {!isLocked && (
                      <input 
                        type="checkbox"
                        checked={isCompleted}
                        onChange={(e) => {
                          e.stopPropagation(); // 阻止点击复选框触发课程切换
                          handleToggleProgress(lesson.id);
                        }}
                        style={{ 
                          width: "16px", 
                          height: "16px", 
                          cursor: "pointer", 
                          accentColor: "var(--success)", 
                          flexShrink: 0 
                        }}
                      />
                    )}
                    
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
                      fontWeight: "700",
                      flexShrink: 0
                    }}>
                      {lesson.order}
                    </span>
                    
                    <span style={{ 
                      fontSize: '1rem', 
                      fontWeight: isActive ? "700" : "500",
                      color: isActive ? "var(--primary)" : "var(--foreground-rgb)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}>
                      {lesson.title}
                    </span>
                  </div>
                  
                  {isLocked ? (
                    <Lock size={16} color="#adb5bd" style={{ flexShrink: 0, marginLeft: "1rem" }} />
                  ) : (
                    lesson.isPreview && !hasFullAccess ? (
                      <span style={{ fontSize: "0.7rem", color: "var(--success)", fontWeight: "bold", border: "1px solid var(--success)", padding: "0.1rem 0.4rem", borderRadius: "4px", flexShrink: 0, marginLeft: "1rem" }}>试看</span>
                    ) : (
                      <PlayCircle size={18} color={isActive ? "var(--primary)" : "#adb5bd"} style={{ flexShrink: 0, marginLeft: "1rem" }} />
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
