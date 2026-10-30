"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Save, X, Plus } from "lucide-react";
import { createCourse } from "@/lib/actions/course";

const NewCoursePage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [lessons, setLessons] = useState<{ title: string; videoUrl: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
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
        if (index !== undefined) {
          const newLessons = [...lessons];
          newLessons[index].videoUrl = data.url;
          setLessons(newLessons);
        }
      }
    } catch (err) {
      alert("上传失败");
    } finally {
      setUploading(false);
    }
  };

  const addLesson = () => {
    setLessons([...lessons, { title: "", videoUrl: "" }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (lessons.length === 0) {
      alert("请至少添加一个章节");
      return;
    }

    if (lessons.some(l => !l.videoUrl || !l.title)) {
      alert("请填写所有章节的标题并上传视频文件");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createCourse({
        title,
        description,
        price: parseFloat(price),
        lessons
      });

      if (result.success) {
        alert("课程发布成功！");
        router.push("/admin/courses");
        router.refresh();
      } else {
        alert(result.error || "发布失败");
      }
    } catch (err) {
      alert("请求异常，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px" }}>
      <header style={{ marginBottom: "2rem" }}>
        <h3 style={{ margin: 0 }}>创建新课程</h3>
      </header>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Basic Info */}
        <section style={{ background: "#fff", padding: "2rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
          <h4 style={{ marginTop: 0, marginBottom: "1.5rem" }}>基本信息</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>课程标题 <span style={{ color: "var(--primary)" }}>*</span></label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" placeholder="例如：高级商务汉语" style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd" }} required />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>课程描述 <span style={{ color: "var(--primary)" }}>*</span></label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="介绍课程的核心内容..." style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd", fontFamily: "inherit" }} required />
            </div>
            <div style={{ width: "200px" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "#495057" }}>价格 (元) <span style={{ color: "var(--primary)" }}>*</span></label>
              <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" step="0.01" placeholder="0.00" style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd" }} required />
            </div>
          </div>
        </section>

        {/* Lessons & Video Upload */}
        <section style={{ background: "#fff", padding: "2rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h4 style={{ margin: 0 }}>课程大纲与视频</h4>
            <button type="button" onClick={addLesson} style={{ background: "none", border: "1px dashed var(--primary)", color: "var(--primary)", padding: "0.4rem 1rem", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}>
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
            {lessons.length === 0 && <div style={{ textAlign: "center", padding: "2rem", color: "#adb5bd", border: "1px dashed #ddd", borderRadius: "8px" }}>暂无章节，请点击上方按钮添加</div>}
          </div>
        </section>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginBottom: "4rem" }}>
          <button type="button" onClick={() => router.back()} style={{ padding: "0.75rem 2rem", borderRadius: "8px", border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>取消</button>
          <button type="submit" disabled={uploading || isSubmitting} className="btn-primary" style={{ padding: "0.75rem 3rem", borderRadius: "8px", display: "flex", alignItems: "center", gap: "0.5rem", opacity: (uploading || isSubmitting) ? 0.7 : 1 }}>
            <Save size={20} /> {(uploading || isSubmitting) ? "正在处理..." : "发布课程"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewCoursePage;
