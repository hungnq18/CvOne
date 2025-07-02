import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import { CoverLetterService } from "./cover-letter.service";
import { CreateCoverLetterDto } from "./dto/create-cover-letter.dto";
import { UpdateCoverLetterDto } from "./dto/update-cover-letter.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CvAiService } from "../cv/cv-ai.service";
import { OpenAiService } from "../cv/openai.service";
import { CreateGenerateCoverLetterDto } from "./dto/create-generate-cl-ai.dto";
import * as path from "path";
@Controller("cover-letters")
export class CoverLetterController {
  constructor(
    private readonly coverLetterService: CoverLetterService,
    private openAiService: OpenAiService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateCoverLetterDto, @Request() req) {
    const userId = req.user.user._id;
    return this.coverLetterService.create(dto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAllByUser(@Request() req) {
    const userId = req.user.user._id;
    return this.coverLetterService.findAll(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  findOne(@Param("id") id: string, @Request() req) {
    const userId = req.user.user._id;
    return this.coverLetterService.findOne(id, userId);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateCoverLetterDto) {
    return this.coverLetterService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.coverLetterService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post("generate/ai")
  async generateByAi(@Body() dto: CreateGenerateCoverLetterDto) {
    return this.openAiService.generateCoverLetterByAi(dto);
  }

  // @UseGuards(JwtAuthGuard)
  @Post("extract/from-path")
async extractFromPdfFiles(
  @Body() body: {
    coverLetterFileName: string;
    jobDescriptionFileName: string;
    templateId: string;
  }
) {
  const coverLetterPath = path.join(
    process.cwd(),
    "uploads",
    body.coverLetterFileName
  );

  const jdPath = path.join(
    process.cwd(),
    "uploads",
    body.jobDescriptionFileName
  );

  return this.openAiService.extractCoverLetterFromPdf(
    coverLetterPath,
    jdPath,
    body.templateId
  );
  }
}
