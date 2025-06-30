import {
  Controller,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Get,
  UseGuards,
  Query,
  Request,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { JobsService } from "./jobs.service";
import { CreateJobDto } from "./dto/create-job.dto";
import { UpdateJobDto } from "./dto/update-job.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
@Controller("jobs")
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  async findAll(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
  ) {
    const jobs = await this.jobsService.findAll(page, limit);
    return { data: jobs, page, limit };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("hr")
  @Get("/by-hr")
  async getJobsByHr(@Request() req) {
    const userId = req.user.user._id;
    return this.jobsService.getJobsByHr(userId);
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

  // @UseGuards(JwtAuthGuard)
  @Get(":id")
  getJobById(@Param("id") id: string) {
    return this.jobsService.getJobById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get("count-by-posting-date/:month/:year")
  async countJobsByPostingDate(
    @Param("month") month: number,
    @Param("year") year: number,
    @Request() req,
  ) {
    const userId = req.user.user._id;
    return this.jobsService.countJobsByPostingDate(month, year, userId);
  }
}
