import React from "react";
import prisma from "@/lib/db/client";
import { notFound } from "next/navigation";
import CourseForm from "@/components/admin/course-form";

interface EditCoursePageProps {
  params: Promise<{ id: string }>;
}

const EditCoursePage = async ({ params }: EditCoursePageProps) => {
  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      lessons: {
        orderBy: { order: "asc" }
      }
    }
  });

  if (!course) {
    notFound();
  }

  const initialData = {
    id: course.id,
    title: course.title,
    description: course.description,
    price: course.price,
    level: course.level,
    duration: course.duration,
    lessons: course.lessons.map(l => ({
      title: l.title,
      videoUrl: l.videoUrl
    }))
  };

  return (
    <div style={{ maxWidth: "800px" }}>
      <header style={{ marginBottom: "2rem" }}>
        <h3 style={{ margin: 0 }}>编辑课程：{course.title}</h3>
      </header>
      <CourseForm initialData={initialData} />
    </div>
  );
};

export default EditCoursePage;
