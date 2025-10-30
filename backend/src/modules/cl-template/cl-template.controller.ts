import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { ClTemplateService } from "./cl-template.service";
import { CreateClTemplateDto } from "./dto/create-cl-template.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";

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

  @Get("suggest-template/ai")
  async getSuggestTemplateCv(@Body("jobDescription") jobDescription: string) {
    return this.clTemplateService.getSuggestTemplateCl(jobDescription);
  }
}
