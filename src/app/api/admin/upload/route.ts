import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import ffmpeg from "fluent-ffmpeg";

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
    
    // 确保目录存在
    await mkdir(uploadDir, { recursive: true });

    const videoPath = path.join(uploadDir, videoFileName);
    await writeFile(videoPath, buffer);
    const videoUrl = `/uploads/${videoFileName}`;

    // 2. 使用 FFmpeg 提取缩略图
    const thumbnailFileName = `${timestamp}-thumb.jpg`;
    const thumbnailPath = path.join(uploadDir, thumbnailFileName);
    const thumbnailUrl = `/uploads/${thumbnailFileName}`;

    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          count: 1,
          timemarks: ['1'], // 截取第 1 秒
          filename: thumbnailFileName,
          folder: uploadDir,
          size: '640x?' // 自动保持比例，宽度 640px
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`视频已处理: ${videoUrl}, 封面已提取: ${thumbnailUrl}`);

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
