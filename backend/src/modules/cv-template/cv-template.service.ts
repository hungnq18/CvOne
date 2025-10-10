import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ObjectId } from "mongoose";
import { CvTemplate } from "./schemas/cv-template.schema";
import { CvTemplateAiService } from "./cv-template-ai.service";
import { CategoryCvService } from "../category-cv/category-cv.service";
import { ConfigService } from "@nestjs/config";

/**
 * Service for handling CV template business logic
 * Handles database operations for CV templates
 */
@Injectable()
export class CvTemplateService {
  constructor(
    @InjectModel(CvTemplate.name) private cvTemplateModel: Model<CvTemplate>,

    private cvTemplateAiService: CvTemplateAiService,
    private readonly categoryCvService: CategoryCvService
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
  async getTags(): Promise<any> {
    const tags = await this.cvTemplateModel.distinct("tags").exec();
    return tags;
  }

  async getCategories(): Promise<any> {
    const categories = await this.cvTemplateModel
      .find()
      .populate("categoryId", "name")
      .select("categoryId")
      .lean()
      .exec();

    const result = categories.map((c) => (c.categoryId as any).name);
    return result;
  }

  async getSuggestTemplateCv(message: string): Promise<CvTemplate[]> {
    const suggestCategory = await this.cvTemplateAiService.suggestCategoryByAi(
      message,
      await this.getCategories()
    );
    console.log("suggestCategory", suggestCategory);

    const suggestTags = await this.cvTemplateAiService.suggestTagsByAi(
      message,
      await this.getTags()
    );
    console.log("suggestTags", suggestTags);

    if (suggestCategory && suggestTags && suggestTags.length > 0) {
      // 1. Tìm category theo name
      const category = await this.categoryCvService.findByName(suggestCategory);

      if (!category) return [];

      // 2. Query template theo category._id + tags
      const templates = await this.cvTemplateModel
        .find({
          categoryId: category._id,
          tags: { $in: suggestTags }, // chỉ cần 1 tag match là được
        })
        .populate("categoryId", "name")
        .lean()
        .exec();

      return templates;
    }

    return this.cvTemplateModel.find().exec();
  }
}
