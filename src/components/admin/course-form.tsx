"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Plus, Eye, EyeOff, Trash2, Video, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { createCourse, updateCourse } from "@/lib/actions/course";

interface LessonData {
  title: string;
  videoUrl: string;
  isPreview: boolean;
  thumbnail?: string; // 用于前端展示生成的缩略图
  duration?: number | null; // 视频时长(秒)
}

interface CourseFormProps {
  initialData?: {
    id: string;
    title: string;
    description: string;
    price: number;
    level: string;
    duration: string;
    thumbnail?: string | null;
    lessons: LessonData[];
  };
}

const CourseForm = ({ initialData }: CourseFormProps) => {
  const getInitialDuration = () => {
    if (!initialData?.duration) return "20";
    const matches = initialData.duration.match(/\d+/);
    return matches ? matches[0] : "20";
  };

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [price, setPrice] = useState(initialData?.price.toString() || "");
  const [level, setLevel] = useState(initialData?.level || "入门级");
  const [duration, setDuration] = useState(getInitialDuration());
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail || "");
  const [lessons, setLessons] = useState<LessonData[]>(initialData?.lessons || []);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log(`[Frontend] 正在上传第 ${index + 1} 章节视频:`, file.name);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) throw new Error("服务器响应错误");
      
      const data = await res.json();
      console.log("[Frontend] 上传成功，服务器返回:", data);
      
      if (data.url) {
        const newLessons = [...lessons];
        newLessons[index].videoUrl = data.url;
        newLessons[index].thumbnail = data.thumbnail; // 将生成的缩略图存入章节
        newLessons[index].duration = data.duration;   // 保存获取到的视频时长
        setLessons(newLessons);
        
        // 逻辑：如果课程当前没有封面，自动使用第一个上传成功的视频封面
        if (!thumbnail && data.thumbnail) {
          console.log("[Frontend] 自动应用课程封面:", data.thumbnail);
          setThumbnail(data.thumbnail);
        }
      }
    } catch (err) {
      console.error("[Frontend] 上传过程发生异常:", err);
      alert("上传或视频处理失败，请检查服务器日志");
    } finally {
      setUploading(false);
    }
  };

  const removeLesson = (index: number) => {
    const lessonTitle = lessons[index].title || `第 ${index + 1} 章节`;
    if (window.confirm(`确定要移除“${lessonTitle}”吗？`)) {
      const newLessons = [...lessons];
      newLessons.splice(index, 1);
      setLessons(newLessons);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lessons.length === 0) {
      alert("请至少添加一个章节");
      return;
    }

    const durationNum = parseInt(duration, 10);
    if (isNaN(durationNum) || durationNum < 0 || durationNum > 100) {
      alert("课时数必须为 0 到 100 之间的有效数字");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title,
        description,
        price: parseFloat(price),
        level,
        duration: durationNum.toString(), // 存入数据库
        thumbnail,
        lessons
      };

      const result = initialData 
        ? await updateCourse(initialData.id, payload)
        : await createCourse(payload);

      if (result.success) {
        alert(initialData ? "课程更新成功！" : "课程发布成功！");
        router.push("/admin/courses");
        router.refresh();
      } else {
        alert(result.error || "保存失败");
      }
    } catch (err) {
      alert("保存请求异常，请检查网络");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* 1. 基础信息卡片 */}
      <section style={{ background: "#fff", padding: "2rem", borderRadius: "12px", border: "1px solid var(--border-color)", boxShadow: "var(--card-shadow)" }}>
        <h4 style={{ marginTop: 0, marginBottom: "1.5rem", color: "#212529" }}>1. 课程基本信息</h4>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          {/* 左侧封面预览 */}
          <div style={{ width: "240px" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "#6c757d", fontWeight: "600" }}>课程主封面</label>
            <div style={{ 
              width: "100%", 
              aspectRatio: "16/9", 
              background: "#f8f9fa", 
              borderRadius: "8px", 
              border: "2px dashed #dee2e6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              position: "relative"
            }}>
              {thumbnail ? (
                <img src={thumbnail} alt="Course Cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ textAlign: "center", color: "#adb5bd" }}>
                  <ImageIcon size={32} style={{ marginBottom: "0.5rem" }} />
                  <div style={{ fontSize: "0.75rem" }}>视频上传后自动提取</div>
                </div>
              )}
            </div>
            {thumbnail && (
              <button 
                type="button" 
                onClick={() => setThumbnail("")}
                style={{ width: "100%", marginTop: "0.5rem", padding: "0.4rem", background: "none", border: "1px solid #dee2e6", borderRadius: "6px", fontSize: "0.75rem", cursor: "pointer", color: "#6c757d" }}
              >
                重置封面
              </button>
            )}
          </div>

          {/* 右侧基本字段 */}
          <div style={{ flex: 1, minWidth: "300px", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "#6c757d", fontWeight: "600" }}>课程标题 <span style={{ color: "var(--primary)" }}>*</span></label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" placeholder="例如：HSK 1 入门汉语" style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid #dee2e6" }} required />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "#6c757d", fontWeight: "600" }}>价格 (元) *</label>
                <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" step="0.01" style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid #dee2e6" }} required />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "#6c757d", fontWeight: "600" }}>课时 *</label>
                <input 
                  value={duration} 
                  onChange={(e) => setDuration(e.target.value)} 
                  type="number" 
                  min="0" 
                  max="100" 
                  style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid #dee2e6" }} 
                  required 
                />
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "#6c757d", fontWeight: "600" }}>课程描述 <span style={{ color: "var(--primary)" }}>*</span></label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid #dee2e6", fontFamily: "inherit" }} required />
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "#6c757d", fontWeight: "600" }}>难易度分级 *</label>
          <div style={{ display: "flex", gap: "0.5rem", maxWidth: "400px" }}>
            {["入门级", "进阶级", "高级"].map((id) => (
              <div 
                key={id} 
                onClick={() => setLevel(id)} 
                style={{ 
                  flex: 1, 
                  textAlign: "center", 
                  padding: "0.75rem", 
                  borderRadius: "8px", 
                  cursor: "pointer", 
                  fontSize: "0.85rem", 
                  fontWeight: "600", 
                  border: level === id ? `2px solid ${id === '入门级' ? 'var(--success)' : id === '进阶级' ? 'var(--warning)' : 'var(--primary)'}` : "1px solid #dee2e6", 
                  background: level === id ? (id === '入门级' ? 'var(--success-light)' : id === '进阶级' ? 'var(--warning-light)' : 'var(--primary-light)') : "#fff", 
                  color: level === id ? (id === '入门级' ? 'var(--success)' : id === '进阶级' ? 'var(--warning)' : 'var(--primary)') : "#6c757d",
                  transition: "all 0.2s"
                }}
              >
                {id}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. 课程大纲卡片 */}
      <section style={{ background: "#fff", padding: "2rem", borderRadius: "12px", border: "1px solid var(--border-color)", boxShadow: "var(--card-shadow)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h4 style={{ margin: 0, color: "#212529" }}>2. 章节内容管理</h4>
          <button type="button" onClick={() => setLessons([...lessons, { title: "", videoUrl: "", isPreview: false }])} style={{ background: "var(--primary)", color: "#fff", border: "none", padding: "0.5rem 1.25rem", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", fontWeight: "600" }}>
            <Plus size={18} /> 添加新章节
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Table Header */}
          <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 1.5fr 120px 40px", gap: "1.5rem", padding: "0 1.5rem", color: "#adb5bd", fontSize: "0.75rem", fontWeight: "700" }}>
            <span>#</span>
            <span>章节标题</span>
            <span>视频资源与封面</span>
            <span style={{ textAlign: "center" }}>权限设置</span>
            <span></span>
          </div>

          {lessons.map((lesson, index) => (
            <div key={index} style={{ 
              display: "grid", 
              gridTemplateColumns: "40px 1fr 1.5fr 120px 40px", 
              gap: "1.5rem", 
              alignItems: "center", 
              padding: "1.25rem 1.5rem", 
              background: "#fff", 
              border: "1px solid #eee", 
              borderRadius: "12px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
            }}>
              <div style={{ fontWeight: "800", color: "#dee2e6", fontSize: "1.2rem" }}>{index + 1}</div>
              
              <input 
                value={lesson.title} 
                onChange={(e) => {
                  const newLessons = [...lessons];
                  newLessons[index].title = e.target.value;
                  setLessons(newLessons);
                }} 
                type="text" 
                placeholder="章节标题" 
                style={{ width: "100%", padding: "0.7rem", border: "1px solid #eee", borderRadius: "8px", fontSize: "0.9rem" }} 
                required 
              />

              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <button type="button" style={{ padding: "0.5rem 1rem", border: "1px solid #ddd", background: "#f8f9fa", borderRadius: "8px", fontSize: "0.85rem", cursor: "pointer", fontWeight: "600" }}>选择视频</button>
                  <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, index)} style={{ position: "absolute", top: 0, left: 0, opacity: 0, width: "100%", height: "100%", cursor: "pointer" }} />
                </div>
                
                {lesson.videoUrl && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", minWidth: 0 }}>
                    <div style={{ color: "var(--success)", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", fontWeight: "700" }}>
                      <CheckCircle2 size={16} /> 已就绪
                    </div>
                    {lesson.thumbnail && (
                      <button 
                        type="button" 
                        onClick={() => setThumbnail(lesson.thumbnail!)}
                        style={{ background: "var(--success-light)", color: "var(--success)", border: "none", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "700", cursor: "pointer" }}
                        title="使用此章节的截图作为课程主封面"
                      >
                        设为课程主封面
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <button 
                  type="button" 
                  onClick={() => {
                    const newLessons = [...lessons];
                    newLessons[index].isPreview = !newLessons[index].isPreview;
                    setLessons(newLessons);
                  }}
                  style={{ 
                    background: lesson.isPreview ? "var(--success-light)" : "transparent", 
                    color: lesson.isPreview ? "var(--success)" : "#adb5bd", 
                    border: "1px solid", 
                    borderColor: lesson.isPreview ? "var(--success)" : "#ddd", 
                    borderRadius: "20px", 
                    padding: "0.3rem 0.8rem", 
                    fontSize: "0.75rem", 
                    cursor: "pointer", 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "0.4rem", 
                    fontWeight: "700" 
                  }}
                >
                  {lesson.isPreview ? <><Eye size={14} /> 试看</> : <><EyeOff size={14} /> 锁定</>}
                </button>
              </div>

              <button 
                type="button" 
                onClick={() => removeLesson(index)} 
                style={{ background: "none", border: "none", color: "#adb5bd", cursor: "pointer", transition: "color 0.2s" }}
                onMouseOver={(e) => (e.currentTarget.style.color = "var(--primary)")}
                onMouseOut={(e) => (e.currentTarget.style.color = "#adb5bd")}
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          {lessons.length === 0 && (
            <div style={{ textAlign: "center", padding: "4rem", color: "#adb5bd", border: "1px dashed #dee2e6", borderRadius: "12px", background: "#f8f9fa" }}>
              尚未添加任何章节内容
            </div>
          )}
        </div>
      </section>

      {/* Footer Actions */}
      <div style={{ display: "flex", gap: "1.5rem", justifyContent: "flex-end", marginBottom: "5rem", paddingTop: "1.5rem", borderTop: "1px solid #eee" }}>
        <button type="button" onClick={() => router.back()} style={{ padding: "0.8rem 3rem", borderRadius: "10px", border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontWeight: "600", fontSize: "1rem" }}>取消</button>
        <button 
          type="submit" 
          disabled={uploading || isSubmitting} 
          className="btn-primary" 
          style={{ 
            padding: "0.8rem 6rem", 
            borderRadius: "10px", 
            display: "flex", 
            alignItems: "center", 
            gap: "0.75rem", 
            opacity: (uploading || isSubmitting) ? 0.7 : 1, 
            fontSize: "1.1rem",
            boxShadow: "0 10px 20px rgba(200, 16, 46, 0.2)"
          }}
        >
          <Save size={22} /> {(uploading || isSubmitting) ? "请稍候..." : (initialData ? "保存并更新" : "确认发布课程")}
        </button>
      </div>
    </form>
  );
};

export default CourseForm;
