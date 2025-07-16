import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Request,
  Param,
  Patch,
  Delete,
} from "@nestjs/common";
import { ApplyJobService } from "./apply-job.service";
import { CreateApplyJobDto } from "./dto/create-apply-job.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";

@Controller("apply-job")
export class ApplyJobController {
  constructor(private readonly applyJobService: ApplyJobService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async apply(@Body() dto: CreateApplyJobDto, @Request() req) {
    const userId = req.user.user._id;
    return this.applyJobService.apply(dto, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @Get()
  async getAll() {
    return this.applyJobService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get("by-user")
  async getByUser(
    @Request() req,
    @Query("page") page = 1,
    @Query("limit") limit = 10
  ) {
    const userId = req.user.user._id;
    return this.applyJobService.getByUser(userId, +page, +limit);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("hr")
  @Get("by-hr")
  async getByHr(
    @Request() req,
    @Query("page") page = 1,
    @Query("limit") limit = 10
  ) {
    const userId = req.user.user._id;
    return this.applyJobService.getByHr(userId, +page, +limit);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("hr")
  @Get("by-job")
  async getByJob(
    @Query("jobId") jobId: string,
    @Query("status") status: string,
    @Query("page") page = 1,
    @Query("limit") limit = 10,
    @Request() req
  ) {
    const userId = req.user.user._id;
    return this.applyJobService.getByJob(userId, jobId, status, +page, +limit);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("hr")
  @Get("count-apply-job")
  async getCountApplyJob(@Request() req) {
    const userId = req.user.user._id;
    return this.applyJobService.getCountApplyJob(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("hr")
  @Get("count-apply-job-by-status/:status")
  async getCountApplyJobByStatus(
    @Request() req,
    @Param("status") status: string
  ) {
    const userId = req.user.user._id;
    return this.applyJobService.getCountApplyJobByStatus(status, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("hr")
  @Get("/:applyJobId/by-hr")
  async getApplyJobByHr(
    @Param("applyJobId") applyJobId: string,
    @Request() req
  ) {
    return this.applyJobService.getApplyJobDetailByHr(
      applyJobId,
      req.user.user._id
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  async getById(@Param("id") id: string) {
    return this.applyJobService.getApplyJobDetail(id);
  }

  @UseGuards(JwtAuthGuard)
  @Roles("hr")
  @Patch(":id/status/by-hr")
  updateStatusByHr(
    @Param("id") id: string,
    @Body("status") status: string,
    @Request() req
  ) {
    const hrUserId = req.user.user._id;
    return this.applyJobService.updateStatusByHr(id, hrUserId, status);
  }

  @UseGuards(JwtAuthGuard)
  @Roles("user")
  @Patch(":id/user-update")
  updateCvOrCoverLetter(
    @Param("id") applyJobId: string,
    @Request() req,
    @Body() body: { cvId?: string; coverletterId?: string }
  ) {
    const userId = req.user.user._id;
    return this.applyJobService.updateApplyJobByUser(applyJobId, userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get("count-by-create-at/:month/:year")
  async countByCreateAt(
    @Param("month") month: number,
    @Param("year") year: number,
    @Request() req
  ) {
    const userId = req.user.user._id;
    return this.applyJobService.countByCreateAt(month, year, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("hr")
  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.applyJobService.deleteApplyJob(id);
  }
}
