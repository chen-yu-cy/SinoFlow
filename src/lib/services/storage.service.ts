// FILE: src/lib/services/storage.service.ts
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import path from "path";

export interface PresignedUploadOptions {
  filename: string;
  contentType: string;
  folder?: "videos" | "covers" | "resources" | "general";
  expiresInSeconds?: number;
}

export interface PresignedUploadResult {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

export interface StorageConfig {
  endpoint?: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  forcePathStyle: boolean;
  publicUrlBase?: string;
}

/**
 * 获取当前存储配置 (从环境变量中读取)
 */
export const getStorageConfig = (): StorageConfig => {
  return {
    endpoint: process.env.S3_ENDPOINT || "http://localhost:9000",
    region: process.env.S3_REGION || "us-east-1",
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "minioadmin",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "minioadmin",
    bucketName: process.env.S3_BUCKET_NAME || "sinoflow",
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== "false",
    publicUrlBase: process.env.S3_PUBLIC_URL || undefined,
  };
};

let cachedClient: S3Client | null = null;

/**
 * 获取或创建 S3 客户端单例
 */
export const getS3Client = (): S3Client => {
  if (!cachedClient) {
    const config = getStorageConfig();
    cachedClient = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: config.forcePathStyle,
    });
  }
  return cachedClient;
};

/**
 * 重置客户端缓存 (主要供测试隔离使用)
 */
export const resetS3Client = (): void => {
  cachedClient = null;
};

/**
 * 清理并格式化安全的文件名 (提取 basename 并移除危险字符)
 */
export const sanitizeFileName = (filename: string): string => {
  const base = path.basename(filename.trim());
  return base
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9.\-_]/g, "")
    .replace(/^\.+/, "")
    .replace(/^-+|-+$/g, "");
};

/**
 * 对象存储服务层 (Storage Service)
 * 统一封装 S3 协议操作，支持 MinIO、Oracle Cloud OCI Object Storage、AWS S3、Cloudflare R2 等
 */
export const StorageService = {
  /**
   * 确保目标存储桶存在，如不存在则尝试自动创建 (特别适合 MinIO 本地快速启动)
   */
  async ensureBucketExists(): Promise<boolean> {
    const client = getS3Client();
    const config = getStorageConfig();

    try {
      await client.send(new HeadBucketCommand({ Bucket: config.bucketName }));
      return true;
    } catch {
      try {
        await client.send(new CreateBucketCommand({ Bucket: config.bucketName }));
        return true;
      } catch (createErr) {
        throw new Error(
          `无法创建或访问存储桶 [${config.bucketName}]: ${createErr instanceof Error ? createErr.message : String(createErr)}`
        );
      }
    }
  },

  /**
   * 生成供客户端直传的预签名 PUT URL (Presigned Upload URL)
   */
  async createPresignedUploadUrl(
    options: PresignedUploadOptions
  ): Promise<PresignedUploadResult> {
    const { filename, contentType, folder = "general", expiresInSeconds = 900 } = options;

    if (!filename || !contentType) {
      throw new Error("文件名与 MIME 内容类型不能为空");
    }

    const config = getStorageConfig();
    const client = getS3Client();

    const timestamp = Date.now();
    const randomHex = crypto.randomBytes(4).toString("hex");
    const cleanName = sanitizeFileName(filename);
    const key = `uploads/${folder}/${timestamp}-${randomHex}-${cleanName}`;

    const command = new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn: expiresInSeconds,
    });

    // 计算资源的对外访问 URL (如配置了外部 CDN/域名则优先使用，否则 fallback 到 endpoint/bucket/key)
    const base = config.publicUrlBase
      ? config.publicUrlBase.replace(/\/$/, "")
      : `${(config.endpoint || "").replace(/\/$/, "")}/${config.bucketName}`;
    const publicUrl = `${base}/${key}`;

    return {
      uploadUrl,
      key,
      publicUrl,
    };
  },

  /**
   * 生成具有时效性的音视频下载/播放预签名 GET URL (防盗链)
   */
  async createPresignedPlaybackUrl(
    key: string,
    expiresInSeconds = 3600
  ): Promise<string> {
    if (!key) {
      throw new Error("存储对象 Key 不能为空");
    }

    const config = getStorageConfig();
    const client = getS3Client();

    const command = new GetObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    });

    return await getSignedUrl(client, command, {
      expiresIn: expiresInSeconds,
    });
  },
};
