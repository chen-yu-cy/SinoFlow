// FILE: src/lib/storage/validation.ts
export const STORAGE_LIMITS = {
  videos: {
    maxSize: 2 * 1024 * 1024 * 1024, // 2 GB
    maxSizeLabel: "2 GB",
    allowedExtensions: [".mp4", ".webm", ".mov", ".m4v"],
    allowedMimeTypes: [
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-m4v",
    ],
    formatLabel: "MP4, WebM, MOV, M4V",
  },
  covers: {
    maxSize: 10 * 1024 * 1024, // 10 MB
    maxSizeLabel: "10 MB",
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
    allowedMimeTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
    ],
    formatLabel: "JPG, PNG, WebP",
  },
  resources: {
    maxSize: 100 * 1024 * 1024, // 100 MB
    maxSizeLabel: "100 MB",
    allowedExtensions: [
      ".pdf",
      ".zip",
      ".rar",
      ".doc",
      ".docx",
      ".ppt",
      ".pptx",
      ".xls",
      ".xlsx",
      ".txt",
    ],
    allowedMimeTypes: [
      "application/pdf",
      "application/zip",
      "application/x-zip-compressed",
      "application/x-rar-compressed",
      "application/vnd.rar",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "application/octet-stream",
    ],
    formatLabel: "PDF, ZIP, RAR, Word, PPT, Excel, TXT",
  },
} as const;

export type StorageFolder = keyof typeof STORAGE_LIMITS;

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * 校验上传文件的格式与大小限制
 */
export const validateUploadFile = (
  filename: string,
  contentType: string,
  folder: string,
  size?: number
): FileValidationResult => {
  const targetFolder = folder as StorageFolder;
  const rules = STORAGE_LIMITS[targetFolder];

  // 1. 如果是非受限或通用目录，仅做基础安全性校验
  if (!rules) {
    if (filename.toLowerCase().endsWith(".exe") || filename.toLowerCase().endsWith(".sh")) {
      return { valid: false, error: "禁止上传可执行脚本文件" };
    }
    return { valid: true };
  }

  // 2. 校验文件后缀名
  const ext = filename.lastIndexOf(".") !== -1 
    ? filename.substring(filename.lastIndexOf(".")).toLowerCase()
    : "";

  if (!ext || !(rules.allowedExtensions as readonly string[]).includes(ext)) {
    return {
      valid: false,
      error: `格式不支持：[${ext || "无后缀"}]。该类型仅支持: ${rules.formatLabel}`,
    };
  }

  // 3. 校验 MIME 类型 (若前端提供)
  if (contentType && contentType !== "application/octet-stream") {
    const isMimeAllowed = (rules.allowedMimeTypes as readonly string[]).some(
      (mime) => mime.toLowerCase() === contentType.toLowerCase()
    );

    if (!isMimeAllowed) {
      return {
        valid: false,
        error: `MIME 类型 [${contentType}] 不符合安全要求。仅支持: ${rules.formatLabel}`,
      };
    }
  }

  // 4. 校验文件大小限制
  if (typeof size === "number" && size > rules.maxSize) {
    const sizeInMB = (size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `文件体积超限 (${sizeInMB} MB)，上限为 ${rules.maxSizeLabel}`,
    };
  }

  return { valid: true };
};
