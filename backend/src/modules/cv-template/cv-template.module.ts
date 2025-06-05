import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CvTemplateController } from './cv-template.controller';
import { CvTemplateService } from './cv-template.service';
import { CvTemplate, CvTemplateSchema } from './schemas/cv-template.schema';
@Module({
  imports: [MongooseModule.forFeature([{ name: CvTemplate.name, schema: CvTemplateSchema }])],
  providers: [CvTemplateService],
  controllers: [CvTemplateController]
})
export class CvTemplateModule {}
