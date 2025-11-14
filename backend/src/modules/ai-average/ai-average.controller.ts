import { Controller, Get, UseGuards } from "@nestjs/common";
import { AiAverageStatsService } from "./ai-average.service";
import { Roles } from "src/common/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";

@Controller("ai-average-stats")
export class AiAverageStatsController {
  constructor(private readonly aiAverageStatsService: AiAverageStatsService) {}

  @Get("average-stats")
  @Roles("admin")
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAverageStats() {
    return this.aiAverageStatsService.getAverageStats();
  }
}
