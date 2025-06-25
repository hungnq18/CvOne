import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Request,
  UseGuards,
} from "@nestjs/common";
import { SavedJobService } from "./saved-job.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("saved-jobs")
export class SavedJobController {
  constructor(private readonly savedJobService: SavedJobService) {}

  @UseGuards(JwtAuthGuard)
  @Post(":jobId")
  async saveJob(@Param("jobId") jobId: string, @Request() req) {
    const userId = req.user.user._id;
    return this.savedJobService.saveJob(userId, jobId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getSavedJobs(@Request() req) {
    const userId = req.user.user._id;
    return this.savedJobService.getSavedJobs(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":jobId")
  async unsaveJob(@Param("jobId") jobId: string, @Request() req) {
    const userId = req.user.user._id;
    return this.savedJobService.unsaveJob(userId, jobId);
  }
}
