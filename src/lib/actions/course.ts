"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db/client";
import { revalidatePath } from "next/cache";

export async function createCourse(data: {
  title: string;
  description: string;
  price: number;
  level: string;
  duration: string;
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
        level: data.level,
        duration: data.duration,
        lessons: {
          create: data.lessons.map((lesson, index) => ({
            title: lesson.title,
            videoUrl: lesson.videoUrl,
            order: index + 1,
            status: "READY",
          })),
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/courses");

    return { success: true, courseId: course.id };
  } catch (error) {
    console.error("创建课程失败:", error);
    return { error: "保存课程失败，请检查数据格式" };
  }
}

export async function updateCourse(id: string, data: {
  title: string;
  description: string;
  price: number;
  level: string;
  duration: string;
  lessons: { id?: string; title: string; videoUrl: string }[];
}) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { error: "未经授权的操作" };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. 更新课程基本信息
      await tx.course.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          price: data.price,
          level: data.level,
          duration: data.duration,
        },
      });

      // 2. 章节同步
      await tx.lesson.deleteMany({ where: { courseId: id } });

      await tx.course.update({
        where: { id },
        data: {
          lessons: {
            create: data.lessons.map((lesson, index) => ({
              title: lesson.title,
              videoUrl: lesson.videoUrl,
              order: index + 1,
              status: "READY",
            })),
          },
        },
      });

      return { success: true };
    });

    revalidatePath("/");
    revalidatePath("/courses");
    revalidatePath(`/courses/${id}`);

    return result;
  } catch (error) {
    console.error("更新课程失败:", error);
    return { error: "更新失败，请检查数据" };
  }
}
