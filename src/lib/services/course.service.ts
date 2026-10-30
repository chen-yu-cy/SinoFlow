import prisma from "@/lib/db/client";

/**
 * 课程创建输入接口
 */
export interface CreateCourseInput {
  title: string;
  description: string;
  price: number;
  level: string;
  duration: string;
  isFree?: boolean;
  thumbnail?: string | null;
  lessons: { title: string; videoUrl: string; isPreview: boolean; duration?: number | null }[];
  resources?: { title: string; fileUrl: string; fileSize?: string | null }[];
}

/**
 * 课程更新输入接口 (目前与创建接口相同)
 */
export interface UpdateCourseInput extends CreateCourseInput {}

/**
 * 课程服务层 (Course Service)
 * 对应架构中的核心大脑，负责处理所有与课程、章节相关的底层数据库操作及业务逻辑。
 */
export const CourseService = {
  /**
   * 创建一个全新的课程及其关联的章节与学习资料
   * @param data 包含课程基本信息、章节列表和资料的结构化数据
   * @throws 当必填项缺失时抛出 Error
   * @returns 返回新创建的课程数据库实体
   */
  async createCourse(data: CreateCourseInput) {
    // 业务规则校验
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
        isFree: data.isFree ?? false,
        thumbnail: data.thumbnail,
        lessons: {
          create: data.lessons.map((lesson, index) => ({
            title: lesson.title,
            videoUrl: lesson.videoUrl,
            order: index + 1,
            status: "READY",
            isPreview: lesson.isPreview,
            duration: lesson.duration,
          })),
        },
        resources: data.resources ? {
          create: data.resources.map((res) => ({
            title: res.title,
            fileUrl: res.fileUrl,
            fileSize: res.fileSize,
          })),
        } : undefined,
      },
    });
  },

  /**
   * 更新现有课程及其关联章节和学习资料
   * @param id 课程的唯一 ID (CUID)
   * @param data 更新后的课程数据
   * @returns 包含成功状态的事务执行结果
   */
  async updateCourse(id: string, data: UpdateCourseInput) {
    return await prisma.$transaction(async (tx) => {
      // 1. 更新课程主体元数据
      await tx.course.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          price: data.price,
          level: data.level,
          duration: data.duration,
          isFree: data.isFree ?? false,
          thumbnail: data.thumbnail,
        },
      });

      // 2. 清理旧章节并注入新章节，确保顺序与 UI 一致
      await tx.lesson.deleteMany({ where: { courseId: id } });
      // 3. 清理旧资料并注入新资料
      await tx.resource.deleteMany({ where: { courseId: id } });

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
              duration: lesson.duration,
            })),
          },
          resources: data.resources ? {
            create: data.resources.map((res) => ({
              title: res.title,
              fileUrl: res.fileUrl,
              fileSize: res.fileSize,
            })),
          } : undefined,
        },
      });
    });
  },

  /**
   * 级联删除一个课程
   * 警告：此操作将永久移除课程主体、所有关联章节、关联资料及学员的购买记录（Order）。
   * @param id 课程的唯一 ID
   */
  async deleteCourse(id: string) {
    return await prisma.$transaction(async (tx) => {
      // 必须手动处理关联删除以确保事务完整性
      await tx.lesson.deleteMany({ where: { courseId: id } });
      await tx.resource.deleteMany({ where: { courseId: id } });
      await tx.order.deleteMany({ where: { courseId: id } });
      return await tx.course.delete({ where: { id } });
    });
  },
};
