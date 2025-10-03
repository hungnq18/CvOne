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

  @Post("share-cv")
  async shareCv(@Body() body: { email: string; shareUrl: string }) {
    const { email, shareUrl } = body || ({} as any);
    if (!email || !shareUrl) {
      throw new BadRequestException("email and shareUrl are required");
    }
    await this.mailService.sendCvShareEmail(email, shareUrl);
    return { message: "CV share email sent successfully" };
  }
}
