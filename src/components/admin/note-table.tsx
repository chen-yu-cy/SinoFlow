// FILE: src/components/admin/note-table.tsx
"use client";

import React, { useState } from "react";
import { Search, Trash2, Clock, BookOpen, AlertCircle, CheckCircle, X } from "lucide-react";
import { deleteNoteAsAdminAction } from "@/lib/actions/note";

export interface AdminNoteItem {
  id: string;
  content: string;
  timestamp: number;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  lesson: {
    id: string;
    title: string;
    course: {
      id: string;
      title: string;
    };
  };
}

interface NoteTableProps {
  initialNotes: AdminNoteItem[];
}

export const NoteTable = ({ initialNotes }: NoteTableProps) => {
  const [notes, setNotes] = useState<AdminNoteItem[]>(initialNotes);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<AdminNoteItem | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const filteredNotes = notes.filter((note) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const contentMatch = note.content.toLowerCase().includes(q);
    const userMatch =
      (note.user.name && note.user.name.toLowerCase().includes(q)) ||
      (note.user.email && note.user.email.toLowerCase().includes(q));
    const lessonMatch = note.lesson.title.toLowerCase().includes(q);
    const courseMatch = note.lesson.course.title.toLowerCase().includes(q);
    return contentMatch || userMatch || lessonMatch || courseMatch;
  });

  const handleDelete = async (note: AdminNoteItem) => {
    setDeletingId(note.id);
    try {
      const res = await deleteNoteAsAdminAction(note.id);
      if (res.error) {
        showToast(res.error, "error");
      } else {
        setNotes((prev) => prev.filter((item) => item.id !== note.id));
        showToast("已成功删除违规笔记/弹幕", "success");
      }
    } catch {
      showToast("操作失败，请重试", "error");
    } finally {
      setDeletingId(null);
      setConfirmTarget(null);
    }
  };

  return (
    <div>
      {/* Toast 提示框 */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            padding: "1rem 1.5rem",
            borderRadius: "8px",
            background: toast.type === "success" ? "#2b8a3e" : "#c92a2a",
            color: "#fff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            animation: "fadeIn 0.2s ease-in-out",
          }}
        >
          {toast.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 二次确认删除弹窗 */}
      {confirmTarget && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9998,
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "2rem",
              maxWidth: "480px",
              width: "90%",
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            }}
          >
            <h4 style={{ margin: "0 0 1rem 0", color: "#c92a2a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <AlertCircle size={22} />
              确认强制删除此笔记？
            </h4>
            <p style={{ color: "#495057", fontSize: "0.95rem", lineHeight: "1.6", margin: "0 0 1rem 0" }}>
              该笔记将从系统和视频弹幕中永久移除。
            </p>
            <div
              style={{
                background: "#f8f9fa",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                borderLeft: "4px solid #fcc419",
                marginBottom: "1.5rem",
                fontSize: "0.9rem",
                color: "#212529",
              }}
            >
              “{confirmTarget.content}”
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button
                onClick={() => setConfirmTarget(null)}
                disabled={deletingId === confirmTarget.id}
                style={{
                  padding: "0.6rem 1.25rem",
                  borderRadius: "6px",
                  border: "1px solid #ced4da",
                  background: "#fff",
                  color: "#495057",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(confirmTarget)}
                disabled={deletingId === confirmTarget.id}
                style={{
                  padding: "0.6rem 1.25rem",
                  borderRadius: "6px",
                  border: "none",
                  background: "#e03131",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                {deletingId === confirmTarget.id ? "删除中..." : "确认删除"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 搜索栏与概览计数 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: "280px", maxWidth: "480px" }}>
          <Search
            size={18}
            color="#adb5bd"
            style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            placeholder="搜索笔记内容、学员姓名、邮箱或课程课时..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem 1rem 0.75rem 2.75rem",
              borderRadius: "8px",
              border: "1px solid #dee2e6",
              background: "#fff",
              fontSize: "0.9rem",
              outline: "none",
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                position: "absolute",
                right: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#adb5bd",
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div style={{ color: "#6c757d", fontSize: "0.9rem" }}>
          共找到 <strong style={{ color: "#212529" }}>{filteredNotes.length}</strong> 条弹幕笔记
        </div>
      </div>

      {/* 笔记表格 */}
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          overflow: "hidden",
          border: "1px solid #dee2e6",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8f9fa", borderBottom: "1px solid #dee2e6" }}>
                <th style={{ padding: "1rem 1.25rem", color: "#495057", fontWeight: "600", width: "35%" }}>
                  弹幕 / 笔记内容
                </th>
                <th style={{ padding: "1rem 1.25rem", color: "#495057", fontWeight: "600", width: "25%" }}>
                  所属课程与课时
                </th>
                <th style={{ padding: "1rem 1.25rem", color: "#495057", fontWeight: "600", width: "10%" }}>
                  视频时间
                </th>
                <th style={{ padding: "1rem 1.25rem", color: "#495057", fontWeight: "600", width: "15%" }}>
                  学员
                </th>
                <th style={{ padding: "1rem 1.25rem", color: "#495057", fontWeight: "600", width: "10%" }}>
                  发布时间
                </th>
                <th style={{ padding: "1rem 1.25rem", color: "#495057", fontWeight: "600", textAlign: "center", width: "5%" }}>
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredNotes.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "3.5rem 1rem", color: "#868e96" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                      <AlertCircle size={32} color="#adb5bd" />
                      <span>未找到符合条件的弹幕笔记</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredNotes.map((note) => (
                  <tr
                    key={note.id}
                    style={{
                      borderBottom: "1px solid #f1f3f5",
                      transition: "background 0.15s ease",
                    }}
                  >
                    <td style={{ padding: "1rem 1.25rem" }}>
                      <div
                        style={{
                          fontWeight: "500",
                          color: "#212529",
                          fontSize: "0.95rem",
                          lineHeight: "1.5",
                          wordBreak: "break-word",
                        }}
                      >
                        {note.content}
                      </div>
                    </td>
                    <td style={{ padding: "1rem 1.25rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                        <span
                          style={{
                            fontSize: "0.85rem",
                            color: "var(--primary, #e03131)",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3rem",
                          }}
                        >
                          <BookOpen size={14} />
                          {note.lesson.course.title}
                        </span>
                        <span style={{ fontSize: "0.82rem", color: "#6c757d" }}>{note.lesson.title}</span>
                      </div>
                    </td>
                    <td style={{ padding: "1rem 1.25rem" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          fontFamily: "monospace",
                          fontSize: "0.82rem",
                          background: "#fff3bf",
                          color: "#d9480f",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "6px",
                          fontWeight: "700",
                        }}
                      >
                        <Clock size={12} />
                        {formatTime(note.timestamp)}
                      </span>
                    </td>
                    <td style={{ padding: "1rem 1.25rem" }}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "#343a40" }}>
                          {note.user.name || "未命论学员"}
                        </span>
                        <span style={{ fontSize: "0.8rem", color: "#868e96" }}>{note.user.email}</span>
                      </div>
                    </td>
                    <td style={{ padding: "1rem 1.25rem", color: "#868e96", fontSize: "0.85rem" }}>
                      {new Date(note.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "1rem 1.25rem", textAlign: "center" }}>
                      <button
                        onClick={() => setConfirmTarget(note)}
                        disabled={deletingId === note.id}
                        title="删除笔记"
                        style={{
                          padding: "0.45rem",
                          borderRadius: "6px",
                          border: "1px solid #ffc9c9",
                          background: "#fff5f5",
                          color: "#e03131",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s",
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
