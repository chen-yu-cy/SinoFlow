// FILE: src/components/course/lesson-content.tsx
"use client";

import React, { useState, useEffect } from "react";
import VideoPlayer from "@/components/course/video-player";
import PurchaseNotice from "@/components/course/purchase-notice";
import { PlayCircle, Lock, Info, BookText, FileText, Download, PenTool } from "lucide-react";
import { toggleLessonProgressAction } from "@/lib/actions/progress";
import { getNotesAction, createNoteAction, deleteNoteAction } from "@/lib/actions/note";

interface LessonContentProps {
  course: {
    id: string;
    title: string;
    description: string;
    price: number;
    lessons: { id: string; title: string; videoUrl: string; order: number; isPreview: boolean; duration?: number | null }[];
    resources?: { id: string; title: string; fileUrl: string; fileSize: string | null }[];
  };
  hasFullAccess: boolean;
  initialCompletedLessonIds?: string[];
  labels?: {
    learningTitle: string;
    introTitle: string;
    curriculumTitle: string;
    progressTitle: string;
    resourcesTitle: string;
    noResources: string;
    unlockResources: string;
    subscribersOnly?: string;
    unlockDescription?: string;
    unlockAll?: string;
    paymentSupport?: string;
  };
}

const formatLessonDuration = (seconds?: number | null) => {
  if (!seconds) return "";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const LessonContent = ({ course, hasFullAccess, initialCompletedLessonIds = [], labels }: LessonContentProps) => {
  const t = labels || {
    learningTitle: "正在学习",
    introTitle: "课程简介",
    curriculumTitle: "课程目录",
    progressTitle: "学习进度",
    resourcesTitle: "配套学习资料",
    noResources: "暂无配套学习资料",
    unlockResources: "请先购买该课程以解锁学习资料",
    subscribersOnly: "此内容仅限订阅学员观看",
    unlockDescription: "加入我们的学习计划，解锁完整的 HLS 加密课程视频，获得权威报社为您准备的专业教材。",
    unlockAll: "立即解锁全部内容",
    paymentSupport: "支持微信支付 / 支付宝"
  };

  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [completedIds, setCompletedIds] = useState<string[]>(initialCompletedLessonIds);
  
  // 笔记相关状态
  const [activeTab, setActiveTab] = useState<"intro" | "notes">("intro");
  const [notes, setNotes] = useState<any[]>([]);
  const [noteContent, setNoteContent] = useState("");
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [seekToTime, setSeekToTime] = useState<number | null>(null);

  const currentLesson = course.lessons[currentLessonIndex];

  // 监听课时切换，重新加载笔记
  useEffect(() => {
    if (currentLesson) {
      loadNotes();
    }
  }, [currentLessonIndex]);

  const loadNotes = async () => {
    if (!currentLesson || !hasFullAccess) return;
    try {
      const res = await getNotesAction(currentLesson.id);
      if (res.success && res.notes) {
        setNotes(res.notes);
      }
    } catch (err) {
      console.error("加载笔记失败:", err);
    }
  };

  const handleSaveNote = async () => {
    if (!currentLesson) return;
    if (!noteContent.trim()) {
      alert("请输入笔记内容");
      return;
    }
    try {
      const res = await createNoteAction(currentLesson.id, noteContent, currentVideoTime);
      if (res.success && res.note) {
        setNoteContent("");
        loadNotes();
      } else if (res.error) {
        alert(res.error);
      }
    } catch (err) {
      console.error("保存笔记失败:", err);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("确定要删除这条笔记吗？")) return;
    try {
      const res = await deleteNoteAction(noteId);
      if (res.success) {
        loadNotes();
      } else if (res.error) {
        alert(res.error);
      }
    } catch (err) {
      console.error("删除笔记失败:", err);
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

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
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '3rem', alignItems: 'start' }}>
      {/* Main Content: Video and Description */}
      <section>
        <div style={{ marginBottom: "2rem" }}>
          {canViewCurrentLesson ? (
            <VideoPlayer 
              url={currentLesson?.videoUrl || ""} 
              autoPlay={hasInteracted} 
              onEnded={handleVideoEnded}
              isLimitedPreview={!hasFullAccess && currentLesson?.isPreview}
              seekToTime={seekToTime}
              onSeekProcessed={() => setSeekToTime(null)}
              onTimeUpdate={(time) => setCurrentVideoTime(time)}
            />
          ) : (
            <PurchaseNotice 
              price={course.price} 
              labels={{
                subscribersOnly: t.subscribersOnly,
                unlockDescription: t.unlockDescription,
                unlockAll: t.unlockAll,
                paymentSupport: t.paymentSupport
              }}
            />
          )}
        </div>
        
        {canViewCurrentLesson && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--primary)", marginBottom: "1rem" }}>
            <BookText size={24} />
            <span style={{ fontWeight: "700", fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "1px" }}>{t.learningTitle}</span>
          </div>
        )}

        <h1 style={{ fontSize: "2.5rem", marginBottom: "1.5rem", fontWeight: "800" }}>
          {canViewCurrentLesson ? (currentLesson?.title || course.title) : course.title}
        </h1>
        
        {/* Tab 栏切换 */}
        <div style={{ display: "flex", borderBottom: "2px solid #e9ecef", marginBottom: "1.5rem" }}>
          <button 
            onClick={() => setActiveTab("intro")}
            style={{
              padding: "0.75rem 1.5rem",
              background: "none",
              border: "none",
              borderBottom: activeTab === "intro" ? "3px solid var(--primary)" : "none",
              color: activeTab === "intro" ? "var(--primary)" : "#6c757d",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "1rem",
              marginBottom: "-2px"
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <Info size={18} /> {t.introTitle}
            </span>
          </button>
          <button 
            onClick={() => setActiveTab("notes")}
            style={{
              padding: "0.75rem 1.5rem",
              background: "none",
              border: "none",
              borderBottom: activeTab === "notes" ? "3px solid var(--primary)" : "none",
              color: activeTab === "notes" ? "var(--primary)" : "#6c757d",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "1rem",
              marginBottom: "-2px"
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <PenTool size={18} /> 我的笔记 {!hasFullAccess ? "🔒" : `(${notes.length})`}
            </span>
          </button>
        </div>

        {/* Tab 内容区 */}
        {activeTab === "intro" ? (
          <div style={{ background: "#fff", padding: "2rem", borderRadius: "12px", border: "1px solid var(--border-color)", boxShadow: "var(--card-shadow)" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem", marginTop: 0 }}>
              <Info size={20} color="var(--primary)" /> {t.introTitle}
            </h3>
            <p style={{ color: '#495057', lineHeight: '1.8', fontSize: "1.05rem", margin: 0 }}>{course.description}</p>
          </div>
        ) : (
          <div style={{ background: "#fff", padding: "2rem", borderRadius: "12px", border: "1px solid var(--border-color)", boxShadow: "var(--card-shadow)" }}>
            {!hasFullAccess ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2.5rem 1rem" }}>
                <div style={{ 
                  background: "rgba(200, 16, 46, 0.06)", 
                  color: "var(--primary)", 
                  padding: "1rem", 
                  borderRadius: "50%", 
                  marginBottom: "1.25rem",
                  display: "inline-flex",
                  boxShadow: "0 4px 12px rgba(200, 16, 46, 0.1)"
                }}>
                  <Lock size={32} />
                </div>
                <h4 style={{ margin: "0 0 0.75rem 0", fontSize: "1.3rem", fontWeight: "800", color: "#212529" }}>
                  专属随堂笔记功能
                </h4>
                <p style={{ margin: "0 0 1.5rem 0", color: "#6c757d", fontSize: "0.95rem", maxWidth: "420px", lineHeight: "1.6" }}>
                  购买该课程后即可解锁时间戳记笔记特权！支持在播放至任意时间一键截取记录，点击时间戳快速定位跳转视频，为您定制最高效的复习通路。
                </p>
                <button 
                  onClick={() => {
                    const purchaseSection = document.getElementById("purchase-section") || document.querySelector("button.btn-primary");
                    if (purchaseSection) {
                      purchaseSection.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="btn-primary" 
                  style={{ 
                    padding: "0.6rem 2.25rem", 
                    borderRadius: "20px", 
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    boxShadow: "0 6px 15px rgba(200, 16, 46, 0.25)"
                  }}
                >
                  立即购买解锁完整特权
                </button>
              </div>
            ) : (
              <>
                <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem", marginTop: 0 }}>
                  <PenTool size={20} color="var(--primary)" /> 学习笔记
                </h3>
                
                {/* 笔记编辑卡片 */}
                <div style={{ background: "#f8f9fa", padding: "1.25rem", borderRadius: "8px", border: "1px solid #e9ecef", marginBottom: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                    <span style={{ fontSize: "0.9rem", color: "#495057", fontWeight: "600" }}>
                      记录时间戳: <span style={{ color: "var(--primary)", fontFamily: "monospace", fontSize: "1rem" }}>{formatTime(currentVideoTime)}</span>
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "#6c757d" }}>
                      (视频播放时会自动追踪当前时间点)
                    </span>
                  </div>
                  <textarea
                    placeholder="在此记录本课时的知识点、心得或疑问..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    style={{
                      width: "100%",
                      minHeight: "100px",
                      padding: "0.75rem",
                      borderRadius: "6px",
                      border: "1px solid #ced4da",
                      outline: "none",
                      fontSize: "0.95rem",
                      resize: "vertical",
                      marginBottom: "0.75rem",
                      boxSizing: "border-box"
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      onClick={handleSaveNote}
                      style={{
                        background: "var(--primary)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "20px",
                        padding: "0.5rem 1.75rem",
                        fontSize: "0.9rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        boxShadow: "0 4px 10px rgba(200, 16, 46, 0.2)",
                        transition: "all 0.2s"
                      }}
                    >
                      保存笔记
                    </button>
                  </div>
                </div>

                {/* 笔记列表展示 */}
                {notes.length === 0 ? (
                  <p style={{ textAlign: "center", color: "#868e96", fontStyle: "italic", margin: "2rem 0" }}>
                    暂无本节笔记，开始在上方写下你的第一条笔记吧！
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {notes.map((note) => (
                      <div 
                        key={note.id}
                        style={{
                          padding: "1rem 1.25rem",
                          borderRadius: "8px",
                          border: "1px solid #e9ecef",
                          background: "#fff",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "1.5rem"
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", flex: 1 }}>
                          <span 
                            onClick={() => setSeekToTime(note.timestamp)}
                            style={{
                              fontSize: "0.85rem",
                              color: "var(--primary)",
                              fontWeight: "700",
                              fontFamily: "monospace",
                              background: "rgba(200, 16, 46, 0.06)",
                              padding: "0.2rem 0.6rem",
                              borderRadius: "4px",
                              alignSelf: "flex-start",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.25rem"
                            }}
                            title="点击跳转到视频时间"
                          >
                            ⏱️ {formatTime(note.timestamp)}
                          </span>
                          <p style={{ margin: 0, fontSize: "0.95rem", color: "#343a40", whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                            {note.content}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleDeleteNote(note.id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#adb5bd",
                            cursor: "pointer",
                            padding: 0,
                            fontSize: "0.85rem",
                            fontWeight: "600",
                            transition: "color 0.2s"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = "var(--primary)"}
                          onMouseLeave={(e) => e.currentTarget.style.color = "#adb5bd"}
                        >
                          删除
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
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
                      fontSize: '0.95rem', 
                      fontWeight: isActive ? "700" : "500",
                      color: isActive ? "var(--primary)" : "var(--foreground-rgb)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flex: 1
                    }}>
                      {lesson.title}
                    </span>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexShrink: 0, marginLeft: "1rem" }}>
                    {lesson.duration && (
                      <span style={{ 
                        fontSize: "0.75rem", 
                        color: "#8c9299",
                        background: "#f1f3f5",
                        padding: "0.15rem 0.45rem",
                        borderRadius: "12px",
                        fontWeight: "600",
                        fontFamily: "monospace"
                      }}>
                        {formatLessonDuration(lesson.duration)}
                      </span>
                    )}

                    {isLocked ? (
                      <Lock size={16} color="#adb5bd" />
                    ) : (
                      lesson.isPreview && !hasFullAccess ? (
                        <span style={{ fontSize: "0.7rem", color: "var(--success)", fontWeight: "bold", border: "1px solid var(--success)", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>试看</span>
                      ) : (
                        <PlayCircle size={18} color={isActive ? "var(--primary)" : "#adb5bd"} />
                      )
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {/* 配套学习资料 (Resources) 区域 */}
          <div style={{ padding: '1.5rem', background: '#fcfcfc', borderTop: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "1.1rem", fontWeight: "700", color: "var(--foreground-rgb)" }}>
              <FileText size={18} color="var(--primary)" /> {t.resourcesTitle}
            </h3>

            {(!course.resources || course.resources.length === 0) ? (
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#868e96", fontStyle: "italic" }}>
                {t.noResources}
              </p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {course.resources.map((res) => {
                  const downloadUrl = `/api/courses/${course.id}/resources/${res.id}`;
                  
                  return (
                    <li 
                      key={res.id}
                      style={{
                        padding: "0.75rem 1rem",
                        background: "#fff",
                        border: "1px solid #e9ecef",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        opacity: hasFullAccess ? 1 : 0.65,
                        transition: "all 0.2s ease-in-out",
                        cursor: hasFullAccess ? "pointer" : "not-allowed"
                      }}
                      onMouseEnter={(e) => {
                        if (hasFullAccess) {
                          e.currentTarget.style.borderColor = "var(--primary)";
                          e.currentTarget.style.boxShadow = "0 2px 8px rgba(200, 16, 46, 0.08)";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (hasFullAccess) {
                          e.currentTarget.style.borderColor = "#e9ecef";
                          e.currentTarget.style.boxShadow = "none";
                          e.currentTarget.style.transform = "none";
                        }
                      }}
                      onClick={() => {
                        if (!hasFullAccess) {
                          alert(t.unlockResources);
                        } else {
                          window.open(downloadUrl, "_blank");
                        }
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", overflow: "hidden", flex: 1 }}>
                        <FileText size={20} color={hasFullAccess ? "var(--primary)" : "#adb5bd"} style={{ flexShrink: 0 }} />
                        <div style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "#343a40", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {res.title}
                          </span>
                          {res.fileSize && (
                            <span style={{ fontSize: "0.75rem", color: "#868e96", marginTop: "0.15rem" }}>
                              {res.fileSize}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ flexShrink: 0, marginLeft: "0.5rem" }}>
                        {hasFullAccess ? (
                          <Download size={16} color="var(--primary)" style={{ cursor: "pointer" }} />
                        ) : (
                          <Lock size={16} color="#adb5bd" />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default LessonContent;
