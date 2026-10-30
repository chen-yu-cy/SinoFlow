import React from "react";
import CourseCard from "@/components/course/course-card";
import prisma from "@/lib/db/client";
import { auth } from "@/lib/auth";
import CourseFilters from "@/components/course/course-filters";
import { getTranslation } from "@/lib/i18n";

interface AllCoursesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const AllCoursesPage = async ({ searchParams }: AllCoursesPageProps) => {
  const session = await auth();
  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const { t } = await getTranslation();

  const resolvedParams = await searchParams;
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined;
  const level = typeof resolvedParams.level === 'string' ? resolvedParams.level : undefined;

  // 构建 Prisma 查询条件
  const where: any = {};
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } }
    ];
  }
  if (level && level !== '全部') {
    where.level = level;
  }

  const courses = await prisma.course.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });

  const filterLevels = [
    { value: "全部", label: t("courseFilters.levelAll") },
    { value: "入门级", label: t("courseFilters.levelBeginner") },
    { value: "进阶级", label: t("courseFilters.levelIntermediate") },
    { value: "高级", label: t("courseFilters.levelAdvanced") }
  ];

  return (
    <div>
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "2.25rem", marginBottom: "0.5rem" }}>{t("courses.title")}</h2>
        <p style={{ color: "#6c757d" }}>{t("courses.subtitle")}</p>
      </section>

      {/* 搜索与筛选交互组件 */}
      <CourseFilters 
        levels={filterLevels}
        placeholder={t("courseFilters.searchPlaceholder")}
        filterLabel={t("courseFilters.filterLevel")}
        resetLabel={t("courseFilters.reset")}
      />

      {courses.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {courses.map(course => (
            <CourseCard 
              key={course.id} 
              id={course.id}
              title={course.title}
              description={course.description}
              price={course.price}
              level={course.level}
              duration={course.duration}
              thumbnail={course.thumbnail}
              layout="list"
              isAdmin={isAdmin}
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
            />          ))}
        </div>
      ) : (
        <div style={{ 
          textAlign: "center", 
          padding: "5rem 2rem", 
          background: "#fff", 
          borderRadius: "12px", 
          border: "1px solid var(--border-color)",
          color: "#6c757d"
        }}>
          <p style={{ fontSize: "1.2rem" }}>{t("courses.noCourses")}</p>
          <p>{t("courses.noCoursesSubtitle")}</p>
        </div>
      )}
    </div>
  );
};

export default AllCoursesPage;
