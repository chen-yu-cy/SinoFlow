// FILE: src/test/email.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EmailService } from "@/lib/services/email.service";
import { logger } from "@/lib/logger";

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("EmailService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sendSupportEmail 应该成功输出模拟发送邮件的日志信息并返回 success", async () => {
    const result = await EmailService.sendSupportEmail(
      "测试标题",
      "测试内容主体很长很长很长",
      "student@test.com"
    );

    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "support@sinoflow.com",
        from: "student@test.com",
        subject: "[SinoFlow工单通知] 测试标题",
        contentSnippet: "测试内容主体很长很长很长",
      }),
      expect.stringContaining("已成功“投递”邮件到官方邮箱")
    );
  });
});
