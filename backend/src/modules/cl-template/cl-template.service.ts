import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ClTemplate } from "./schemas/cl-template.schema";
import { CreateClTemplateDto } from "./dto/create-cl-template.dto";

@Injectable()
export class ClTemplateService {
  constructor(
    @InjectModel(ClTemplate.name) private clTemplateModel: Model<ClTemplate>
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
}
