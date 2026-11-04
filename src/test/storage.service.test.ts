// FILE: src/test/storage.service.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  StorageService,
  sanitizeFileName,
  getStorageConfig,
  resetS3Client,
} from "@/lib/services/storage.service";

// Mock @aws-sdk/s3-request-presigner
vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn().mockImplementation(async (_client, command) => {
    const isPut = command.constructor.name === "PutObjectCommand";
    return isPut
      ? "https://storage.example.com/upload-presigned-url"
      : "https://storage.example.com/playback-presigned-url";
  }),
}));

// Mock @aws-sdk/client-s3
const mockSend = vi.fn();
vi.mock("@aws-sdk/client-s3", () => {
  return {
    S3Client: class {
      send = mockSend;
    },
    PutObjectCommand: class {
      constructor(public input: unknown) {}
    },
    GetObjectCommand: class {
      constructor(public input: unknown) {}
    },
    HeadBucketCommand: class {
      constructor(public input: unknown) {}
    },
    CreateBucketCommand: class {
      constructor(public input: unknown) {}
    },
  };
});

describe("StorageService (S3 / MinIO 兼容存储服务)", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    resetS3Client();
    process.env.S3_ENDPOINT = "http://localhost:9000";
    process.env.S3_BUCKET_NAME = "sinoflow-test";
    process.env.S3_ACCESS_KEY_ID = "testkey";
    process.env.S3_SECRET_ACCESS_KEY = "testsecret";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("sanitizeFileName", () => {
    it("应该去除空格并替换为连字符，移除危险字符与路径穿越", () => {
      expect(sanitizeFileName("my video lesson.mp4")).toBe("my-video-lesson.mp4");
      expect(sanitizeFileName("../../etc/passwd")).toBe("passwd");
      expect(sanitizeFileName("测试 视频 file #1.mp4")).toBe("file-1.mp4");
    });
  });

  describe("getStorageConfig", () => {
    it("应该正确从环境变量读取并提供合理默认值", () => {
      const config = getStorageConfig();
      expect(config.endpoint).toBe("http://localhost:9000");
      expect(config.bucketName).toBe("sinoflow-test");
      expect(config.forcePathStyle).toBe(true);
    });
  });

  describe("createPresignedUploadUrl", () => {
    it("当缺少文件名或内容类型时应抛出异常", async () => {
      await expect(
        StorageService.createPresignedUploadUrl({
          filename: "",
          contentType: "video/mp4",
        })
      ).rejects.toThrow("文件名与 MIME 内容类型不能为空");

      await expect(
        StorageService.createPresignedUploadUrl({
          filename: "video.mp4",
          contentType: "",
        })
      ).rejects.toThrow("文件名与 MIME 内容类型不能为空");
    });

    it("应该成功生成带有指定目录、时间戳与随机数的预签名直传 URL", async () => {
      const result = await StorageService.createPresignedUploadUrl({
        filename: "lesson1.mp4",
        contentType: "video/mp4",
        folder: "videos",
      });

      expect(result.uploadUrl).toBe("https://storage.example.com/upload-presigned-url");
      expect(result.key).toMatch(/^uploads\/videos\/\d+-[a-f0-9]{8}-lesson1\.mp4$/);
      expect(result.publicUrl).toBe(`http://localhost:9000/sinoflow-test/${result.key}`);
    });

    it("当配置了 S3_PUBLIC_URL 时，生成的 publicUrl 应该使用该前缀", async () => {
      process.env.S3_PUBLIC_URL = "https://cdn.sinoflow.cn";
      resetS3Client();

      const result = await StorageService.createPresignedUploadUrl({
        filename: "cover.jpg",
        contentType: "image/jpeg",
        folder: "covers",
      });

      expect(result.publicUrl).toMatch(/^https:\/\/cdn\.sinoflow\.cn\/uploads\/covers\//);
    });
  });

  describe("createPresignedPlaybackUrl", () => {
    it("当 key 为空时应抛出错误", async () => {
      await expect(StorageService.createPresignedPlaybackUrl("")).rejects.toThrow(
        "存储对象 Key 不能为空"
      );
    });

    it("应该成功生成时效性播放防盗链 URL", async () => {
      const url = await StorageService.createPresignedPlaybackUrl(
        "uploads/videos/test.mp4",
        1800
      );
      expect(url).toBe("https://storage.example.com/playback-presigned-url");
    });
  });

  describe("ensureBucketExists", () => {
    it("当存储桶已存在时直接返回 true", async () => {
      mockSend.mockResolvedValueOnce({});
      const exists = await StorageService.ensureBucketExists();
      expect(exists).toBe(true);
    });

    it("当存储桶不存在时应尝试自动创建", async () => {
      mockSend
        .mockRejectedValueOnce(new Error("NotFound"))
        .mockResolvedValueOnce({});

      const exists = await StorageService.ensureBucketExists();
      expect(exists).toBe(true);
      expect(mockSend).toHaveBeenCalledTimes(2);
    });
  });
});
