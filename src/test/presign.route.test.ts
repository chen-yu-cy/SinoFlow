// FILE: src/test/presign.route.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/admin/upload/presign/route";
import { auth } from "@/lib/auth";
import { StorageService } from "@/lib/services/storage.service";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/services/storage.service", () => ({
  StorageService: {
    createPresignedUploadUrl: vi.fn(),
  },
}));

describe("POST /api/admin/upload/presign (预签名直传接口)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("当未登录或非管理员时，应返回 401 Unauthorized", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any);

    const req = new Request("http://localhost/api/admin/upload/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: "lesson.mp4", contentType: "video/mp4" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("当普通学员角色访问时，应返回 401 Unauthorized", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "u-1", role: "USER" },
    } as any);

    const req = new Request("http://localhost/api/admin/upload/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: "lesson.mp4", contentType: "video/mp4" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("当缺少参数时，应返回 400 Bad Request", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "admin-1", role: "ADMIN" },
    } as any);

    const req = new Request("http://localhost/api/admin/upload/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: "" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("缺少有效的文件名参数");
  });

  it("当上传不被支持的视频格式或超限时，应返回 400 Bad Request 且不生成预签名地址", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "admin-1", role: "ADMIN" },
    } as any);

    const req = new Request("http://localhost/api/admin/upload/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: "video.avi",
        contentType: "video/x-msvideo",
        folder: "videos",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain("格式不支持");
    expect(StorageService.createPresignedUploadUrl).not.toHaveBeenCalled();
  });

  it("当请求合法时，应调用 StorageService 并成功返回 200 及预签名地址", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "admin-1", role: "ADMIN" },
    } as any);

    vi.mocked(StorageService.createPresignedUploadUrl).mockResolvedValueOnce({
      uploadUrl: "https://minio.local/upload/url",
      key: "uploads/videos/test.mp4",
      publicUrl: "http://localhost:9000/sinoflow/uploads/videos/test.mp4",
    });

    const req = new Request("http://localhost/api/admin/upload/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: "test.mp4",
        contentType: "video/mp4",
        folder: "videos",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.uploadUrl).toBe("https://minio.local/upload/url");
    expect(json.data.key).toBe("uploads/videos/test.mp4");
  });
});
