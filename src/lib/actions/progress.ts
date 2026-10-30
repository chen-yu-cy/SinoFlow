// FILE: src/lib/actions/progress.ts
"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db/client";
import { ProgressService } from "@/lib/services/progress.service";
import { OrderStatus } from "@prisma/client";
import { logger } from "@/lib/logger";

/**
 * 课时打卡 Server Action (切换完成状态)
 * @param lessonId 课时 ID
 * @param completed 是否学完
 */
export async function toggleLessonProgressAction(lessonId: string, completed: boolean) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "请先登录" };
  }

  try {
    // 1. 获取课时关联的课程及其预览状态
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return { error: "课时不存在" };
    }

    // 2. 权限校验：管理员，或已购买课程的学员，或该课时是免费试看课时
    const isAdmin = (session.user as any).role === "ADMIN";
    let hasAccess = isAdmin || lesson.isPreview;

    if (!hasAccess) {
      const order = await prisma.order.findFirst({
        where: {
          userId: session.user.id,
          courseId: lesson.courseId,
          status: OrderStatus.SUCCESS,
        },
      });
      hasAccess = !!order;
    }

    if (!hasAccess) {
      return { error: "您没有该课程的访问权限，无法打卡" };
    }

    // 3. 调用服务层执行 Upsert 打卡
    await ProgressService.toggleLessonProgress(session.user.id, lessonId, completed);
    logger.info(
      { userId: session.user.id, lessonId, completed },
      "[Progress Action] 学员切换了课时打卡状态"
    );
    return { success: true };
  } catch (error: any) {
    logger.error({ err: error, lessonId, userId: session?.user?.id }, "课时打卡动作发生异常");
    return { error: "打卡失败，请稍后重试" };
  }
}
