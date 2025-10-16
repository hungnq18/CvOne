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
    infoUser: any,
    jobDescription: string
  ): Promise<CvTemplate[]> {
    const tags = await this.cvTemplateModel.distinct("tags").exec();
    console.log(tags);

    const suggestTags = await this.cvTemplateAiService.suggestTagsByAi(
      infoUser,
      jobDescription,
      tags
    );
    console.log("suggestTags", suggestTags);

    if (suggestTags && suggestTags.tags.length > 0) {
      const templates = await this.cvTemplateModel
        .find({
          tags: { $in: suggestTags.tags }, // chỉ cần 1 tag match là được
        })
        .lean()
        .exec();

      return templates;
    }

    return this.cvTemplateModel.find().exec();
  }
}
