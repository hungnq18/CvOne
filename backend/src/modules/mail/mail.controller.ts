import { Body, Controller, Get, Post } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('test')
  async testEmail(@Body() body: { email: string }) {
    try {
      await this.mailService.sendVerificationEmail(body.email, 'test-token-123');
      return { message: 'Test email sent successfully' };
    } catch (error) {
      return { 
        message: 'Failed to send test email', 
        error: error.message 
      };
    }
  }

  @Get('status')
  async getMailStatus() {
    return { 
      message: 'Mail service status check',
      configured: !!this.mailService['transporter']
    };
  }
}
