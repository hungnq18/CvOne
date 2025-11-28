import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AiUsageLog, AiUsageLogDocument } from "./schemas/ai-usage-log.schema";
import { CreateAiUsageLogDto } from "./dto/create-log.dto";

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
}
