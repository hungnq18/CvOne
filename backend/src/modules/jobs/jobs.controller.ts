import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { File as MulterFile } from "multer";
import * as pdf from "pdf-parse";
import { Roles } from "src/common/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CvAiService } from "../cv/cv-ai.service";
import { CreateJobDto } from "./dto/create-job.dto";
import { UpdateJobDto } from "./dto/update-job.dto";
import { JobsService } from "./jobs.service";
@Controller("jobs")
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly cvAiService: CvAiService
  ) {}

  @Post("analyze-jd-pdf")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype || !file.mimetype.includes("pdf")) {
          return cb(
            new BadRequestException("Only PDF files are allowed!"),
            false
          );
        }
        cb(null, true);
      },
    })
  )
  async analyzeJobDescriptionPdf(@UploadedFile() file: MulterFile) {
    if (!file)
      throw new BadRequestException("No file uploaded or invalid file type.");
    const pdfData = await pdf(file.buffer);
    const jdText = pdfData.text;
    if (!jdText || jdText.trim().length === 0) {
      throw new BadRequestException("Could not extract text from PDF.");
    }
    return this.cvAiService.analyzeJobDescription(jdText);
  }

  @Get()
  async findAll(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10
  ) {
    return this.jobsService.findAll(page, limit);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("hr")
  @Get("/by-hr")
  async getJobsByHr(
    @Request() req,
    @Query("page") page = 1,
    @Query("limit") limit = 10
  ) {
    const userId = req.user.user._id;
    return this.jobsService.getJobsByHr(userId, Number(page), Number(limit));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("hr")
  @Post()
  create(@Body() createJobDto: CreateJobDto, @Request() req) {
    const userId = req.user?.user._id;
    if (!userId) {
      throw new UnauthorizedException("Invalid user");
    }
    return this.jobsService.create(createJobDto, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("hr")
  @Put(":id")
  update(@Param("id") id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobsService.update(id, updateJobDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("hr")
  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.jobsService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get("count-jobs")
  async getCountJobs(@Request() req) {
    const userId = req.user.user._id;
    return this.jobsService.getCountJobs(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get("count-by-posting-date/:month/:year")
  async countJobsByPostingDate(
    @Param("month") month: number,
    @Param("year") year: number,
    @Request() req
  ) {
    const userId = req.user.user._id;
    return this.jobsService.countJobsByPostingDate(month, year, userId);
  }

  // ĐỂ ROUTE ĐỘNG Ở CUỐI CÙNG
  @UseGuards(JwtAuthGuard)
  @Get(":id")
  getJobById(@Param("id") id: string) {
    return this.jobsService.getJobById(id);
  }
}
