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
    @Body() body: { email: string; pdfBuffer: string; cvTitle: string },
  ) {
    const { email, pdfBuffer, cvTitle } = body || ({} as any);
    if (!email || !pdfBuffer || !cvTitle) {
      throw new BadRequestException(
        "email, pdfBuffer, and cvTitle are required",
      );
    }

    // Convert base64 string back to Buffer
    const buffer = Buffer.from(pdfBuffer, "base64");
    await this.mailService.sendCvPdfEmail(email, buffer, cvTitle);
    return { message: "CV PDF email sent successfully" };
  }
}
