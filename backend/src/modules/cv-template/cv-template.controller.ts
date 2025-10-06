import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { Public } from "../auth/decorators/public.decorator";
import { CvTemplateService } from "./cv-template.service";
import { CvTemplateAiService } from "./cv-template-ai.service";

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

  @Public()
  @Get("test")
  async test() {
    return this.cvTemplateService.getCategories();
  }

  @Public()
  @Post("suggest")
  async getSuggestTemplateCv(@Body("message") message: string) {
    return this.cvTemplateService.getSuggestTemplateCv(message);
  }

  @Public()
  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.cvTemplateService.findOne(id);
  }
}
