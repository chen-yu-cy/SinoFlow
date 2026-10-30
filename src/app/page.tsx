// FILE: src/app/page.tsx
import React from "react";
import CourseCard from "@/components/course/course-card";
import prisma from "@/lib/db/client";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getTranslation } from "@/lib/i18n";

const HomePage = async () => {
  const session = await auth();
  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const { t } = await getTranslation();

  const courses = await prisma.course.findMany({
    take: 4, // 首页只展示前 4 个精选课程
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      {/* Hero Section */}
      <section style={{ 
        padding: "4rem 0", 
        textAlign: "center", 
        borderBottom: "1px solid var(--border-color)",
        marginBottom: "3rem"
      }}>
        <h2 style={{ fontSize: "2.5rem", marginBottom: "1rem", color: "var(--foreground-rgb)" }}>
          {t("home.title")}
        </h2>
        <p style={{ fontSize: "1.2rem", color: "#6c757d", maxWidth: "700px", margin: "0 auto" }}>
          {t("home.subtitle")}
        </p>
      </section>

      {/* Featured Courses Grid */}
      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "1.75rem", margin: 0 }}>{t("home.featuredCourses")}</h3>
          <Link href="/courses" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }} className="nav-link">
            {t("home.viewAll")} &rarr;
          </Link>
        </div>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
          gap: "2rem" 
        }}>
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
              layout="grid"
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
            />
          ))}
        </div>
      </section>

      {/* Trust Banner */}
      <section style={{ 
        marginTop: "5rem", 
        padding: "3rem", 
        background: "#fff", 
        borderRadius: "12px", 
        border: "1px solid var(--border-color)",
        textAlign: "center"
      }}>
        <h4 style={{ color: "var(--primary)", marginBottom: "1rem" }}>{t("home.authorityTitle")}</h4>
        <p style={{ fontSize: "1.1rem" }}>{t("home.authorityDesc")}</p>
      </section>
    </div>
  );
};

export default HomePage;
