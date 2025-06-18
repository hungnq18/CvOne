import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CoverLetter } from "./schemas/cover-letter.schema";
import { CreateCoverLetterDto } from "./dto/create-cover-letter.dto";
import { UpdateCoverLetterDto } from "./dto/update-cover-letter.dto";

@Injectable()
export class CoverLetterService {
  constructor(
    @InjectModel(CoverLetter.name)
    private coverLetterModel: Model<CoverLetter>
  ) {}

  async create(dto: CreateCoverLetterDto): Promise<CoverLetter> {
    return this.coverLetterModel.create(dto);
  }

  async findAllByUser(userId: string): Promise<CoverLetter[]> {
    return this.coverLetterModel.find({ userId }).sort({ createdAt: -1 });
  }

  async findOne(id: string): Promise<CoverLetter> {
    const doc = await this.coverLetterModel.findById(id);
    if (!doc) throw new NotFoundException("Cover Letter not found");
    return doc;
  }

  async update(id: string, dto: UpdateCoverLetterDto): Promise<CoverLetter> {
    const updated = await this.coverLetterModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!updated) throw new NotFoundException("Cover Letter not found");
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.coverLetterModel.deleteOne({ _id: id });
    if (result.deletedCount === 0)
      throw new NotFoundException("Cover Letter not found");
  }
}
