import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/db/client";
import { auth } from "@/lib/auth";
import PurchaseButton from "@/components/course/purchase-button";
import { OrderStatus } from "@prisma/client";
import LessonContent from "@/components/course/lesson-content";
import { getTranslation } from "@/lib/i18n";

interface CourseDetailPageProps {
  params: Promise<{ id: string }>;
}

const CourseDetailPage = async ({ params }: CourseDetailPageProps) => {
  const { id } = await params;
  const session = await auth();
  const { t } = await getTranslation();

  const labels = {
    learningTitle: t("courseDetail.learningTitle") || "正在学习",
    introTitle: t("courseDetail.introTitle") || "课程简介",
    curriculumTitle: t("courseDetail.curriculumTitle") || "课程目录",
    progressTitle: t("courseDetail.progressTitle") || "学习进度",
    resourcesTitle: t("courseDetail.resourcesTitle") || "配套学习资料",
    noResources: t("courseDetail.noResources") || "暂无配套学习资料",
    unlockResources: t("courseDetail.unlockResources") || "请先购买该课程以解锁学习资料",
    subscribersOnly: t("courseDetail.subscribersOnly") || "此内容仅限订阅学员观看",
    unlockDescription: t("courseDetail.unlockDescription") || "加入我们的学习计划，解锁完整的 HLS 加密课程视频，获得权威报社为您准备的专业教材。",
    unlockAll: t("courseDetail.unlockAll") || "立即解锁全部内容",
    paymentSupport: t("courseDetail.paymentSupport") || "支持微信支付 / 支付宝",
  };

  const course = await prisma.course.findUnique({
    where: { id },
    include: { 
      lessons: { orderBy: { order: 'asc' } },
      resources: true
    }
  });

  if (!course) {
    notFound();
    return null;
  }

  // 检查当前用户全权限：管理员拥有上帝视角，普通用户需检查购买记录
  let hasFullAccess = false;
  if (session?.user?.id) {
    if ((session.user as any).role === "ADMIN") {
      hasFullAccess = true;
    } else {
      const order = await prisma.order.findFirst({
        where: {
          userId: session.user.id,
          courseId: id,
          status: OrderStatus.SUCCESS
        }
      });
      hasFullAccess = !!order;
    }
  }

  // 如果有权限且登录了，预取该课程下学员已学完的课时 ID
  let completedLessonIds: string[] = [];
  if (session?.user?.id && hasFullAccess) {
    const { ProgressService } = await import("@/lib/services/progress.service");
    completedLessonIds = await ProgressService.getCompletedLessonIds(session.user.id, id);
  }

  return (
    <div className="course-detail-container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
      {/* Interactive Lesson Content & Sidebar */}
      <LessonContent 
        course={course} 
        hasFullAccess={hasFullAccess} 
        initialCompletedLessonIds={completedLessonIds}
        labels={labels}
      />
      
      {/* Purchase Banner (Show only if not purchased) */}
      {!hasFullAccess && (
        <section style={{ marginTop: '2rem' }}>
          <div style={{ padding: '2rem', background: 'var(--primary-light)', borderRadius: '12px', border: '1px solid rgba(200, 16, 46, 0.1)' }}>
            <h3 style={{ marginBottom: "1.5rem" }}>{t("courseDetail.getAccess") || "获取完整课程权限"}</h3>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "0.9rem", color: "var(--primary)", fontWeight: "600", marginBottom: "0.25rem" }}>{t("courseDetail.buyFull") || "全额购买"}</div>
                <span style={{ color: 'var(--foreground-rgb)', fontWeight: '800', fontSize: '2rem' }}>¥{course.price.toFixed(2)}</span>
              </div>
              <div style={{ width: "240px" }}>
                <PurchaseButton 
                  courseId={course.id} 
                  price={course.price} 
                  labels={{
                    buyNow: t("courseDetail.buyNow") || "立即购买",
                    processing: t("courseDetail.processing") || "正在处理..."
                  }}
                />
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default CourseDetailPage;
