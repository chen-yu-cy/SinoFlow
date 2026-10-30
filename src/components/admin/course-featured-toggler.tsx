// FILE: src/components/admin/course-featured-toggler.tsx
"use client";

import React, { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { toggleCourseFeaturedAction } from "@/lib/actions/course";

interface CourseFeaturedTogglerProps {
  courseId: string;
  initialFeatured: boolean;
}

export const CourseFeaturedToggler = ({ courseId, initialFeatured }: CourseFeaturedTogglerProps) => {
  const [isFeatured, setIsFeatured] = useState(initialFeatured);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (loading) return;
    setLoading(true);
    
    const targetState = !isFeatured;
    try {
      const res = await toggleCourseFeaturedAction(courseId, targetState);
      if (res.error) {
        alert(res.error || "操作失败");
      } else {
        setIsFeatured(targetState);
      }
    } catch (err) {
      alert("网络请求异常，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      style={{
        background: "none",
        border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        padding: "0.25rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        outline: "none",
        transition: "transform 0.15s ease",
      }}
      title={isFeatured ? "取消精选" : "设为精选"}
      onMouseEnter={(e) => {
        if (!loading) e.currentTarget.style.transform = "scale(1.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {loading ? (
        <Loader2 size={20} className="animate-spin" color="#adb5bd" />
      ) : (
        <Star
          size={20}
          fill={isFeatured ? "#fcc419" : "none"}
          color={isFeatured ? "#fcc419" : "#ced4da"}
          style={{ transition: "all 0.25s ease" }}
        />
      )}
      <style jsx global>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};

export default CourseFeaturedToggler;
