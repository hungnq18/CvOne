// form-feedback.service.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  FeedbackFeature,
  FormFeedback,
  FormFeedbackDocument,
} from "./schemas/feedback.schema";
import { CreateFormFeedbackDto } from "./dto/create-feedback.dto";
import { UsersService } from "../users/users.service";
import { CreditsService } from "../credits/credits.service";

@Injectable()
export class FormFeedbackService {
  constructor(
    @InjectModel(FormFeedback.name)
    private feedbackModel: Model<FormFeedbackDocument>,
    private readonly usersService: UsersService,
    private readonly creditService: CreditsService
  ) {}

  async create(createDto: CreateFormFeedbackDto): Promise<FormFeedback> {
    const created = new this.feedbackModel({
      ...createDto,
      submittedAt: createDto.submittedAt || new Date(),
    });

    const emailAnswer = createDto.answers.find(
      (a) => a.title && a.title.toLowerCase() === "email"
    );

    const email = (emailAnswer?.answer as string | null) || null;

    const user = email ? await this.usersService.getUserByEmail(email) : null;
    if (!user) {
      return await created.save();
    }
    await created.save();
    const FEATURE_VOUCHER_MAP: Record<FeedbackFeature, string | null> = {
      [FeedbackFeature.TRANSLATE_CV]: "6912e8e104e0ffee09f8242b",
      [FeedbackFeature.GENERATE_CV]: "692271ec3aa2ef74f38bdc3e",
      [FeedbackFeature.GENERATE_CL]: null, // TODO: thêm voucher id nếu muốn tặng riêng cho generate_cl
      [FeedbackFeature.SUGGEST_JOB]: "692276043aa2ef74f38c838b",
      [FeedbackFeature.AI_INTERVIEW]: "79b3ba37b477064174e2f107",
    };
    const voucherId = FEATURE_VOUCHER_MAP[createDto.feature];
    if (voucherId) {
      await this.creditService.addVoucherForUserFeedback(
        user._id.toString(),
        voucherId
      );
    }
    return created;
  }

  async findAll(): Promise<FormFeedback[]> {
    return this.feedbackModel.find().exec();
  }

  async findByFeature(feature: string): Promise<FormFeedback[]> {
    return this.feedbackModel.find({ feature }).exec();
  }
}
