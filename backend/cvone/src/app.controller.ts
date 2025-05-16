import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthenticationGuard } from './auth/utils/Guards';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(AuthenticationGuard)
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
