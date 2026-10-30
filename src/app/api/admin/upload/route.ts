// FILE: src/app/api/admin/upload/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { logger } from "@/lib/logger";

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
      logger.info({ ffmpegCmd }, "[FFmpeg] 执行命令");
      
      await execPromise(ffmpegCmd);
      logger.info({ thumbnailUrl }, "[FFmpeg] 封面提取成功");
    } catch (ffmpegErr) {
      logger.error({ err: ffmpegErr, videoPath }, "[FFmpeg] 封面提取失败");
      // 封面失败不应中断视频上传，可以返回空封面
    }

    // 3. 使用 ffprobe 获取视频时长(秒)
    let videoDuration: number | null = null;
    try {
      const ffprobeCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`;
      logger.info({ ffprobeCmd }, "[ffprobe] 执行获取时长命令");
      const { stdout } = await execPromise(ffprobeCmd);
      const parsedDuration = parseFloat(stdout.trim());
      if (!isNaN(parsedDuration)) {
        videoDuration = Math.round(parsedDuration);
        logger.info({ videoDuration }, "[ffprobe] 获取时长成功");
      }
    } catch (ffprobeErr) {
      logger.error({ err: ffprobeErr, videoPath }, "[ffprobe] 获取时长失败");
    }

    return NextResponse.json({ 
      success: true, 
      url: videoUrl,
      thumbnail: thumbnailUrl,
      duration: videoDuration,
      name: file.name
    });

  } catch (error) {
    logger.error({ err: error }, "Upload & Processing error");
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
