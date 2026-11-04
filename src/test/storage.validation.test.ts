// FILE: src/test/storage.validation.test.ts
import { describe, it, expect } from "vitest";
import { validateUploadFile, STORAGE_LIMITS } from "@/lib/storage/validation";

describe("Storage Validation (文件格式与大小安全校验)", () => {
  describe("视频类型校验 (videos)", () => {
    it("合法 MP4 且体积在 2GB 内应校验通过", () => {
      const result = validateUploadFile(
        "lesson1.mp4",
        "video/mp4",
        "videos",
        500 * 1024 * 1024 // 500 MB
      );
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("合法 WebM 与 MOV 格式应校验通过", () => {
      expect(validateUploadFile("clip.webm", "video/webm", "videos").valid).toBe(true);
      expect(validateUploadFile("recording.mov", "video/quicktime", "videos").valid).toBe(true);
    });

    it("不支持的视频格式 (如 AVI、RMVB、WMV) 应被拦截并返回友好错误", () => {
      const result = validateUploadFile("old_course.avi", "video/x-msvideo", "videos");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("格式不支持：[.avi]");
      expect(result.error).toContain("MP4, WebM, MOV, M4V");
    });

    it("超过 2GB 的超大视频应被拦截", () => {
      const oversized = 2.5 * 1024 * 1024 * 1024; // 2.5 GB
      const result = validateUploadFile("huge_lecture.mp4", "video/mp4", "videos", oversized);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("文件体积超限");
      expect(result.error).toContain(STORAGE_LIMITS.videos.maxSizeLabel);
    });
  });

  describe("封面类型校验 (covers)", () => {
    it("合法 JPG / PNG / WebP 且在 10MB 内应校验通过", () => {
      expect(validateUploadFile("cover.jpg", "image/jpeg", "covers", 2 * 1024 * 1024).valid).toBe(true);
      expect(validateUploadFile("poster.png", "image/png", "covers", 3 * 1024 * 1024).valid).toBe(true);
      expect(validateUploadFile("thumb.webp", "image/webp", "covers", 1 * 1024 * 1024).valid).toBe(true);
    });

    it("超过 10MB 的封面应被拦截", () => {
      const result = validateUploadFile(
        "huge_cover.png",
        "image/png",
        "covers",
        15 * 1024 * 1024 // 15 MB
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain("文件体积超限");
    });

    it("非图片格式应被拦截", () => {
      const result = validateUploadFile("not_an_image.pdf", "application/pdf", "covers");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("格式不支持");
    });
  });

  describe("课件与附件校验 (resources)", () => {
    it("合法 PDF / ZIP / Word 资料且在 100MB 内应校验通过", () => {
      expect(validateUploadFile("handout.pdf", "application/pdf", "resources", 10 * 1024 * 1024).valid).toBe(true);
      expect(validateUploadFile("code.zip", "application/zip", "resources", 30 * 1024 * 1024).valid).toBe(true);
      expect(validateUploadFile("slides.pptx", "application/vnd.ms-powerpoint", "resources", 5 * 1024 * 1024).valid).toBe(true);
    });

    it("超过 100MB 的课件资料应被拦截", () => {
      const result = validateUploadFile(
        "huge_package.zip",
        "application/zip",
        "resources",
        120 * 1024 * 1024 // 120 MB
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain("文件体积超限");
      expect(result.error).toContain("100 MB");
    });
  });

  describe("危险可执行脚本防护", () => {
    it("禁止上传 .exe 或 .sh 脚本", () => {
      expect(validateUploadFile("virus.exe", "application/octet-stream", "general").valid).toBe(false);
      expect(validateUploadFile("script.sh", "text/plain", "general").valid).toBe(false);
    });
  });
});
