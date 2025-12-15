import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateAiUsageLogDto } from "./dto/create-log.dto";
import {
  AiFeature,
  AiUsageLog,
  AiUsageLogDocument,
} from "./schemas/ai-usage-log.schema";

@Injectable()
export class AiUsageLogService {
  constructor(
    @InjectModel(AiUsageLog.name) private logModel: Model<AiUsageLogDocument>
  ) {}

  async createLog(data: CreateAiUsageLogDto) {
    return await this.logModel.create({
      userId: new Types.ObjectId(data.userId),
      feature: data.feature,
      tokensUsed: data.tokensUsed,
    });
  }

  async getLogsByUserId(userId: string) {
    return await this.logModel.find({ userId });
  }

  async getLogsByUserIdAndFeature(userId: string, feature: string) {
    return await this.logModel.find({ userId, feature });
  }
  async estimateToken(feature: AiFeature): Promise<number> {
    const result = await this.logModel.aggregate([
      { $match: { feature } },
      {
        $group: {
          _id: "$feature",
          avgToken: { $avg: "$tokensUsed" },
        },
      },
    ]);

    // fallback nếu chưa có dữ liệu
    return result.length ? Math.ceil(result[0].avgToken) : 300;
  }
}
