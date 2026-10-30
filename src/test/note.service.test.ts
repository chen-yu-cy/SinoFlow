// FILE: src/test/note.service.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NoteService } from "@/lib/services/note.service";
import prisma from "@/lib/db/client";

describe("NoteService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createNote", () => {
    it("应该成功调用 prisma.note.create", async () => {
      const mockNote = { id: "n1", userId: "u1", lessonId: "l1", content: "Note", timestamp: 30 };
      (prisma.note.create as any).mockResolvedValue(mockNote);

      const result = await NoteService.createNote("u1", "l1", "Note", 30);
      expect(result).toEqual(mockNote);
      expect(prisma.note.create).toHaveBeenCalledWith({
        data: {
          userId: "u1",
          lessonId: "l1",
          content: "Note",
          timestamp: 30,
        },
      });
    });
  });

  describe("deleteNote", () => {
    it("应该只允许笔记所有者删除笔记", async () => {
      const mockNote = { id: "n1", userId: "u1", lessonId: "l1", content: "Note", timestamp: 30 };
      (prisma.note.findUnique as any).mockResolvedValue(mockNote);
      (prisma.note.delete as any).mockResolvedValue(mockNote);

      const result = await NoteService.deleteNote("u1", "n1");
      expect(result).toEqual(mockNote);
      expect(prisma.note.delete).toHaveBeenCalledWith({ where: { id: "n1" } });
    });

    it("若非笔记所有者尝试删除笔记，应抛出错误", async () => {
      const mockNote = { id: "n1", userId: "u1", lessonId: "l1", content: "Note", timestamp: 30 };
      (prisma.note.findUnique as any).mockResolvedValue(mockNote);

      await expect(NoteService.deleteNote("u2", "n1")).rejects.toThrow("无权删除该笔记");
      expect(prisma.note.delete).not.toHaveBeenCalled();
    });

    it("若笔记不存在，应抛出错误", async () => {
      (prisma.note.findUnique as any).mockResolvedValue(null);

      await expect(NoteService.deleteNote("u1", "n2")).rejects.toThrow("笔记不存在");
      expect(prisma.note.delete).not.toHaveBeenCalled();
    });
  });

  describe("getNotesByLesson", () => {
    it("应该查询并按时间戳升序返回该课时的所有笔记", async () => {
      const mockNotes = [
        { id: "n1", userId: "u1", lessonId: "l1", content: "Note 1", timestamp: 10 },
        { id: "n2", userId: "u1", lessonId: "l1", content: "Note 2", timestamp: 20 },
      ];
      (prisma.note.findMany as any).mockResolvedValue(mockNotes);

      const result = await NoteService.getNotesByLesson("u1", "l1");
      expect(result).toEqual(mockNotes);
      expect(prisma.note.findMany).toHaveBeenCalledWith({
        where: {
          userId: "u1",
          lessonId: "l1",
        },
        orderBy: {
          timestamp: "asc",
        },
      });
    });
  });
});
