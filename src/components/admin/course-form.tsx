"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Plus } from "lucide-react";
import { createCourse, updateCourse } from "@/lib/actions/course";

interface CourseFormProps {
  initialData?: {
    id: string;
    title: string;
    description: string;
    price: number;
    level: string;
    duration: string;
    lessons: { title: string; videoUrl: string }[];
  };
}

const CourseForm = ({ initialData }: CourseFormProps) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [price, setPrice] = useState(initialData?.price.toString() || "");
  const [level, setLevel] = useState(initialData?.level || "基础级");
  const [duration, setDuration] = useState(initialData?.duration || "20 课时");
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
      }
    } catch (err) {
      alert("上传失败");
    } finally {
      setUploading(false);
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
      const payload = {
        title,
        description,
        price: parseFloat(price),
        level,
        duration,
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
      <section style={{ background: "#fff", padding: "2rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
        <h4 style={{ marginTop: 0, marginBottom: "1.5rem" }}>基本信息</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>课程标题 <span style={{ color: "var(--primary)" }}>*</span></label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd" }} required />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>课程描述 <span style={{ color: "var(--primary)" }}>*</span></label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd", fontFamily: "inherit" }} required />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "#495057" }}>价格 (元) <span style={{ color: "var(--primary)" }}>*</span></label>
              <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" step="0.01" style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd" }} required />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "#495057" }}>难易度 <span style={{ color: "var(--primary)" }}>*</span></label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {[
                  { id: "入门级", color: "var(--success)", bg: "var(--success-light)" },
                  { id: "进阶级", color: "var(--warning)", bg: "var(--warning-light)" },
                  { id: "高级", color: "var(--primary)", bg: "var(--primary-light)" }
                ].map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => setLevel(item.id)}
                    style={{ 
                      flex: 1,
                      textAlign: "center",
                      padding: "0.6rem",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      border: level === item.id ? `2px solid ${item.color}` : "1px solid #ddd",
                      background: level === item.id ? item.bg : "#fff",
                      color: level === item.id ? item.color : "#6c757d",
                      transition: "all 0.2s"
                    }}
                  >
                    {item.id}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "#495057" }}>课时/时长 <span style={{ color: "var(--primary)" }}>*</span></label>
              <input value={duration} onChange={(e) => setDuration(e.target.value)} type="text" placeholder="例如：20 课时" style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd" }} required />
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: "#fff", padding: "2rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h4 style={{ margin: 0 }}>课程大纲与视频</h4>
          <button type="button" onClick={() => setLessons([...lessons, { title: "", videoUrl: "" }])} style={{ background: "none", border: "1px dashed var(--primary)", color: "var(--primary)", padding: "0.4rem 1rem", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Plus size={16} /> 添加章节
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {lessons.map((lesson, index) => (
            <div key={index} style={{ padding: "1.5rem", border: "1px solid #f1f3f5", borderRadius: "8px", background: "#f8f9fa" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.8rem", color: "#6c757d" }}>章节 {index + 1} 标题 <span style={{ color: "var(--primary)" }}>*</span></label>
                  <input value={lesson.title} onChange={(e) => {
                    const newLessons = [...lessons];
                    newLessons[index].title = e.target.value;
                    setLessons(newLessons);
                  }} type="text" style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #ddd" }} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.8rem", color: "#6c757d" }}>视频文件 <span style={{ color: "var(--primary)" }}>*</span></label>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, index)} style={{ fontSize: "0.8rem" }} />
                    {lesson.videoUrl && <span style={{ color: "#28a745", fontSize: "0.8rem", fontWeight: "bold" }}>✅ 已就绪</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginBottom: "4rem" }}>
        <button type="button" onClick={() => router.back()} style={{ padding: "0.75rem 2rem", borderRadius: "8px", border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>取消</button>
        <button type="submit" disabled={uploading || isSubmitting} className="btn-primary" style={{ padding: "0.75rem 3rem", borderRadius: "8px", display: "flex", alignItems: "center", gap: "0.5rem", opacity: (uploading || isSubmitting) ? 0.7 : 1 }}>
          <Save size={20} /> {(uploading || isSubmitting) ? "处理中..." : "保存课程"}
        </button>
      </div>
    </form>
  );
};

export default CourseForm;
