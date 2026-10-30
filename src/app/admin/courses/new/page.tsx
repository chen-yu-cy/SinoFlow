"use client";

import React from "react";
import CourseForm from "@/components/admin/course-form";

const NewCoursePage = () => {
  return (
    <div style={{ maxWidth: "800px" }}>
      <header style={{ marginBottom: "2rem" }}>
        <h3 style={{ margin: 0 }}>创建新课程</h3>
      </header>
      <CourseForm />
    </div>
  );
};

export default NewCoursePage;
