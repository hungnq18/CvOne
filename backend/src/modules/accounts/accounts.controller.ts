import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post('register')
  async register(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.register(createAccountDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('register-by-admin')
  async registerByAdmin(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.registerByAdmin(createAccountDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id/role')
  async updateRole(@Param('id') id: string, @Body('role') role: string) {
    return this.accountsService.updateRole(id, role);
  }

  @Post('verify-email/request')
  async requestEmailVerification(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.accountsService.requestEmailVerification(verifyEmailDto);
  }

  @Get('verify-email/:token')
  async verifyEmail(@Param('token') token: string) {
    return this.accountsService.verifyEmail(token);
  }

  @Post('resend-verification')
  async resendVerification(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.accountsService.requestEmailVerification(verifyEmailDto);
  }
}