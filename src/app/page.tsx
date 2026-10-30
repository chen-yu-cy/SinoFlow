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

  // 1. 优先拉取标记为精选的课程
  const featuredCourses = await prisma.course.findMany({
    where: { isFeatured: true },
    orderBy: { createdAt: 'desc' },
    take: 4
  });

  let courses = [...featuredCourses];

  // 2. 如果不足 4 个，则用最新的非精选课程来补全
  if (courses.length < 4) {
    const additionalCourses = await prisma.course.findMany({
      where: { isFeatured: false },
      orderBy: { createdAt: 'desc' },
      take: 4 - courses.length
    });
    courses = [...courses, ...additionalCourses];
  }

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
            <Link href="/features/notes" className="btn-secondary-outline" style={{ textDecoration: "none", padding: "0.6rem 1.8rem", borderRadius: "24px" }}>
              ⏱️ 了解时间戳笔记
            </Link>
          </div>

          {/* Marquee 无缝横向滚动条 */}
          <div className="marquee-container">
            <div className="marquee-content">
              <div className="marquee-item">
                ⏱️ <span className="time">01:45</span> 记录核心句型：“我学汉语快半年了”
              </div>
              <div className="marquee-item">
                ⏱️ <span className="time">04:12</span> 标注四声声调：“半”为去声
              </div>
              <div className="marquee-item">
                ⏱️ <span className="time">09:30</span> 摘录报社社论核心社评词汇
              </div>
              <div className="marquee-item">
                ⏱️ <span className="time">15:20</span> 收藏本章推荐课外阅读材料
              </div>
              <div className="marquee-item">
                ⏱️ <span className="time">22:05</span> 标注汉语考试 HSK 核心词汇
              </div>
              {/* 重复一组保证无缝轮播 */}
              <div className="marquee-item">
                ⏱️ <span className="time">01:45</span> 记录核心句型：“我学汉语快半年了”
              </div>
              <div className="marquee-item">
                ⏱️ <span className="time">04:12</span> 标注四声声调：“半”为去声
              </div>
              <div className="marquee-item">
                ⏱️ <span className="time">09:30</span> 摘录报社社论核心社评词汇
              </div>
              <div className="marquee-item">
                ⏱️ <span className="time">15:20</span> 收藏本章推荐课外阅读材料
              </div>
              <div className="marquee-item">
                ⏱️ <span className="time">22:05</span> 标注汉语考试 HSK 核心词汇
              </div>
            </div>
          </div>

          {/* 往下滚动微光指示 */}
          <a href="#featured-courses" className="hero-scroll-prompt" style={{ textDecoration: "none" }}>
            <span>向下滚动探索</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </a>
        </div>
      </section>

      {/* Featured Courses Grid */}
      <section id="featured-courses">
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
              isFree={course.isFree}
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
                levelAdvanced: t("courseFilters.levelAdvanced"),
                free: t("courseCard.free")
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
