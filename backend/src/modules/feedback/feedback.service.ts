// form-feedback.service.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { FormFeedback, FormFeedbackDocument } from "./schemas/feedback.schema";
import { CreateFormFeedbackDto } from "./dto/create-feedback.dto";
import { UsersService } from "../users/users.service";
import { VouchersService } from "../vouchers/vouchers.service";
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

    const emailAnswer = createDto.answers.find((a) => a.title === "Email");

    const email = emailAnswer?.answer || null;
    console.log("Added voucher for user feedback:", email);

    const user = await this.usersService.getUserByEmail(email);
    console.log("Added user:", user);
    if (!user) {
      return await created.save();
    }
    await created.save();
    await this.creditService.addVoucherForUserFeedback(user._id.toString());
    return created;
  }

  async findAll(): Promise<FormFeedback[]> {
    return this.feedbackModel.find().exec();
  }

  async findByFeature(feature: string): Promise<FormFeedback[]> {
    return this.feedbackModel.find({ feature }).exec();
  }
}
