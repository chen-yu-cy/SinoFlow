// FILE: src/lib/storage/client-upload.ts
import { validateUploadFile } from "./validation";

export interface VideoMetadata {
  duration: number; // 秒数
  thumbnailBlob: Blob | null;
}

export interface DirectUploadResult {
  publicUrl: string;
  key: string;
}

/**
 * 在浏览器本地极速提取视频第 1 秒的封面帧与视频时长 (0 毫秒服务器开销，无需 FFmpeg)
 */
export const extractVideoMetadataAndThumbnail = async (
  file: File
): Promise<VideoMetadata> => {
  return new Promise((resolve) => {
    // 兼容非浏览器环境或不支持 Video/Canvas 的极端情况
    if (typeof window === "undefined" || !window.document) {
      return resolve({ duration: 0, thumbnailBlob: null });
    }

    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);

    video.preload = "metadata";
    video.src = objectUrl;
    video.muted = true;
    video.playsInline = true;

    // 超时兜底保护 (例如损坏的音视频文件 5秒未响应)
    const timeoutId = setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
      resolve({ duration: 0, thumbnailBlob: null });
    }, 5000);

    video.onloadedmetadata = () => {
      const duration = Math.round(video.duration || 0);
      // 提取第 1 秒或中点
      video.currentTime = Math.min(1.0, (video.duration || 1) / 2);
    };

    video.onseeked = () => {
      clearTimeout(timeoutId);
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(objectUrl);
              resolve({
                duration: Math.round(video.duration || 0),
                thumbnailBlob: blob,
              });
            },
            "image/jpeg",
            0.85
          );
          return;
        }
      } catch {
        // 画布绘制异常兜底
      }

      URL.revokeObjectURL(objectUrl);
      resolve({
        duration: Math.round(video.duration || 0),
        thumbnailBlob: null,
      });
    };

    video.onerror = () => {
      clearTimeout(timeoutId);
      URL.revokeObjectURL(objectUrl);
      resolve({ duration: 0, thumbnailBlob: null });
    };
  });
};

/**
 * 通过预签名 URL 客户端直传到 S3 / MinIO 兼容对象存储 (配备实时百分比进度回调)
 */
export const uploadFileViaPresignedUrl = async (
  file: File | Blob,
  options: {
    filename: string;
    contentType: string;
    folder: "videos" | "covers" | "resources" | "general";
    onProgress?: (percent: number) => void;
  }
): Promise<DirectUploadResult> => {
  const { filename, contentType, folder, onProgress } = options;

  // 0. 客户端先行校验格式与体积，避免浪费带宽
  const validation = validateUploadFile(filename, contentType, folder, file.size);
  if (!validation.valid) {
    throw new Error(validation.error || "文件格式或体积不符合要求");
  }

  // 1. 请求服务端换取有时效性的预签名直传 PUT URL
  const presignRes = await fetch("/api/admin/upload/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, contentType, folder, size: file.size }),
  });

  if (!presignRes.ok) {
    const errorJson = (await presignRes.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(errorJson.error || "获取预签名上传地址失败");
  }

  const { data } = (await presignRes.json()) as {
    data: { uploadUrl: string; key: string; publicUrl: string };
  };

  // 2. 使用 XMLHttpRequest 直接 PUT 写入 S3/MinIO 存储桶以获得精准上传进度
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", data.uploadUrl, true);
    xhr.setRequestHeader("Content-Type", contentType);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        if (onProgress) onProgress(100);
        resolve({
          publicUrl: data.publicUrl,
          key: data.key,
        });
      } else {
        reject(
          new Error(`存储桶直传失败: HTTP ${xhr.status} ${xhr.statusText}`)
        );
      }
    };

    xhr.onerror = () => {
      reject(new Error("网络异常，无法直连对象存储服务"));
    };

    xhr.send(file);
  });
};
