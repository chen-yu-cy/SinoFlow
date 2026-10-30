import prisma from "@/lib/db/client";

export interface CreateCourseInput {
  title: string;
  description: string;
  price: number;
  level: string;
  duration: string;
  thumbnail?: string | null;
  lessons: { title: string; videoUrl: string; isPreview: boolean }[];
}

export interface UpdateCourseInput extends CreateCourseInput {}

/**
 * 课程服务层 (Course Service)
 * 负责课程及章节的核心业务逻辑与数据访问
 */
export const CourseService = {
  /**
   * 创建课程及其关联章节
   */
  async createCourse(data: CreateCourseInput) {
    if (!data.title || !data.description || data.lessons.length === 0) {
      throw new Error("请填写完整的课程信息并至少添加一个章节");
    }

    return await prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        level: data.level,
        duration: data.duration,
        thumbnail: data.thumbnail,
        lessons: {
          create: data.lessons.map((lesson, index) => ({
            title: lesson.title,
            videoUrl: lesson.videoUrl,
            order: index + 1,
            status: "READY",
            isPreview: lesson.isPreview,
          })),
        },
      },
    });
  },

  /**
   * 更新课程及其关联章节
   * 采用删除并重建章节的简单同步方案
   */
  async updateCourse(id: string, data: UpdateCourseInput) {
    return await prisma.$transaction(async (tx) => {
      // 1. 更新主体
      await tx.course.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          price: data.price,
          level: data.level,
          duration: data.duration,
          thumbnail: data.thumbnail,
        },
      });

      // 2. 同步章节
      await tx.lesson.deleteMany({ where: { courseId: id } });

      return await tx.course.update({
        where: { id },
        data: {
          lessons: {
            create: data.lessons.map((lesson, index) => ({
              title: lesson.title,
              videoUrl: lesson.videoUrl,
              order: index + 1,
              status: "READY",
              isPreview: lesson.isPreview,
            })),
          },
        },
      });
    });
  },

  /**
   * 级联删除课程
   */
  async deleteCourse(id: string) {
    return await prisma.$transaction(async (tx) => {
      await tx.lesson.deleteMany({ where: { courseId: id } });
      await tx.order.deleteMany({ where: { courseId: id } });
      return await tx.course.delete({ where: { id } });
    });
  }
};
