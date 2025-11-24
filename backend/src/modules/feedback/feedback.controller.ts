// form-feedback.controller.ts
import { Controller, Post, Body, Get, Param } from "@nestjs/common";
import { FormFeedbackService } from "./feedback.service";
import { CreateFormFeedbackDto } from "./dto/create-feedback.dto";
import { FormFeedback } from "./schemas/feedback.schema";

@Controller("feedback")
export class FormFeedbackController {
  constructor(private readonly feedbackService: FormFeedbackService) {}

  // Endpoint từ web hoặc Apps Script
  @Post("google-form")
  async createFromGoogleForm(
    @Body() createDto: CreateFormFeedbackDto,
  ): Promise<FormFeedback> {
    return this.feedbackService.create(createDto);
  }

  @Get()
  async findAll(): Promise<FormFeedback[]> {
    return this.feedbackService.findAll();
  }

  @Get("feature/:feature")
  async findByFeature(
    @Param("feature") feature: string,
  ): Promise<FormFeedback[]> {
    return this.feedbackService.findByFeature(feature);
  }
}
