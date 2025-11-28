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
    userId: string
  ): Promise<ClTemplate[]> {
    const tags = await this.clTemplateModel.distinct("tags").exec();
    console.log(tags);

    const suggestTags = await this.cvTemplateAiService.suggestTagsByAi(
      jobDescription,
      tags,
      userId
    );
    console.log("suggestTags", suggestTags);

    if (suggestTags && suggestTags.tags.length > 0) {
      const templates = await this.clTemplateModel
        .find({
          tags: { $in: suggestTags.tags }, // chỉ cần 1 tag match là được
        })
        .lean()
        .exec();

      return templates;
    }

    return this.clTemplateModel.find().exec();
  }
}
