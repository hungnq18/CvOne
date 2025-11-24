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
import { UpdateBannerDto } from "./dto/update-banner.dto";

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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("mkt")
  @Patch(":id")
  updateBanner(
    @Param("id") id: string,
    @Body() updateBannerDto: UpdateBannerDto
  ) {
    return this.bannerService.updateBanner(id, updateBannerDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("mkt")
  @Delete(":id")
  deleteBanner(@Param("id") id: string) {
    return this.bannerService.deleteBanner(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get("for-user")
  getBannerActive() {
    return this.bannerService.getBannerActive();
  }
}
