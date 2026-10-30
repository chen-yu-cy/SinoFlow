// FILE: src/lib/actions/note.ts
"use server";

import { auth } from "@/lib/auth";
import { NoteService } from "@/lib/services/note.service";
import { logger } from "@/lib/logger";

/**
 * 获取指定课时下当前登录用户的所有笔记
 */
export async function getNotesAction(lessonId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "请先登录" };
  }

  try {
    const notes = await NoteService.getNotesByLesson(session.user.id, lessonId);
    return { success: true, notes };
  } catch (error: any) {
    logger.error({ err: error, lessonId, userId: session.user.id }, "获取课时笔记失败");
    return { error: "获取笔记失败，请稍后重试" };
  }
}

/**
 * 记录课时视频时间戳笔记
 */
export async function createNoteAction(lessonId: string, content: string, timestamp: number) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "请先登录" };
  }

  const trimmed = content.trim();
  if (!trimmed) {
    return { error: "笔记内容不能为空" };
  }

  try {
    const note = await NoteService.createNote(
      session.user.id,
      lessonId,
      trimmed,
      Math.floor(timestamp)
    );
    return { success: true, note };
  } catch (error: any) {
    logger.error({ err: error, lessonId, userId: session.user.id }, "创建笔记失败");
    return { error: "记录笔记失败，请稍后重试" };
  }
}

/**
 * 删除笔记
 */
export async function deleteNoteAction(noteId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "请先登录" };
  }

  try {
    await NoteService.deleteNote(session.user.id, noteId);
    return { success: true };
  } catch (error: any) {
    logger.error({ err: error, noteId, userId: session.user.id }, "删除笔记失败");
    return { error: error.message || "删除笔记失败，请稍后重试" };
  }
}
