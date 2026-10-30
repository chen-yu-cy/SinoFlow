"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Plus, Eye, EyeOff, Trash2, Video, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { createCourse, updateCourse } from "@/lib/actions/course";

interface CourseFormProps {
  initialData?: {
    id: string;
    title: string;
    description: string;
    price: number;
    level: string;
    duration: string;
    thumbnail?: string | null;
    lessons: { title: string; videoUrl: string; isPreview: boolean }[];
  };
}

const CourseForm = ({ initialData }: CourseFormProps) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [price, setPrice] = useState(initialData?.price.toString() || "");
  const [level, setLevel] = useState(initialData?.level || "入门级");
  const [duration, setDuration] = useState(initialData?.duration || "20 课时");
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail || "");
  const [lessons, setLessons] = useState(initialData?.lessons || []);
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
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.url) {
        const newLessons = [...lessons];
        newLessons[index].videoUrl = data.url;
        setLessons(newLessons);
        
        // 如果目前没有课程封面，自动将第一个视频生成的封面设为主封面
        if (!thumbnail && data.thumbnail) {
          setThumbnail(data.thumbnail);
        }
      }
    } catch (err) {
      alert("上传或处理失败");
    } finally {
      setUploading(false);
    }
  };

  const removeLesson = (index: number) => {
    const lessonTitle = lessons[index].title || `第 ${index + 1} 章节`;
    if (window.confirm(`确定要移除“${lessonTitle}”吗？记得点击页面底部的“保存并发布”以生效。`)) {
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

    setIsSubmitting(true);
    try {
      const payload = { title, description, price: parseFloat(price), level, duration, thumbnail, lessons };
      const result = initialData ? await updateCourse(initialData.id, payload) : await createCourse(payload);

      if (result.success) {
        alert(initialData ? "课程更新成功！" : "课程发布成功！");
        router.push("/admin/courses");
        router.refresh();
      } else {
        alert(result.error || "操作失败");
      }
    } catch (err) {
      alert("请求异常，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* 1. 基础信息卡片 */}
      <section style={{ background: "#fff", padding: "2rem", borderRadius: "12px", border: "1px solid var(--border-color)", boxShadow: "var(--card-shadow)" }}>
        <h4 style={{ marginTop: 0, marginBottom: "1.5rem", color: "#212529" }}>1. 课程基本信息</h4>
        <div style={{ display: "flex", gap: "2rem" }}>
          {/* 左侧封面预览 */}
          <div style={{ width: "240px" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "#6c757d", fontWeight: "600" }}>课程封面</label>
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
                <img src={thumbnail} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ textAlign: "center", color: "#adb5bd" }}>
                  <ImageIcon size={32} style={{ marginBottom: "0.5rem" }} />
                  <div style={{ fontSize: "0.75rem" }}>上传视频后自动生成</div>
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

          {/* 右侧基本信息 */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "#6c757d", fontWeight: "600" }}>课程标题 <span style={{ color: "var(--primary)" }}>*</span></label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" placeholder="例如：HSK 1 入门汉语" style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid #dee2e6" }} required />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "#6c757d", fontWeight: "600" }}>价格 (元) *</label>
              <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" step="0.01" style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid #dee2e6" }} required />
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "#6c757d", fontWeight: "600" }}>课程描述 <span style={{ color: "var(--primary)" }}>*</span></label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid #dee2e6", fontFamily: "inherit" }} required />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1.5rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "#6c757d", fontWeight: "600" }}>难易度 *</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {["入门级", "进阶级", "高级"].map((id) => (
                <div key={id} onClick={() => setLevel(id)} style={{ flex: 1, textAlign: "center", padding: "0.75rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600", border: level === id ? `2px solid ${id === '入门级' ? 'var(--success)' : id === '进阶级' ? 'var(--warning)' : 'var(--primary)'}` : "1px solid #dee2e6", background: level === id ? (id === '入门级' ? 'var(--success-light)' : id === '进阶级' ? 'var(--warning-light)' : 'var(--primary-light)') : "#fff", color: level === id ? (id === '入门级' ? 'var(--success)' : id === '进阶级' ? 'var(--warning)' : 'var(--primary)') : "#6c757d" }}>{id}</div>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "#6c757d", fontWeight: "600" }}>课时描述 *</label>
            <input value={duration} onChange={(e) => setDuration(e.target.value)} type="text" style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid #dee2e6" }} required />
          </div>
        </div>
      </section>

      {/* 2. 课程大纲卡片 */}
      <section style={{ background: "#fff", padding: "2rem", borderRadius: "12px", border: "1px solid var(--border-color)", boxShadow: "var(--card-shadow)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h4 style={{ margin: 0, color: "#212529" }}>2. 章节内容管理</h4>
          <button type="button" onClick={() => setLessons([...lessons, { title: "", videoUrl: "", isPreview: false }])} style={{ background: "var(--primary)", color: "#fff", border: "none", padding: "0.5rem 1.2rem", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", fontWeight: "600" }}>
            <Plus size={18} /> 添加新章节
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "40px 2fr 2fr 100px 40px", gap: "1rem", padding: "0 1rem", color: "#adb5bd", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase" }}>
            <span>#</span>
            <span>章节标题</span>
            <span>视频资源</span>
            <span style={{ textAlign: "center" }}>试看</span>
            <span></span>
          </div>

          {lessons.map((lesson, index) => (
            <div key={index} style={{ display: "grid", gridTemplateColumns: "40px 2fr 2fr 100px 40px", gap: "1rem", alignItems: "center", padding: "1rem", background: "#fff", border: "1px solid #eee", borderRadius: "10px" }}>
              <div style={{ fontWeight: "700", color: "#dee2e6", fontSize: "1.1rem" }}>{index + 1}</div>
              <input value={lesson.title} onChange={(e) => {
                const newLessons = [...lessons];
                newLessons[index].title = e.target.value;
                setLessons(newLessons);
              }} type="text" placeholder="输入标题" style={{ width: "100%", padding: "0.6rem", border: "1px solid #eee", borderRadius: "6px", fontSize: "0.9rem" }} required />

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ position: "relative", overflow: "hidden", cursor: "pointer" }}>
                  <button type="button" style={{ padding: "0.4rem 0.8rem", border: "1px solid #ddd", background: "#f8f9fa", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer" }}>选择文件</button>
                  <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, index)} style={{ position: "absolute", top: 0, left: 0, opacity: 0, width: "100%", height: "100%", cursor: "pointer" }} />
                </div>
                {lesson.videoUrl && (
                  <div style={{ color: "var(--success)", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", fontWeight: "600" }}>
                    <CheckCircle2 size={16} /> 已就绪
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <button type="button" onClick={() => {
                    const newLessons = [...lessons];
                    newLessons[index].isPreview = !newLessons[index].isPreview;
                    setLessons(newLessons);
                  }}
                  style={{ background: lesson.isPreview ? "var(--success-light)" : "transparent", color: lesson.isPreview ? "var(--success)" : "#adb5bd", border: "1px solid", borderColor: lesson.isPreview ? "var(--success)" : "#ddd", borderRadius: "20px", padding: "0.2rem 0.6rem", fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", fontWeight: "600" }}
                >
                  {lesson.isPreview ? <><Eye size={14} /> 试看</> : <><EyeOff size={14} /> 锁定</>}
                </button>
              </div>

              <button type="button" onClick={() => removeLesson(index)} style={{ background: "none", border: "none", color: "#adb5bd", cursor: "pointer" }}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginBottom: "4rem", paddingTop: "1rem", borderTop: "1px solid #eee" }}>
        <button type="button" onClick={() => router.back()} style={{ padding: "0.8rem 2.5rem", borderRadius: "8px", border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontWeight: "600" }}>取消返回</button>
        <button type="submit" disabled={uploading || isSubmitting} className="btn-primary" style={{ padding: "0.8rem 5rem", borderRadius: "8px", display: "flex", alignItems: "center", gap: "0.6rem", opacity: (uploading || isSubmitting) ? 0.7 : 1, fontSize: "1.1rem" }}>
          <Save size={22} /> {(uploading || isSubmitting) ? "正在处理..." : "保存并发布课程"}
        </button>
      </div>
    </form>
  );
};

export default CourseForm;
