// FILE: src/app/api/courses/[id]/resources/[resourceId]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db/client";
import { OrderStatus } from "@prisma/client";
import path from "path";
import fs from "fs";

/**
 * @openapi
 * /api/courses/{id}/resources/{resourceId}:
 *   get:
 *     summary: Download course companion learning resources
 *     description: Validates user session and purchase status before allowing resource download.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *       - name: resourceId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: File stream of the companion resource
 *       401:
 *         description: Unauthorized - User not logged in
 *       403:
 *         description: Forbidden - User has not purchased this course
 *       404:
 *         description: Resource or physical file not found
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; resourceId: string }> }
) {
  try {
    const { id: courseId, resourceId } = await params;
    const session = await auth();

    // 1. 验证用户登录状态
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: "课程不存在" }, { status: 404 });
    }

    // 2. 鉴权：只有管理员、免费课程或已购课程的用户才可下载
    let hasAccess = course.isFree;
    if (!hasAccess) {
      const userId = session.user.id;
      const userRole = (session.user as any).role;

      if (userRole === "ADMIN") {
        hasAccess = true;
      } else {
        const order = await prisma.order.findFirst({
          where: {
            userId,
            courseId,
            status: OrderStatus.SUCCESS,
          },
        });
        hasAccess = !!order;
      }
    }

    if (!hasAccess) {
      return NextResponse.json({ error: "您没有访问该课程资料的权限，请先购买课程" }, { status: 403 });
    }

    // 3. 查询资源记录
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource || resource.courseId !== courseId) {
      return NextResponse.json({ error: "找不到指定的学习资料" }, { status: 404 });
    }

    // 4. 解析本地物理路径并回传文件流
    if (resource.fileUrl.startsWith("/")) {
      const filePath = path.join(process.cwd(), "public", resource.fileUrl);

      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: "文件不存在或已被删除" }, { status: 404 });
      }

      const fileBuffer = fs.readFileSync(filePath);
      const ext = path.extname(filePath).toLowerCase();

      // 动态确定 Content-Type
      let contentType = "application/octet-stream";
      if (ext === ".pdf") {
        contentType = "application/pdf";
      } else if (ext === ".zip") {
        contentType = "application/zip";
      } else if (ext === ".mp3") {
        contentType = "audio/mpeg";
      }

      const encodedFilename = encodeURIComponent(resource.title);

      return new Response(fileBuffer, {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename*=UTF-8''${encodedFilename}`,
        },
      });
    }

    return NextResponse.json({ error: "不支持的外部资源协议" }, { status: 400 });
  } catch (error: any) {
    console.error("下载学习资料失败:", error);
    return NextResponse.json({ error: "下载失败，服务器内部错误" }, { status: 500 });
  }
}
