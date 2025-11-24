// form-feedback.service.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { FormFeedback, FormFeedbackDocument } from "./schemas/feedback.schema";
import { CreateFormFeedbackDto } from "./dto/create-feedback.dto";

@Injectable()
export class FormFeedbackService {
  constructor(
    @InjectModel(FormFeedback.name)
    private feedbackModel: Model<FormFeedbackDocument>,
  ) {}

  async create(createDto: CreateFormFeedbackDto): Promise<FormFeedback> {
    const created = new this.feedbackModel({
      ...createDto,
      submittedAt: createDto.submittedAt || new Date(),
    });
    return created.save();
  }

  async findAll(): Promise<FormFeedback[]> {
    return this.feedbackModel.find().exec();
  }

  async findByFeature(feature: string): Promise<FormFeedback[]> {
    return this.feedbackModel.find({ feature }).exec();
  }
}
