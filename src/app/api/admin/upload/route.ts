import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. 保存视频文件
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/\s+/g, "-");
    const videoFileName = `${timestamp}-${cleanFileName}`;
    const uploadDir = path.join(process.cwd(), "public/uploads");
    
    await mkdir(uploadDir, { recursive: true });

    const videoPath = path.join(uploadDir, videoFileName);
    await writeFile(videoPath, buffer);
    const videoUrl = `/uploads/${videoFileName}`;

    // 2. 使用原生 FFmpeg 命令提取缩略图 (比 fluent-ffmpeg 更直接可靠)
    const thumbnailFileName = `${timestamp}-thumb.jpg`;
    const thumbnailPath = path.join(uploadDir, thumbnailFileName);
    const thumbnailUrl = `/uploads/${thumbnailFileName}`;

    try {
      // -ss 1: 跳过第 1 秒
      // -vframes 1: 取 1 帧
      // -q:v 2: 高质量控制
      const ffmpegCmd = `ffmpeg -i "${videoPath}" -ss 00:00:01 -vframes 1 -q:v 2 "${thumbnailPath}"`;
      console.log(`[FFmpeg] 执行命令: ${ffmpegCmd}`);
      
      await execPromise(ffmpegCmd);
      console.log(`[FFmpeg] 封面提取成功: ${thumbnailUrl}`);
    } catch (ffmpegErr) {
      console.error("[FFmpeg] 封面提取失败:", ffmpegErr);
      // 封面失败不应中断视频上传，可以返回空封面
    }

    return NextResponse.json({ 
      success: true, 
      url: videoUrl,
      thumbnail: thumbnailUrl,
      name: file.name
    });

  } catch (error) {
    console.error("Upload & Processing error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
