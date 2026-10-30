"use client";

import React, { useState } from "react";
import CourseCard from "@/components/course/course-card";

interface CourseListProps {
  initialCourses: any[];
}

const CourseList = ({ initialCourses }: CourseListProps) => {
  const [layout, setLayout] = useState<"grid" | "list">("grid");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.75rem", margin: 0 }}>精选课程</h3>
        <div style={{ 
          display: "flex", 
          background: "#e9ecef", 
          padding: "0.25rem", 
          borderRadius: "6px",
          gap: "0.25rem"
        }}>
          <button 
            onClick={() => setLayout("grid")}
            style={{ 
              padding: "0.4rem 0.8rem", 
              border: "none", 
              borderRadius: "4px",
              background: layout === "grid" ? "#fff" : "transparent",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: layout === "grid" ? "600" : "normal",
              boxShadow: layout === "grid" ? "0 2px 4px rgba(0,0,0,0.05)" : "none"
            }}
          >
            网格显示
          </button>
          <button 
            onClick={() => setLayout("list")}
            style={{ 
              padding: "0.4rem 0.8rem", 
              border: "none", 
              borderRadius: "4px",
              background: layout === "list" ? "#fff" : "transparent",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: layout === "list" ? "600" : "normal",
              boxShadow: layout === "list" ? "0 2px 4px rgba(0,0,0,0.05)" : "none"
            }}
          >
            列表显示
          </button>
        </div>
      </div>
      
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: layout === "grid" ? "repeat(auto-fill, minmax(280px, 1fr))" : "1fr", 
        gap: "2rem" 
      }}>
        {initialCourses.map(course => (
          <CourseCard 
            key={course.id} 
            id={course.id}
            title={course.title}
            description={course.description}
            price={course.price}
            level="基础级"
            duration="20 课时"
            layout={layout}
          />
        ))}
      </div>
    </div>
  );
};

export default CourseList;
