import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CoverLetter } from "./schemas/cover-letter.schema";
import { CreateCoverLetterDto } from "./dto/create-cover-letter.dto";
import { UpdateCoverLetterDto } from "./dto/update-cover-letter.dto";
import { OpenAiService } from "../cv/openai.service";

@Injectable()
export class CoverLetterService {
  constructor(
    @InjectModel(CoverLetter.name)
    private coverLetterModel: Model<CoverLetter>,
    private openAiService: OpenAiService,
  ) { }

  async create(dto: CreateCoverLetterDto, userId: string): Promise<any> {
    const payload = {
      ...dto,
      templateId: new Types.ObjectId(dto.templateId),
      userId: new Types.ObjectId(userId),
    };
    await this.coverLetterModel.create(payload);
    return { message: "Create cover letter successfully" };
  }

  async findAll(userId: string): Promise<CoverLetter[]> {
    return this.coverLetterModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate("templateId")
      .exec();
  }

  async findOne(id: string): Promise<CoverLetter> {
    const cl = await this.coverLetterModel.findOne({
      _id: id,
    });
    if (!cl) {
      throw new NotFoundException("Cover letter not found");
    }
    return cl;
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
