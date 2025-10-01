import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CvTemplate } from "./schemas/cv-template.schema";

/**
 * Service for handling CV template business logic
 * Handles database operations for CV templates
 */
@Injectable()
export class CvTemplateService {
  constructor(
    @InjectModel(CvTemplate.name) private cvTemplateModel: Model<CvTemplate>,
  ) {}

  /**
   * Retrieve all CV templates from the database
   * @returns Promise containing array of all CV templates
   */
  async findAll(): Promise<CvTemplate[]> {
    return this.cvTemplateModel.find().exec();
  }

  /**
   * Find a specific CV template by its ID
   * @param id - The ID of the CV template to find
   * @returns Promise containing the found CV template
   * @throws NotFoundException if template is not found
   */
  async findOne(id: string): Promise<CvTemplate> {
    const template = await this.cvTemplateModel.findById(id).exec();
    if (!template) {
      throw new NotFoundException(`CV template with ID ${id} not found`);
    }
    return template;
  }
}
