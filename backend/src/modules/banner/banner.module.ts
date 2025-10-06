import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Banner, BannerSchema } from "./schemas/banner.schema";
import { BannerController } from "./banner.controller";
import { BannerService } from "./banner.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Banner.name, schema: BannerSchema }]),
  ],
  controllers: [BannerController],
  providers: [BannerService],
  exports: [BannerService],
})
export class BannerModule {}
