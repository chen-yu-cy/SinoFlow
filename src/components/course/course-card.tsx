// FILE: src/components/course/course-card.tsx
import React from "react";
import Link from "next/link";
import { BarChart, Clock, ChevronRight, BookOpen, Edit } from "lucide-react";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  level: string;
  duration: string;
  thumbnail?: string;
  layout?: "grid" | "list";
  isAdmin?: boolean;
  labels?: {
    priceLabel: string;
    learnNow: string;
    details: string;
    noThumbnail: string;
  };
  progress?: {
    completedCount: number;
    totalCount: number;
  };
}

const CourseCard = ({ id, title, description, price, level, duration, thumbnail, layout = "grid", isAdmin, labels, progress }: CourseCardProps) => {
  const t = labels || {
    priceLabel: "课程价格",
    learnNow: "立即学习",
    details: "详情",
    noThumbnail: "暂无封面",
    completed: "已完成",
    lessons: "课时"
  };

  const completedText = (t as any).completed || "已完成";
  const lessonsText = (t as any).lessons || "课时";

  const getLevelLabel = () => {
    if (level === "入门级" || level === "基础级") return (t as any).levelBeginner || level;
    if (level === "进阶级") return (t as any).levelIntermediate || level;
    if (level === "高级") return (t as any).levelAdvanced || level;
    return level;
  };

  const getDurationLabel = () => {
    if (/^\d+$/.test(duration)) {
      return `${duration} ${lessonsText}`;
    }
    return duration.replace("课时", lessonsText);
  };

  // 根据 3 个等级确定颜色映射逻辑
  const getLevelStyles = () => {
    switch (level) {
      case "入门级":
      case "基础级":
      case "Elementary":
      case "Beginner":
        return { bg: "var(--success-light)", color: "var(--success)" };
      case "进阶级":
      case "Intermediate":
        return { bg: "var(--warning-light)", color: "var(--warning)" };
      case "高级":
      case "Advanced":
        return { bg: "var(--primary-light)", color: "var(--primary)" };
      default:
        return { bg: "#f1f3f5", color: "#495057" };
    }
  };

  const { bg: levelBg, color: levelColor } = getLevelStyles();

  if (layout === "list") {
    return (
      <div className="course-card" style={{
        background: "#fff",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "var(--card-shadow)",
        display: "flex",
        border: "1px solid var(--border-color)",
        padding: "1.25rem",
        gap: "2rem",
        alignItems: "center",
        position: "relative"
      }}>
        {/* Admin Quick Edit Floating Icon */}
        {isAdmin && (
          <Link href={`/admin/courses/${id}/edit`} target="_blank" style={{ position: "absolute", top: "1rem", right: "1rem", color: "#adb5bd", transition: "color 0.2s" }} title="快速编辑">
            <Edit size={18} />
          </Link>
        )}

        {/* Thumbnail Link */}
        <Link href={`/courses/${id}`} style={{ display: "block", textDecoration: "none", flexShrink: 0 }}>
          <div style={{
            width: "240px",
            height: "135px",
            background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#adb5bd",
            fontSize: "0.8rem",
            border: "1px solid #eee",
            overflow: "hidden",
            cursor: "pointer"
          }}>
            {thumbnail ? (
              <img src={thumbnail} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <>
                <BookOpen size={32} strokeWidth={1} style={{ marginBottom: "0.5rem" }} />
                <div>{t.noThumbnail}</div>
              </>
            )}
          </div>
        </Link>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: "1rem", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.2rem 0.6rem", background: levelBg, borderRadius: "4px", color: levelColor, fontWeight: 600 }}>
              <BarChart size={14} /> {getLevelLabel()}
            </span>
            <span style={{ fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.2rem 0.6rem", background: "#fff3cd", borderRadius: "4px", color: "#856404", fontWeight: 600 }}>
              <Clock size={14} /> {getDurationLabel()}
            </span>
          </div>
          <h4 style={{ margin: "0 0 0.75rem 0", fontSize: "1.3rem", color: "var(--foreground-rgb)", fontWeight: "700" }}>{title}</h4>
          <p style={{ margin: "0", fontSize: "0.95rem", color: "#6c757d", lineHeight: "1.6" }}>{description}</p>
        </div>

        <div style={{ 
          width: "200px", 
          borderLeft: "1px solid #eee", 
          paddingLeft: "2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "1.25rem"
        }}>
          <div>
            <div style={{ fontSize: "0.8rem", color: "#adb5bd", marginBottom: "0.2rem" }}>{t.priceLabel}</div>
            <span style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--primary)" }}>¥{price.toFixed(2)}</span>
          </div>
          <Link href={`/courses/${id}`} style={{ width: "100%" }}>
            <button className="btn-primary" style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              {t.learnNow} <ChevronRight size={18} />
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Default Grid Layout
  return (
    <div className="course-card" style={{
      background: "#fff",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "var(--card-shadow)",
      display: "flex",
      flexDirection: "column",
      border: "1px solid var(--border-color)",
      position: "relative"
    }}>
      {/* Admin Quick Edit Floating Icon */}
      {isAdmin && (
        <Link href={`/admin/courses/${id}/edit`} target="_blank" style={{ position: "absolute", top: "1rem", right: "1rem", zIndex: 10, background: "rgba(255,255,255,0.9)", padding: "0.4rem", borderRadius: "50%", display: "flex", color: "var(--primary)", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} title="快速编辑">
          <Edit size={18} />
        </Link>
      )}

      {/* Thumbnail Link */}
      <Link href={`/courses/${id}`} style={{ display: "block", textDecoration: "none" }}>
        <div style={{
          width: "100%",
          aspectRatio: "16/9",
          background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#adb5bd",
          fontSize: "0.9rem",
          overflow: "hidden",
          borderBottom: "1px solid #f1f3f5",
          cursor: "pointer"
        }}>
          {thumbnail ? (
            <img src={thumbnail} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }} className="card-image" />
          ) : (
            <>
              <BookOpen size={40} strokeWidth={1} style={{ marginBottom: "0.5rem" }} />
              <div>{t.noThumbnail}</div>
            </>
          )}
        </div>
      </Link>

      <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
          <span style={{ 
            fontSize: "0.7rem", 
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            padding: "0.2rem 0.5rem", 
            background: levelBg, 
            borderRadius: "4px",
            color: levelColor,
            fontWeight: 600
          }}>
            <BarChart size={12} /> {getLevelLabel()}
          </span>
          <span style={{ 
            fontSize: "0.7rem", 
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            padding: "0.2rem 0.5rem", 
            background: "#fff3cd", 
            borderRadius: "4px",
            color: "#856404",
            fontWeight: 600
          }}>
            <Clock size={12} /> {getDurationLabel()}
          </span>
        </div>

        <h4 style={{ margin: "0 0 0.75rem 0", fontSize: "1.15rem", fontWeight: "700" }}>{title}</h4>
        <p style={{ 
          margin: "0 0 1.5rem 0", 
          fontSize: "0.85rem", 
          color: "#6c757d", 
          display: "-webkit-box", 
          WebkitLineClamp: 2, 
          WebkitBoxOrient: "vertical", 
          overflow: "hidden",
          lineHeight: "1.5"
        }}>
          {description}
        </p>

        {progress && (
          <div style={{ marginTop: "auto", marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#6c757d", marginBottom: "0.4rem", fontWeight: "500" }}>
              <span>{completedText} {progress.completedCount}/{progress.totalCount} {lessonsText}</span>
              <span style={{ fontWeight: "700", color: "var(--success)" }}>{Math.round((progress.completedCount / (progress.totalCount || 1)) * 100)}%</span>
            </div>
            <div style={{ width: "100%", height: "6px", background: "#e9ecef", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ width: `${(progress.completedCount / (progress.totalCount || 1)) * 100}%`, height: "100%", background: "var(--success)", transition: "width 0.4s ease-out" }}></div>
            </div>
          </div>
        )}

        <div style={{ 
          marginTop: progress ? "0" : "auto", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          paddingTop: "1.25rem",
          borderTop: "1px solid #f8f9fa"
        }}>
          <span style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--primary)" }}>
            ¥{price.toFixed(2)}
          </span>
          <Link href={`/courses/${id}`}>
            <button className="btn-primary" style={{ padding: "0.5rem 1.25rem", borderRadius: "6px", fontSize: "0.9rem" }}>
              {t.details}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
