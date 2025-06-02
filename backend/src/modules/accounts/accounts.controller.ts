import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post('verify-email')
  async requestEmailVerification(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.accountsService.requestEmailVerification(verifyEmailDto);
  }

  @Get('verify-email/:token')
  async verifyEmail(@Param('token') token: string) {
    return this.accountsService.verifyEmail(token);
  }

  @Post('register')
  async register(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.register(createAccountDto);
  }
} 