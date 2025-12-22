import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ObjectId } from "mongoose";
import { CvTemplate } from "./schemas/cv-template.schema";
import { CvTemplateAiService } from "./cv-template-ai.service";
import { UsersService } from "../users/users.service";

/**
 * Service for handling CV template business logic
 * Handles database operations for CV templates
 */
@Injectable()
export class CvTemplateService {
  constructor(
    @InjectModel(CvTemplate.name) private cvTemplateModel: Model<CvTemplate>,
    private cvTemplateAiService: CvTemplateAiService,
    private readonly userService: UsersService
  ) {}

  async findAll(): Promise<CvTemplate[]> {
    return this.cvTemplateModel.find().exec();
  }

  async findOne(id: string): Promise<CvTemplate> {
    const template = await this.cvTemplateModel.findById(id).exec();
    if (!template) {
      throw new NotFoundException(`CV template with ID ${id} not found`);
    }
    return template;
  }

  async getSuggestTemplateCv(
    jobDescription: string,
    templateId: string
  ): Promise<{ cvTemplates: CvTemplate | null; total_tokens: number }> {
    const templates = await this.cvTemplateModel
      .find({}, { title: 1, tags: 1, _id: 0 })
      .lean()
      .exec();
    const userUseTemplate = await this.cvTemplateModel
      .findById(templateId, { title: 1, tags: 1, _id: 0 })
      .exec();

    const suggestTemplate = await this.cvTemplateAiService.suggestTemplateByAi(
      jobDescription,
      templates,
      userUseTemplate
    );

    const template = await this.cvTemplateModel
      .findOne({ title: suggestTemplate.title })
      .exec();

    return {
      cvTemplates: template,
      total_tokens: suggestTemplate.total_tokens,
    };
  }
}
