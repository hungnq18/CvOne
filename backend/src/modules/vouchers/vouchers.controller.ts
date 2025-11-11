import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { VouchersService } from "./vouchers.service";
import { CreateVoucherDirectDto } from "./dto/create-voucher-direct.dto";
import { CreateVoucherSaveableDto } from "./dto/create-voucher-saveable.dto";

@Controller("vouchers")
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Post("direct")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("mkt")
  async createVoucherDirect(@Body() createVoucherDto: CreateVoucherDirectDto) {
    return await this.vouchersService.createVoucherDirect(createVoucherDto);
  }

  @Post("saveable")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("mkt")
  async createVoucherSaveable(
    @Body() createVoucherDto: CreateVoucherSaveableDto
  ) {
    return await this.vouchersService.createVoucherDirect(createVoucherDto);
  }
}
