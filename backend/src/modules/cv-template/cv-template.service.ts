import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CvTemplate, CvTemplateDocument } from './schemas/cv-template.schema'; // Adjust the import path as necessary

@Injectable()
export class CvTemplateService {
    constructor(
        @InjectModel(CvTemplate.name) private CvTemplateModel: Model<CvTemplateDocument>, // Replace 'any' with the actual model type
    ) {}
    async findAllCvTemplates(): Promise<CvTemplate[]> {
        return this.CvTemplateModel.find().exec();
    }
}
