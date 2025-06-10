import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Roles } from '../../common/decorators/roles.decorator';
import { comparePassword } from '../../utils/bcrypt.utils';
import { generateJwtToken } from '../../utils/jwt.utils';
import { AccountsService } from '../accounts/accounts.service';
import { CreateAccountDto } from '../accounts/dto/create-account.dto';
import { LoginDto } from '../accounts/dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthService } from './auth.service';
import { RegisterDto, VerifyEmailDto, ResendVerificationDto } from './dto/verify-email.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  @Post('register') //register
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login') //login
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('send-verification')
  async sendVerification(@Body() body: ResendVerificationDto) {
    return this.authService.sendVerificationEmail(body.email);
  }

  @Post('verify')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('resend-verification')
  async resendVerification(@Body() body: ResendVerificationDto) {
    return this.authService.sendVerificationEmail(body.email);
  }

  // Example of a protected route with role-based access
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('admin-only')
  async adminRoute() {
    return { message: 'This is an admin only route' };
  }
}
