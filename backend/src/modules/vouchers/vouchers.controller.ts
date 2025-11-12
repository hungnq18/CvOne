import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { Roles } from "src/common/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { VouchersService } from "./vouchers.service";
import { CreateVoucherDirectDto } from "./dto/create-voucher-direct.dto";
import { CreateVoucherSaveableDto } from "./dto/create-voucher-saveable.dto";

@Controller("vouchers")
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) { }

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
    @Body() createVoucherDto: CreateVoucherSaveableDto,
  ) {
    return await this.vouchersService.createVoucherDirect(createVoucherDto);
  }

  @Get("all")
  async getAllVouchers() {
    return await this.vouchersService.getAllVouchers();
  }

  @Get("for-user")
  @UseGuards(JwtAuthGuard)
  async getVouchersForUser() {
    return await this.vouchersService.getVoucherDisplayUsers();
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  async getVoucherById(@Param("id") id: string) {
    return await this.vouchersService.getVoucherById(id);
  }
}
