// FILE: src/app/api/admin/upload/presign/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { StorageService } from "@/lib/services/storage.service";
import { validateUploadFile } from "@/lib/storage/validation";
import { logger } from "@/lib/logger";
import { enforceRateLimit } from "@/lib/security/rate-limit-guard";

interface PresignRequestBody {
  filename?: string;
  contentType?: string;
  folder?: "videos" | "covers" | "resources" | "general";
  size?: number;
  expiresInSeconds?: number;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user as { role?: string } | undefined)?.role;

    if (!session?.user || userRole !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // 管理员预签名直传频次限流保护（30 次 / 60 秒）
    const rateCheck = await enforceRateLimit(req, "ADMIN_PRESIGN", (session.user as { id?: string }).id);
    if (rateCheck.blocked && rateCheck.response) {
      return rateCheck.response;
    }

    let body: PresignRequestBody;
    try {
      body = (await req.json()) as PresignRequestBody;
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const { filename, contentType, folder, size, expiresInSeconds } = body;

    if (!filename || typeof filename !== "string") {
      return NextResponse.json(
        { success: false, error: "缺少有效的文件名参数 (filename)" },
        { status: 400 }
      );
    }

    if (!contentType || typeof contentType !== "string") {
      return NextResponse.json(
        { success: false, error: "缺少有效的 MIME 内容类型 (contentType)" },
        { status: 400 }
      );
    }

    // 执行严格的格式与文件体积校验
    const validation = validateUploadFile(filename, contentType, folder || "general", size);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const result = await StorageService.createPresignedUploadUrl({
      filename,
      contentType,
      folder: folder || "general",
      expiresInSeconds: expiresInSeconds || 900,
    });

    logger.info(
      { key: result.key, folder: folder || "general" },
      "[Storage] 成功签发 S3/MinIO 客户端直传预签名 URL"
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error({ err: error }, "[Storage] 预签名 URL 签发失败");
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
