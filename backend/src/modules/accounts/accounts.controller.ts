import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AccountsService } from "./accounts.service";
import { CreateAccountDto } from "./dto/create-account.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { RequestResetCodeDto } from "./dto/request-reset-code.dto";
import { VerifyResetCodeDto } from "./dto/verify-reset-code.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CreateAccountHRDto } from "./dto/create-account-hr.dto";

@Controller("accounts")
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) { }

  @Post("register")
  async register(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.register(createAccountDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @Post("register-by-admin")
  async registerByAdmin(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.registerByAdmin(createAccountDto);
  }

  @Post("register-hr")
  async registerHR(@Body() dto: CreateAccountHRDto) {
    return this.accountsService.registerHR(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @Put(":id/role")
  async updateRole(@Param("id") id: string, @Body("role") role: string) {
    return this.accountsService.updateRole(id, role);
  }

  @Post("verify-email/request")
  async requestEmailVerification(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.accountsService.requestEmailVerification(verifyEmailDto);
  }

  @Get("verify-email/:token")
  async verifyEmail(@Param("token") token: string) {
    return this.accountsService.verifyEmail(token);
  }
  @Post("resend-verification")
  async resendVerification(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.accountsService.requestEmailVerification(verifyEmailDto);
  }

  @Throttle({ default: { limit: 3, ttl: 15 * 60 * 1000 } })
  @Post("forgot-password-code")
  async forgotPasswordCode(@Body() dto: RequestResetCodeDto) {
    return this.accountsService.requestPasswordResetCode(dto);
  }

  @Post("reset-password-code")
  async resetPasswordCode(@Body() dto: VerifyResetCodeDto) {
    return this.accountsService.resetPasswordWithCode(dto);
  }
}
