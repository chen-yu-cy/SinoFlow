// FILE: src/app/admin/notes/page.tsx
import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NoteService } from "@/lib/services/note.service";
import { NoteTable, type AdminNoteItem } from "@/components/admin/note-table";

export const dynamic = "force-dynamic";

const AdminNotesPage = async () => {
  const session = await auth();
  const userRole = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user || userRole !== "ADMIN") {
    redirect("/login");
  }

  const rawNotes = await NoteService.getAllNotesForAdmin();

  const serializedNotes: AdminNoteItem[] = rawNotes.map((note) => ({
    id: note.id,
    content: note.content,
    timestamp: note.timestamp,
    createdAt: note.createdAt.toISOString(),
    user: {
      id: note.user.id,
      name: note.user.name,
      email: note.user.email,
    },
    lesson: {
      id: note.lesson.id,
      title: note.lesson.title,
      course: {
        id: note.lesson.course.id,
        title: note.lesson.course.title,
      },
    },
  }));

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.5rem", fontWeight: "700", margin: "0 0 0.5rem 0" }}>随堂弹幕与笔记管理</h3>
        <p style={{ color: "#6c757d", fontSize: "0.9rem", margin: 0 }}>
          实时查看与审核全平台学员在各课时视频中提交的弹幕笔记。发现不当或违规言论可一键强制删除下架。
        </p>
      </div>

      <NoteTable initialNotes={serializedNotes} />
    </div>
  );
};

export default AdminNotesPage;
