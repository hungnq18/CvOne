import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { File as MulterFile } from "multer";
import * as pdf from "pdf-parse";
import { Roles } from "src/common/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { JobAnalysisService } from "../cv/services/job-analysis.service";
import { CreditsService } from "./credits.service";

@Controller("credits")
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) { }

  @Patch("update-token")
  @UseGuards(JwtAuthGuard)
  async updateToken(@Request() req, @Body("token") token: number) {
    const userId = req.user.user._id;
    return await this.creditsService.updateToken(userId, token);
  }

  @Patch("save-voucher/:voucherId")
  @UseGuards(JwtAuthGuard)
  async saveVoucher(@Request() req, @Param("voucherId") voucherId: string) {
    const userId = req.user.user._id;
    return await this.creditsService.saveVoucher(userId, voucherId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getCredit(@Request() req) {
    const userId = req.user.user._id;
    return await this.creditsService.getCredit(userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createCredit(@Request() req) {
    const userId = req.user.user._id;
    return await this.creditsService.createCredit(userId);
  }
}
