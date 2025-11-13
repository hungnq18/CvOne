import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { BannerService } from "./banner.service";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { CreateBannerDto } from "./dto/create-banner.dto";

@Controller("banner")
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("mkt")
  getAllBanners() {
    return this.bannerService.getAllBanners();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("mkt")
  createBanner(@Body() banner: CreateBannerDto) {
    return this.bannerService.createBanner(banner);
  }
}
