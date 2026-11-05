// FILE: src/test/video-telemetry.route.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, OPTIONS } from "@/app/api/telemetry/video/route";
import { logger } from "@/lib/logger";

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("Video Telemetry API Route (/api/telemetry/video)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("当请求体不是合法 JSON 时应返回 400", async () => {
    const req = new Request("http://localhost:3000/api/telemetry/video", {
      method: "POST",
      body: "invalid-json",
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toContain("Invalid JSON");
  });

  it("当 bytesLoaded 为负数或非法时应返回 400", async () => {
    const req = new Request("http://localhost:3000/api/telemetry/video", {
      method: "POST",
      body: JSON.stringify({ bytesLoaded: -100, fragmentsCount: 1 }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toContain("bytesLoaded");
  });

  it("当 fragmentsCount 为负数或非法时应返回 400", async () => {
    const req = new Request("http://localhost:3000/api/telemetry/video", {
      method: "POST",
      body: JSON.stringify({ bytesLoaded: 5000, fragmentsCount: -2 }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toContain("fragmentsCount");
  });

  it("当上报外部 CDN 视频流切片时应输出带有 delivery: cdn 的日志并返回 200", async () => {
    const req = new Request("http://localhost:3000/api/telemetry/video", {
      method: "POST",
      body: JSON.stringify({
        courseId: "hsk1",
        lessonId: "lesson-1",
        bytesLoaded: 1540000,
        fragmentsCount: 3,
        durationSeconds: 30,
        sourceUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "video_telemetry",
        courseId: "hsk1",
        lessonId: "lesson-1",
        bytesLoaded: 1540000,
        fragmentsCount: 3,
        delivery: "cdn",
      }),
      expect.any(String)
    );
  });

  it("当上报本地流媒体时应正确标记 delivery: local", async () => {
    const req = new Request("http://localhost:3000/api/telemetry/video", {
      method: "POST",
      body: JSON.stringify({
        courseId: "hsk1",
        bytesLoaded: 950000,
        fragmentsCount: 3,
        sourceUrl: "/uploads/videos/demo/index.m3u8",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        delivery: "local",
      }),
      expect.any(String)
    );
  });

  it("OPTIONS 请求应返回 204 及预检响应头", async () => {
    const res = await OPTIONS();
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("POST");
  });
});
