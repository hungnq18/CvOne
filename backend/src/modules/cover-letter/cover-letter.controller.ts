import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import * as path from "path";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CoverLetterAiService } from "./cover-letter-ai.service";
import { CoverLetterService } from "./cover-letter.service";
import { CreateCoverLetterDto } from "./dto/create-cover-letter.dto";
import { CreateGenerateCoverLetterDto } from "./dto/create-generate-cl-ai.dto";
import { UpdateCoverLetterDto } from "./dto/update-cover-letter.dto";
@Controller("cover-letters")
export class CoverLetterController {
  constructor(
    private readonly coverLetterService: CoverLetterService,
    private coverLetterAiService: CoverLetterAiService
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

  // @UseGuards(JwtAuthGuard)
  @Post("generate/ai")
  async generateByAi(@Body() dto: CreateGenerateCoverLetterDto) {
    const jdPath = path.join(
      process.cwd(),
      "uploads/",
      dto.jobDescriptionFileName
    );
    return this.coverLetterAiService.generateCoverLetterByAi(dto, jdPath);
  }

  // @UseGuards(JwtAuthGuard)
  @Post("extract/from-path")
  async extractFromPdfFiles(
    @Body()
    body: {
      coverLetterFileName: string;
      jobDescriptionFileName: string;
      templateId: string;
    }
  ) {
    const coverLetterPath = path.join(
      process.cwd(),
      "uploads/",
      body.coverLetterFileName
    );

    const jdPath = path.join(
      process.cwd(),
      "uploads/",
      body.jobDescriptionFileName
    );

    return this.coverLetterAiService.extractCoverLetterFromPdf(
      coverLetterPath,
      jdPath,
      body.templateId
    );
  }
}
