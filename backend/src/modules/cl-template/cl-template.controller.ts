import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ClTemplateService } from "./cl-template.service";
import { CreateClTemplateDto } from "./dto/create-cl-template.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { User } from "src/common/decorators/user.decorator";
import { UseAiFeature } from "src/common/decorators/ai-feature.decorator";
import { AiFeature } from "../ai-usage-log/schemas/ai-usage-log.schema";
import { AiUsageInterceptor } from "src/common/interceptors/ai-usage.interceptor";
import { FreeAi } from "src/common/decorators/ai-feature-free.decorator";

@Controller("cl-templates")
export class ClTemplateController {
  constructor(private readonly clTemplateService: ClTemplateService) {}

  //   @UseGuards(JwtAuthGuard, RolesGuard)
  //   @Roles('admin')
  @Post()
  create(@Body() dto: CreateClTemplateDto) {
    return this.clTemplateService.create(dto);
  }

  @Get()
  findAll() {
    return this.clTemplateService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.clTemplateService.findOne(id);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.clTemplateService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @FreeAi()
  @UseAiFeature(AiFeature.SUGGESTION_TEMPLATES_AI)
  @UseInterceptors(AiUsageInterceptor)
  @Get("suggest-template/ai")
  async getSuggestTemplateCv(@Body("jobDescription") jobDescription: string) {
    return this.clTemplateService.getSuggestTemplateCl(jobDescription);
  }
}
