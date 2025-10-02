import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CategoryCV } from "./schemas/category-cv.schema";
import { CreateCategoryCvDto } from "./dto/create-category-cv.dto";
import { UpdateCategoryCvDto } from "./dto/update-category-cv.dto";

@Injectable()
export class CategoryCvService {
  constructor(
    @InjectModel(CategoryCV.name)
    private categoryCvModel: Model<CategoryCV>
  ) {}

  async create(dto: CreateCategoryCvDto): Promise<CategoryCV> {
    const created = new this.categoryCvModel(dto);
    return created.save();
  }

  async findAll(): Promise<CategoryCV[]> {
    return this.categoryCvModel.find().exec();
  }

  async findOne(id: string): Promise<CategoryCV> {
    const category = await this.categoryCvModel.findById(id).exec();
    if (!category) throw new NotFoundException("Category not found");
    return category;
  }

  async update(id: string, dto: UpdateCategoryCvDto): Promise<CategoryCV> {
    const updated = await this.categoryCvModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException("Category not found");
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.categoryCvModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException("Category not found");
  }

  async findByName(name: string): Promise<CategoryCV> {
    const category = await this.categoryCvModel.findOne({ name }).exec();
    if (!category) throw new NotFoundException("Category not found");
    return category;
  }
}
