import {
  Body,
  Controller,
  Get,
  Post,
  BadRequestException,
} from "@nestjs/common";
import { MailService } from "./mail.service";

@Controller("mail")
export class MailController {
  constructor(private readonly mailService: MailService) { }

  @Post("test")
  async testEmail(@Body() body: { email: string }) {
    try {
      await this.mailService.sendVerificationEmail(
        body.email,
        "test-token-123",
      );
      return { message: "Test email sent successfully" };
    } catch (error) {
      return {
        message: "Failed to send test email",
        error: error.message,
      };
    }
  }

  @Get("status")
  async getMailStatus() {
    return {
      message: "Mail service status check",
      configured: !!this.mailService["transporter"],
    };
  }

  @Post("send-cv-pdf")
  async sendCvPdf(
    @Body() body: { email: string; base64Pdf: string; cvTitle: string },
  ) {
    const { email, base64Pdf, cvTitle } = body || {};

    if (!email || !base64Pdf || !cvTitle) {
      throw new BadRequestException(
        "email, base64Pdf, and cvTitle are required",
      );
    }

    // Chuyển Base64 sang Buffer
    const cleanedBase64 = base64Pdf.replace(
      /^data:application\/pdf;base64,/,
      "",
    );
    const pdfBuffer = Buffer.from(cleanedBase64, "base64");

    // Gọi service gửi email kèm file PDF
    await this.mailService.sendCvPdfEmail(email, pdfBuffer, cvTitle);

    return { message: "CV PDF email sent successfully" };
  }
}
