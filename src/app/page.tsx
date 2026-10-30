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
      {/* Hero Section with Ambient Mesh Gradients */}
      <section className="hero-gradient-wrapper">
        <div className="hero-bg-glow-1"></div>
        <div className="hero-bg-glow-2"></div>
        
        <div className="hero-content">
          <div className="hero-badge">
            <span>✦</span> {t("home.authorityTitle")} <span>✦</span>
          </div>
          <h2 className="hero-title font-serif-zh-en">
            {t("home.title")}
          </h2>
          <p className="hero-subtitle">
            {t("home.subtitle")}
          </p>
          <div className="hero-actions">
            <Link href="/courses" className="btn-primary" style={{ textDecoration: "none", padding: "0.75rem 2rem", borderRadius: "24px", display: "inline-block" }}>
              {t("home.viewAll")}
            </Link>
            {!session && (
              <Link href="/register" className="btn-secondary-outline">
                {t("nav.register")}
              </Link>
            )}
          </div>
        </div>
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
