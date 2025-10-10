import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { CvPdfCloudService } from "../cv/cv-pdf-cloud.service";
import { UploadController } from "./upload.controller";
import { UploadService } from "./upload.service";

@Module({
  imports: [
    MulterModule.register({
      dest: "./uploads",
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService, CvPdfCloudService],
})
export class UploadModule {}
