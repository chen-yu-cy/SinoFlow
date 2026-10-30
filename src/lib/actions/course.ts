"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { CourseService, type CreateCourseInput, type UpdateCourseInput } from "@/lib/services/course.service";

/**
 * 课程相关 Server Actions
 * 定位：作为 Web 前端的接口层，负责处理 HTTP 相关的副作用、权限验证和缓存刷新。
 */

/**
 * 创建课程 Action
 * 被 Admin UI 的“发布课程”按钮调用
 */
export async function createCourse(data: CreateCourseInput) {
  const session = await auth();

  // 1. 权限守卫：仅允许管理员操作
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { error: "未经授权的操作" };
  }

  try {
    // 2. 委托给 Service 层处理底层逻辑
    const course = await CourseService.createCourse(data);

    // 3. 触发 Next.js 数据缓存失效，确保首页能立即看到新课程
    revalidatePath("/");
    revalidatePath("/courses");

    return { success: true, courseId: course.id };
  } catch (error: any) {
    console.error("Action Error (createCourse):", error);
    // 向前端透传 Service 层的具体错误信息
    return { error: error.message || "保存课程失败" };
  }
}

/**
 * 更新课程 Action
 */
export async function updateCourse(id: string, data: UpdateCourseInput) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { error: "未经授权的操作" };
  }

  try {
    await CourseService.updateCourse(id, data);

    // 刷新全站受影响的页面
    revalidatePath("/");
    revalidatePath("/courses");
    revalidatePath(`/courses/${id}`);

    return { success: true };
  } catch (error: any) {
    console.error("Action Error (updateCourse):", error);
    return { error: error.message || "更新失败" };
  }
}

/**
 * 删除课程 Action
 */
export async function deleteCourse(id: string) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { error: "未经授权的操作" };
  }

  try {
    await CourseService.deleteCourse(id);

    revalidatePath("/");
    revalidatePath("/courses");
    revalidatePath("/admin/courses");

    return { success: true };
  } catch (error: any) {
    console.error("Action Error (deleteCourse):", error);
    return { error: error.message || "删除失败" };
  }
}
