import React from "react";
import Link from "next/link";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  level: string;
  duration: string;
  thumbnail?: string;
}

const CourseCard = ({ id, title, description, price, level, duration }: CourseCardProps) => {
  return (
    <div style={{
      background: "#fff",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "var(--card-shadow)",
      transition: "transform 0.2s",
      display: "flex",
      flexDirection: "column",
      border: "1px solid var(--border-color)"
    }}>
      {/* Thumbnail Placeholder */}
      <div style={{
        width: "100%",
        aspectRatio: "16/9",
        background: "#f0f0f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#adb5bd",
        fontSize: "0.9rem"
      }}>
        [ 课程封面图 ]
      </div>

      <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <span style={{ 
            fontSize: "0.7rem", 
            padding: "0.2rem 0.5rem", 
            background: "#e9ecef", 
            borderRadius: "4px",
            color: "#495057",
            fontWeight: 600
          }}>
            {level}
          </span>
          <span style={{ 
            fontSize: "0.7rem", 
            padding: "0.2rem 0.5rem", 
            background: "#fff3cd", 
            borderRadius: "4px",
            color: "#856404",
            fontWeight: 600
          }}>
            {duration}
          </span>
        </div>

        <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem" }}>{title}</h4>
        <p style={{ 
          margin: "0 0 1.25rem 0", 
          fontSize: "0.85rem", 
          color: "#6c757d", 
          display: "-webkit-box", 
          WebkitLineClamp: 2, 
          WebkitBoxOrient: "vertical", 
          overflow: "hidden",
          lineHeight: "1.4"
        }}>
          {description}
        </p>

        <div style={{ 
          marginTop: "auto", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          paddingTop: "1rem",
          borderTop: "1px solid #f8f9fa"
        }}>
          <span style={{ fontSize: "1.2rem", fontWeight: "bold", color: "var(--primary)" }}>
            ¥{price.toFixed(2)}
          </span>
          <Link href={`/courses/${id}`}>
            <button className="btn-primary" style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}>
              查看详情
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
