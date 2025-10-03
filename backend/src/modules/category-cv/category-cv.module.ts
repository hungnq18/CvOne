import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CategoryCV, CategoryCVSchema } from "./schemas/category-cv.schema";
import { CategoryCvService } from "./category-cv.service";
import { CategoryCvController } from "./category-cv.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CategoryCV.name, schema: CategoryCVSchema },
    ]),
  ],
  controllers: [CategoryCvController],
  providers: [CategoryCvService],
  exports: [CategoryCvService],
})
export class CategoryCvModule {}
