"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Edit, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { deleteCourse } from "@/lib/actions/course";
import AdminConfirmModal from "./confirm-modal";

interface CourseActionsProps {
  courseId: string;
  courseTitle: string;
}

const CourseActions = ({ courseId, courseTitle }: CourseActionsProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const performDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteCourse(courseId);
      if (result.success) {
        alert("课程已成功删除");
      } else {
        alert(result.error || "删除失败");
      }
    } catch (err) {
      alert("请求异常");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", alignItems: "center" }}>
        <Link href={`/courses/${courseId}`} target="_blank" title="预览" style={{ display: "flex", alignItems: "center" }}>
          <ExternalLink size={18} color="#6c757d" />
        </Link>
        <Link href={`/admin/courses/${courseId}/edit`} title="编辑" style={{ display: "flex", alignItems: "center" }}>
          <Edit size={18} color="#4c6ef5" />
        </Link>
        <button 
          onClick={() => setShowConfirm(true)}
          disabled={isDeleting}
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center" }} 
          title="删除"
        >
          {isDeleting ? <Loader2 size={18} className="animate-spin" color="var(--primary)" /> : <Trash2 size={18} color="var(--primary)" />}
        </button>
      </div>

      {showConfirm && (
        <AdminConfirmModal 
          title={`彻底删除课程？`}
          description={`正在删除《${courseTitle}》。此操作将永久移除该课程的所有章节及学员购买记录，无法恢复。`}
          confirmText="确认删除"
          onConfirm={performDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};

export default CourseActions;
