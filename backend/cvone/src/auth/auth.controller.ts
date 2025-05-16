import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { GoogleAuthGuard, LocalAuthGuard } from './utils/Guards';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  handleLoginGoogle() {
    return { msg: 'Google Login Authentication' };
  }

  // api/auth/google/redirect
  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  handleRedirectGoogle() {
    return { msg: 'OK' };
  }

  @Get('status')
  user(@Req() request: Request) {
    if (request.user) {
      return { msg: 'Authentication' };
    } else {
      return { msg: 'Not Authentication' };
    }
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async loginLocal(@Req() req: Request) {
    return {
      msg: 'Login successful',
      user: req.user,
    };
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.registerLocalUser(dto);
    return {
      msg: 'User registered successfully',
      user,
    };
  }
}
