import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post('verify-email')
  async requestEmailVerification(@Body() dto: VerifyEmailDto) {
    return this.accountsService.requestEmailVerification(dto);
  }

  @Get('verify-email/:token')
  async verifyEmail(@Param('token') token: string) {
    return this.accountsService.verifyEmail(token);
  }
} 