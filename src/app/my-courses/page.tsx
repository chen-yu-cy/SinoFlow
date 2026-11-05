// FILE: src/app/my-courses/page.tsx
import React from "react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import CourseCard from "@/components/course/course-card";
import { OrderStatus } from "@prisma/client";
import { CourseService } from "@/lib/services/course.service";
import { ProgressService } from "@/lib/services/progress.service";
import { getTranslation } from "@/lib/i18n";
import { Sparkles, Compass } from "lucide-react";

const MyCoursesPage = async () => {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
    return null;
  }

  const { t } = await getTranslation();

  // 获取用户已成功支付的订单及其关联的课程
  const orders = await prisma.order.findMany({
    where: {
      userId: session.user.id,
      status: OrderStatus.SUCCESS,
    },
    include: {
      course: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  const purchasedCourses = orders.map((order) => order.course);
  const courseIds = purchasedCourses.map((c) => c.id);

  // 获取这些已购课程的学习进度
  const progressMap = await ProgressService.getCoursesProgress(session.user.id, courseIds);

  // 若暂无已购课程，通过 CourseService 预取精选推荐流 (Redis 缓存 300s 高效提速)
  const rawRecommended = purchasedCourses.length === 0 
    ? await CourseService.getFeaturedCourses(3)
    : [];
  const recommendedCourses = rawRecommended || [];

  return (
    <div>
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{t("nav.myCourses")}</h2>
        <p style={{ color: "#6c757d" }}>{t("myCourses.subtitle")}</p>
      </section>

      {purchasedCourses.length > 0 ? (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
          gap: "2rem" 
        }}>
          {purchasedCourses.map((course) => (
            <CourseCard 
              key={course.id} 
              id={course.id}
              title={course.title}
              description={course.description}
              price={course.price}
              level={course.level}
              duration={course.duration}
              thumbnail={course.thumbnail}
              progress={progressMap[course.id]}
              labels={{
                priceLabel: t("courseCard.priceLabel"),
                learnNow: t("courseCard.learnNow"),
                details: t("courseCard.details"),
                noThumbnail: t("courseCard.noThumbnail"),
                completed: t("courseCard.completed"),
                lessons: t("courseCard.lessons"),
                levelBeginner: t("courseFilters.levelBeginner"),
                levelIntermediate: t("courseFilters.levelIntermediate"),
                levelAdvanced: t("courseFilters.levelAdvanced")
              }}
            />
          ))}
        </div>
      ) : (
        <div>
          <div style={{ 
            textAlign: "center", 
            padding: "4rem 2rem", 
            background: "var(--surface-card)", 
            borderRadius: "16px",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--card-shadow)",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "var(--primary-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem auto",
              color: "var(--primary)"
            }}>
              <Compass size={36} />
            </div>
            <h3 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "0.5rem", color: "var(--foreground-rgb)" }}>
              {t("myCourses.noCourses")}
            </h3>
            <p style={{ color: "var(--text-muted)", maxWidth: "520px", margin: "0 auto 2rem auto", lineHeight: "1.6", fontSize: "0.95rem" }}>
              {t("myCourses.noCoursesSubtitle")}
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/courses" className="btn-primary" style={{ textDecoration: "none", padding: "0.75rem 2rem", borderRadius: "8px", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                {t("myCourses.browseCourses")}
              </Link>
            </div>
          </div>

          {/* 高转化推荐课程流 (Featured Courses Recommendation) */}
          {recommendedCourses.length > 0 && (
            <div style={{ marginTop: "3.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Sparkles size={20} color="var(--primary)" />
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "700", margin: 0, color: "var(--foreground-rgb)" }}>
                    为你推荐入门首选课程 / Recommended For You
                  </h3>
                </div>
                <Link href="/courses" style={{ color: "var(--primary)", textDecoration: "none", fontSize: "0.85rem", fontWeight: "600" }}>
                  浏览全部 &rarr;
                </Link>
              </div>

              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
                gap: "2rem" 
              }}>
                {recommendedCourses.map((course) => (
                  <CourseCard 
                    key={course.id} 
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    price={course.price}
                    level={course.level}
                    duration={course.duration}
                    thumbnail={course.thumbnail}
                    labels={{
                      priceLabel: t("courseCard.priceLabel"),
                      learnNow: t("courseCard.learnNow"),
                      details: t("courseCard.details"),
                      noThumbnail: t("courseCard.noThumbnail"),
                      completed: t("courseCard.completed"),
                      lessons: t("courseCard.lessons"),
                      levelBeginner: t("courseFilters.levelBeginner"),
                      levelIntermediate: t("courseFilters.levelIntermediate"),
                      levelAdvanced: t("courseFilters.levelAdvanced")
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage;
