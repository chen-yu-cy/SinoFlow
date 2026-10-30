// FILE: src/lib/services/email.service.ts
import { logger } from "@/lib/logger";

/**
 * 邮件发送服务 (Email Service)
 * 职责：负责向官方及用户发送工单通知邮件。
 */
export const EmailService = {
  /**
   * 向官方服务邮箱发送工单通知
   * @param ticketTitle 工单标题
   * @param ticketContent 工单内容
   * @param senderEmail 提交工单的用户邮箱
   */
  async sendSupportEmail(ticketTitle: string, ticketContent: string, senderEmail: string) {
    const officialSupportEmail = process.env.SUPPORT_EMAIL || "support@sinoflow.com";

    // 打印带有古典水墨框线的 Mock 邮件日志
    logger.info(
      {
        to: officialSupportEmail,
        from: senderEmail,
        subject: `[SinoFlow工单通知] ${ticketTitle}`,
        contentSnippet: ticketContent.length > 50 ? `${ticketContent.slice(0, 50)}...` : ticketContent,
      },
      `📬 [Mock Email Service] 已成功“投递”邮件到官方邮箱: ${officialSupportEmail}`
    );

    // 模拟邮件服务发送过程的微小延迟
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    return {
      success: true,
      messageId: `mock-msg-${Date.now()}`,
    };
  }
};
