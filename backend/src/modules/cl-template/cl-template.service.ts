import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ClTemplate } from "./schemas/cl-template.schema";
import { CreateClTemplateDto } from "./dto/create-cl-template.dto";
import { CvTemplateAiService } from "../cv-template/cv-template-ai.service";

@Injectable()
export class ClTemplateService {
  constructor(
    @InjectModel(ClTemplate.name) private clTemplateModel: Model<ClTemplate>,
    private readonly cvTemplateAiService: CvTemplateAiService
  ) {}

  async create(dto: CreateClTemplateDto): Promise<ClTemplate> {
    return this.clTemplateModel.create(dto);
  }

  async findAll(): Promise<ClTemplate[]> {
    return this.clTemplateModel.find().sort({ createdAt: -1 });
  }

  async findOne(id: string): Promise<ClTemplate> {
    const template = await this.clTemplateModel.findById(id);
    if (!template) throw new NotFoundException("Template not found");
    return template;
  }

  async remove(id: string): Promise<void> {
    const result = await this.clTemplateModel.deleteOne({ id });
    if (result.deletedCount === 0) {
      throw new NotFoundException("Template not found");
    }
  }

  async getSuggestTemplateCl(
    jobDescription: string,
    templateId: string
  ): Promise<{ clTemplates: ClTemplate | null; total_tokens: number }> {
    const tags = await this.clTemplateModel.distinct("tags").exec();
    const templates = await this.clTemplateModel
      .find({}, { title: 1, tags: 1, _id: 0 })
      .lean()
      .exec();
    const userUseTemplate = await this.clTemplateModel
      .findById(templateId, { title: 1, tags: 1, _id: 0 })
      .exec();
    const suggestTemplate = await this.cvTemplateAiService.suggestTemplateByAi(
      jobDescription,
      templates,
      userUseTemplate
    );

    const template = await this.clTemplateModel
      .findOne({ title: suggestTemplate.title })
      .exec();

    return {
      clTemplates: template,
      total_tokens: suggestTemplate.total_tokens,
    };
  }
}
