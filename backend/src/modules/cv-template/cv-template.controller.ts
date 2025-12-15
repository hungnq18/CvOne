import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { Public } from "../auth/decorators/public.decorator";
import { CvTemplateService } from "./cv-template.service";
import { CvTemplateAiService } from "./cv-template-ai.service";
import { RolesGuard } from "../auth/guards/roles.guard";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { User } from "src/common/decorators/user.decorator";
import { UseAiFeature } from "src/common/decorators/ai-feature.decorator";
import { AiFeature } from "../ai-usage-log/schemas/ai-usage-log.schema";
import { AiUsageInterceptor } from "src/common/interceptors/ai-usage.interceptor";

/**
 * Controller for handling CV template related requests
 * All endpoints in this controller are public (no authentication required)
 */
@Controller("cv-templates")
export class CvTemplateController {
  constructor(private readonly cvTemplateService: CvTemplateService) {}

  /**
   * Get all CV templates
   * @returns Array of CV templates
   * @public - No authentication required
   */
  @Public()
  @Get()
  async findAll() {
    return this.cvTemplateService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @UseAiFeature(AiFeature.SUGGESTION_TEMPLATES_AI)
  @UseInterceptors(AiUsageInterceptor)
  @Post("suggest")
  async getSuggestTemplateCv(@Body("jobDescription") jobDescription: string) {
    return this.cvTemplateService.getSuggestTemplateCv(jobDescription);
  }

  @Public()
  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.cvTemplateService.findOne(id);
  }
}
