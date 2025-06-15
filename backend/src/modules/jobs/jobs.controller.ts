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
@Controller("jobs")
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10
  ) {
    const jobs = await this.jobsService.findAll(page, limit);
    return { data: jobs, page, limit };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createJobDto: CreateJobDto, @Request() req) {
    const accountId = req.user?.id;
    if (!accountId) {
      throw new UnauthorizedException("Invalid user");
    }
    return this.jobsService.create(createJobDto, accountId);
  }
  @UseGuards(JwtAuthGuard)
  @Put(":id")
  update(@Param("id") id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobsService.update(id, updateJobDto);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.jobsService.delete(id);
  }
}
