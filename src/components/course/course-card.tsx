import React from "react";
import Link from "next/link";
import { BarChart, Clock, ChevronRight, BookOpen } from "lucide-react";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  level: string;
  duration: string;
  thumbnail?: string;
  layout?: "grid" | "list";
}

const CourseCard = ({ id, title, description, price, level, duration, layout = "grid" }: CourseCardProps) => {
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
        alignItems: "center"
      }}>
        {/* Thumbnail Placeholder */}
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
          flexShrink: 0,
          border: "1px solid #eee"
        }}>
          <BookOpen size={32} strokeWidth={1} style={{ marginBottom: "0.5rem" }} />
          <div>预览图</div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: "1rem", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.2rem 0.6rem", background: "var(--success-light)", borderRadius: "4px", color: "var(--success)", fontWeight: 600 }}>
              <BarChart size={14} /> {level}
            </span>
            <span style={{ fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.2rem 0.6rem", background: "#fff3cd", borderRadius: "4px", color: "#856404", fontWeight: 600 }}>
              <Clock size={14} /> {duration}
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
            <div style={{ fontSize: "0.8rem", color: "#adb5bd", marginBottom: "0.2rem" }}>课程价格</div>
            <span style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--primary)" }}>¥{price.toFixed(2)}</span>
          </div>
          <Link href={`/courses/${id}`} style={{ width: "100%" }}>
            <button className="btn-primary" style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              立即学习 <ChevronRight size={18} />
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
      border: "1px solid var(--border-color)"
    }}>
      {/* Thumbnail Placeholder */}
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
        borderBottom: "1px solid #f1f3f5"
      }}>
        <BookOpen size={40} strokeWidth={1} style={{ marginBottom: "0.5rem" }} />
        <div style={{ transition: "transform 0.5s" }}>课程封面</div>
      </div>

      <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
          <span style={{ 
            fontSize: "0.7rem", 
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            padding: "0.2rem 0.5rem", 
            background: "var(--success-light)", 
            borderRadius: "4px",
            color: "var(--success)",
            fontWeight: 600
          }}>
            <BarChart size={12} /> {level}
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
            <Clock size={12} /> {duration}
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

        <div style={{ 
          marginTop: "auto", 
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
              详情
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
