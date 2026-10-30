// FILE: src/app/uploads/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.path;
    if (!slug || slug.length === 0) {
      return new NextResponse('Bad Request', { status: 400 });
    }

    const fileRelativePath = path.join('public/uploads', ...slug);
    const filePath = path.join(process.cwd(), fileRelativePath);

    // 安全检查：防范路径穿越攻击 (Path Traversal)
    const resolvedPath = path.resolve(filePath);
    const uploadsDir = path.resolve(path.join(process.cwd(), 'public/uploads'));
    if (!resolvedPath.startsWith(uploadsDir)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    if (!fs.existsSync(resolvedPath)) {
      return new NextResponse('Not Found', { status: 404 });
    }

    const stat = fs.statSync(resolvedPath);
    if (!stat.isFile()) {
      return new NextResponse('Not Found', { status: 404 });
    }

    const fileSize = stat.size;
    const lastSegment = slug[slug.length - 1];
    const ext = path.extname(lastSegment).toLowerCase();

    // 映射合适的文件内容 Content-Type
    let contentType = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === '.png') {
      contentType = 'image/png';
    } else if (ext === '.webp') {
      contentType = 'image/webp';
    } else if (ext === '.gif') {
      contentType = 'image/gif';
    } else if (ext === '.svg') {
      contentType = 'image/svg+xml';
    } else if (ext === '.mp4') {
      contentType = 'video/mp4';
    } else if (ext === '.m3u8') {
      contentType = 'application/vnd.apple.mpegurl';
    } else if (ext === '.ts') {
      contentType = 'video/MP2T';
    }

    const range = req.headers.get('range');

    if (range && ext === '.mp4') {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      // 验证范围有效性
      if (start >= fileSize || end >= fileSize) {
        return new NextResponse('Requested Range Not Satisfiable', {
          status: 416,
          headers: {
            'Content-Range': `bytes */${fileSize}`,
          },
        });
      }

      const chunksize = (end - start) + 1;
      const fileStream = fs.createReadStream(resolvedPath, { start, end });

      return new NextResponse(fileStream as any, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize.toString(),
          'Content-Type': contentType,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    } else {
      const fileStream = fs.createReadStream(resolvedPath);
      return new NextResponse(fileStream as any, {
        headers: {
          'Content-Length': fileSize.toString(),
          'Content-Type': contentType,
          // 为缩略图等静态资源设置较长缓存时间以优化前端 LCP 性能
          'Cache-Control': ext === '.mp4' 
            ? 'no-cache, no-store, must-revalidate'
            : 'public, max-age=31536000, immutable',
        },
      });
    }
  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
