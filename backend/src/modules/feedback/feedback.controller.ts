// form-feedback.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { FormFeedbackService } from "./feedback.service";
import { CreateFormFeedbackDto } from "./dto/create-feedback.dto";
import { FormFeedback } from "./schemas/feedback.schema";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("feedback")
export class FormFeedbackController {
  constructor(private readonly feedbackService: FormFeedbackService) {}

  // Endpoint từ web hoặc Apps Script
  @Post("google-form")
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  async findByFeature(
    @Param("feature") feature: string,
  ): Promise<FormFeedback[]> {
    return this.feedbackService.findByFeature(feature);
  }
}
