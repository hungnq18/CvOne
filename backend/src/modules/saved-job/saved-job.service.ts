import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { SavedJob, SavedJobDocument } from "./schemas/saved-job.schema";

@Injectable()
export class SavedJobService {
  constructor(
    @InjectModel(SavedJob.name)
    private readonly savedJobModel: Model<SavedJobDocument>,
  ) {}

  async saveJob(userId: string, jobId: string): Promise<SavedJob> {
    const exists = await this.savedJobModel.findOne({
      userId: new Types.ObjectId(userId),
      jobId: new Types.ObjectId(jobId),
    });

    if (exists) {
      throw new ConflictException("Job already saved.");
    }

    return this.savedJobModel.create({
      userId: new Types.ObjectId(userId),
      jobId: new Types.ObjectId(jobId),
    });
  }

  async getSavedJobs(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{
    data: SavedJob[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.savedJobModel
        .find({ userId: new Types.ObjectId(userId) })
        .populate("jobId")
        .populate("userId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.savedJobModel.countDocuments({ userId: new Types.ObjectId(userId) }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async unsaveJob(
    userId: string,
    jobId: string,
  ): Promise<{ message: string; status: string }> {
    const deleted = await this.savedJobModel.findOneAndDelete({
      userId: new Types.ObjectId(userId),
      jobId: new Types.ObjectId(jobId),
    });

    if (!deleted) {
      throw new NotFoundException("Saved job not found.");
    }

    return {
      message: "Job unsaved successfully.",
      status: "success",
    };
  }
}
