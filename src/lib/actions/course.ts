"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db/client";
import { LessonStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createCourse(data: {
  title: string;
  description: string;
  price: number;
  lessons: { title: string; videoUrl: string }[];
}) {
  const session = await auth();

  // 严格权限校验
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { error: "未经授权的操作" };
  }

  if (!data.title || !data.description || data.lessons.length === 0) {
    return { error: "请填写完整的课程信息并至少添加一个章节" };
  }

  try {
    const course = await prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        lessons: {
          create: data.lessons.map((lesson, index) => ({
            title: lesson.title,
            videoUrl: lesson.videoUrl,
            order: index + 1,
            status: LessonStatus.READY, // 目前默认为 READY，未来可改为 PROCESSING
          })),
        },
      },
    });

    // 清除首页和课程列表页的缓存，确保新课程立即显示
    revalidatePath("/");
    revalidatePath("/courses");

    return { success: true, courseId: course.id };
  } catch (error) {
    console.error("创建课程失败:", error);
    return { error: "保存课程失败，请检查数据格式" };
  }
}
