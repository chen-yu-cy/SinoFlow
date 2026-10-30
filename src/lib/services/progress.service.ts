// FILE: src/lib/services/progress.service.ts
import prisma from "@/lib/db/client";

/**
 * 学习进度服务层 (Progress Service)
 * 职责：提供对学员学习章节进度的读取、标记和百分比计算服务。
 */
export const ProgressService = {
  /**
   * 获取学员在一门课程中的所有已学完的课时 ID 列表
   * @param userId 学员 ID
   * @param courseId 课程 ID
   */
  async getCompletedLessonIds(userId: string, courseId: string): Promise<string[]> {
    const progresses = await prisma.lessonProgress.findMany({
      where: {
        userId,
        lesson: { courseId },
        completed: true,
      },
      select: { lessonId: true },
    });
    return progresses.map((p) => p.lessonId);
  },

  /**
   * 切换/打卡某个课时的学习完成状态
   * @param userId 学员 ID
   * @param lessonId 课时 ID
   * @param completed 完成状态
   */
  async toggleLessonProgress(userId: string, lessonId: string, completed: boolean) {
    return await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      update: { completed },
      create: { userId, lessonId, completed },
    });
  },

  /**
   * 批量查询学员在指定课程列表中的进度百分比详情
   * @param userId 学员 ID
   * @param courseIds 课程 ID 列表
   * @returns 以 courseId 为 key 的映射对象
   */
  async getCoursesProgress(
    userId: string,
    courseIds: string[]
  ): Promise<Record<string, { completedCount: number; totalCount: number }>> {
    const progressStats = await Promise.all(
      courseIds.map(async (courseId) => {
        const totalCount = await prisma.lesson.count({
          where: { courseId },
        });

        const completedCount = await prisma.lessonProgress.count({
          where: {
            userId,
            lesson: { courseId },
            completed: true,
          },
        });

        return {
          courseId,
          completedCount,
          totalCount,
        };
      })
    );

    return progressStats.reduce((acc, stat) => {
      acc[stat.courseId] = {
        completedCount: stat.completedCount,
        totalCount: stat.totalCount,
      };
      return acc;
    }, {} as Record<string, { completedCount: number; totalCount: number }>);
  }
};
