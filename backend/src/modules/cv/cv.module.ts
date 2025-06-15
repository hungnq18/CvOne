import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CvTemplate, CvTemplateSchema } from '../cv-template/schemas/cv-template.schema';
import { CvController } from './cv.controller';
import { CvService } from './cv.service';
import { Cv, CvSchema } from './schemas/cv.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cv.name, schema: CvSchema },
      { name: CvTemplate.name, schema: CvTemplateSchema }
    ])
  ],
  controllers: [CvController],
  providers: [CvService],
  exports: [CvService]
})
export class CvModule {} 