// FILE: src/lib/services/note.service.ts
import prisma from "@/lib/db/client";

/**
 * 课时学习笔记服务层 (Note Service)
 * 职责：提供对学员在每个课时中记录的时间戳笔记进行增删改查。
 */
export const NoteService = {
  /**
   * 创建一条时间戳笔记
   * @param userId 用户 ID
   * @param lessonId 课时 ID
   * @param content 笔记内容
   * @param timestamp 视频播放时间戳（秒数）
   */
  async createNote(userId: string, lessonId: string, content: string, timestamp: number) {
    return await prisma.note.create({
      data: {
        userId,
        lessonId,
        content,
        timestamp,
      },
    });
  },

  /**
   * 删除一条时间戳笔记
   * @param userId 用户 ID（做安全越权校验）
   * @param noteId 笔记 ID
   */
  async deleteNote(userId: string, noteId: string) {
    // 确保只有笔记所有者可以删除
    const note = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      throw new Error("笔记不存在");
    }

    if (note.userId !== userId) {
      throw new Error("无权删除该笔记");
    }

    return await prisma.note.delete({
      where: { id: noteId },
    });
  },

  /**
   * 获取学员在指定课时的所有笔记，按时间戳升序排序
   * @param userId 用户 ID
   * @param lessonId 课时 ID
   */
  async getNotesByLesson(userId: string, lessonId: string) {
    return await prisma.note.findMany({
      where: {
        userId,
        lessonId,
      },
      orderBy: {
        timestamp: "asc",
      },
    });
  },
};
