import {
  Controller,
  Get,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Delete,
  Query,
} from "@nestjs/common";
import { AiAverageStatsService } from "./ai-average.service";
import { Roles } from "src/common/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { AiFeature } from "./schemas/ai-averege.schemas";

@Controller("ai-average")
export class AiAverageStatsController {
  constructor(private readonly aiAverageStatsService: AiAverageStatsService) { }

  @Get("average-stats")
  @Roles("admin")
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAverageStats() {
    return this.aiAverageStatsService.getAverageStats();
  }

  @Delete("reset")
  @Roles("admin")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async resetAverages(@Query("feature") feature?: AiFeature) {
    return this.aiAverageStatsService.resetAverages(feature as AiFeature);
  }
}
