import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Banner } from "./schemas/banner.schema";
import { CreateBannerDto } from "./dto/create-banner.dto";
import { UpdateBannerDto } from "./dto/update-banner.dto";

@Injectable()
export class BannerService {
  constructor(@InjectModel(Banner.name) private bannerModel: Model<Banner>) {}

  async getAllBanners() {
    const banner = await this.bannerModel.find();
    if (!banner) {
      throw new NotFoundException("Banner not found");
    }
    return banner;
  }

  async getBannerActive() {
    const dateNow = new Date();
    const banner = await this.bannerModel.find({
      isActive: true,
      endDate: { $gte: dateNow },
      startDate: { $lte: dateNow },
    });
    if (!banner) {
      throw new NotFoundException("Banner not found");
    }
    return banner;
  }

  async createBanner(banner: CreateBannerDto) {
    const startDate = new Date(banner.startDate);
    const endDate = new Date(banner.endDate);

    const newBanner = new this.bannerModel({
      ...banner,
      startDate,
      endDate,
    });

    return newBanner.save();
  }

  async updateBanner(id: string, updateBannerDto: UpdateBannerDto) {
    const banner = await this.bannerModel.findById(id);
    if (!banner) {
      throw new NotFoundException("Banner not found");
    }

    if (updateBannerDto.startDate) {
      banner.startDate = new Date(updateBannerDto.startDate);
    }
    if (updateBannerDto.endDate) {
      banner.endDate = new Date(updateBannerDto.endDate);
    }

    Object.assign(banner, {
      ...updateBannerDto,
      // đảm bảo không ghi đè startDate/endDate vừa convert ở trên nếu đã set
      ...(updateBannerDto.startDate && { startDate: banner.startDate }),
      ...(updateBannerDto.endDate && { endDate: banner.endDate }),
    });

    return banner.save();
  }

  async deleteBanner(id: string) {
    const result = await this.bannerModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException("Banner not found");
    }
    return { message: "Banner deleted successfully" };
  }
}
