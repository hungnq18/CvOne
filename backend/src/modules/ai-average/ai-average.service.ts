import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  AiAverageStats,
  AiAverageStatsDocument,
} from "./schemas/ai-averege.schemas";
import { AiFeature } from "./schemas/ai-averege.schemas";

@Injectable()
export class AiAverageStatsService {
  constructor(
    @InjectModel(AiAverageStats.name)
    private aiAverageStatsModel: Model<AiAverageStatsDocument>,
  ) {}

  // Log usage: cập nhật tổng token và số lượt dùng cho feature
  async logUsage(feature: AiFeature, tokens: number) {
    const result = await this.aiAverageStatsModel.findOneAndUpdate(
      { feature },
      { $inc: { totalTokensUsed: tokens, usageCount: 1 } },
      { upsert: true, new: true }, // tạo nếu chưa tồn tại
    );

    const averageTokensUsed = result.totalTokensUsed / result.usageCount;
    return {
      feature: result.feature,
      totalTokensUsed: result.totalTokensUsed,
      usageCount: result.usageCount,
      averageTokensUsed: Number.isFinite(averageTokensUsed)
        ? averageTokensUsed
        : 0,
    };
  }

  // Lấy thống kê trung bình token + số lượt dùng cho tất cả feature
  async getAverageStats() {
    const stats = await this.aiAverageStatsModel.find().lean();

    return stats.map((stat) => ({
      feature: stat.feature,
      averageTokensUsed:
        stat.usageCount > 0 ? stat.totalTokensUsed / stat.usageCount : 0,
      totalUsageCount: stat.usageCount,
    }));
  }

  // Reset averages: if `feature` provided, reset that feature only; otherwise reset all.
  async resetAverages(feature?: AiFeature) {
    if (feature) {
      const res = await this.aiAverageStatsModel.findOneAndUpdate(
        { feature },
        { $set: { totalTokensUsed: 0, usageCount: 0 } },
        { new: true },
      );

      return {
        feature: res ? res.feature : feature,
        totalTokensUsed: 0,
        usageCount: 0,
      };
    }

    await this.aiAverageStatsModel.updateMany(
      {},
      { $set: { totalTokensUsed: 0, usageCount: 0 } },
    );
    return { ok: true };
  }
}
