import React from "react";

const Skeleton = ({ width, height, borderRadius = "4px" }: { width?: string; height?: string; borderRadius?: string }) => {
  return (
    <div className="skeleton-pulse" style={{ 
      width: width || "100%", 
      height: height || "1rem", 
      borderRadius,
      backgroundColor: "#e9ecef",
      marginBottom: "0.5rem"
    }} />
  );
};

export const CourseCardSkeleton = () => {
  return (
    <div style={{
      background: "#fff",
      borderRadius: "8px",
      overflow: "hidden",
      border: "1px solid var(--border-color)",
      paddingBottom: "1rem"
    }}>
      <Skeleton height="160px" borderRadius="0" />
      <div style={{ padding: "1.25rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <Skeleton width="40px" height="18px" />
          <Skeleton width="60px" height="18px" />
        </div>
        <Skeleton width="80%" height="1.2rem" />
        <Skeleton width="100%" height="0.85rem" />
        <Skeleton width="90%" height="0.85rem" />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem" }}>
          <Skeleton width="60px" height="1.5rem" />
          <Skeleton width="80px" height="2rem" />
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
