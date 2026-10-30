"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { CourseService, type CreateCourseInput, type UpdateCourseInput } from "@/lib/services/course.service";

/**
 * Server Actions for Courses
 * 职责：权限校验、调用 Service、Web 侧边效果（如缓存刷新）
 */

export async function createCourse(data: CreateCourseInput) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { error: "未经授权的操作" };
  }

  try {
    const course = await CourseService.createCourse(data);

    revalidatePath("/");
    revalidatePath("/courses");

    return { success: true, courseId: course.id };
  } catch (error: any) {
    console.error("Action Error (createCourse):", error);
    return { error: error.message || "保存课程失败" };
  }
}

export async function updateCourse(id: string, data: UpdateCourseInput) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { error: "未经授权的操作" };
  }

  try {
    await CourseService.updateCourse(id, data);

    revalidatePath("/");
    revalidatePath("/courses");
    revalidatePath(`/courses/${id}`);

    return { success: true };
  } catch (error: any) {
    console.error("Action Error (updateCourse):", error);
    return { error: error.message || "更新失败" };
  }
}

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
