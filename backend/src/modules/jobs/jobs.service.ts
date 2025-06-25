import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Job, JobDocument } from "./schemas/job.schema";
import { Model, Types } from "mongoose";
import { CreateJobDto } from "./dto/create-job.dto";
import { NotFoundException } from "@nestjs/common";
import { UpdateJobDto } from "./dto/update-job.dto";
import { UsersService } from "../users/users.service";
import { User, UserDocument } from "../users/schemas/user.schema";
@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    private userService: UsersService
  ) {}

  async findAll(page: number = 1, limit: number = 10): Promise<JobDocument[]> {
    const skip = (page - 1) * limit;
    return this.jobModel.find().skip(skip).limit(limit).exec();
  }

  async create(jobData: CreateJobDto, userId: string): Promise<JobDocument> {
    // Sử dụng await để lấy user từ Promise

    const transformedData = {
      ...jobData,
      postedBy: new Types.ObjectId(userId),
    };

    const createdJob = new this.jobModel(transformedData);
    return createdJob.save();
  }
  async update(id: string, jobData: UpdateJobDto): Promise<JobDocument> {
    const updatedJob = await this.jobModel
      .findByIdAndUpdate(id, jobData, { new: true, runValidators: true })
      .exec();
    if (!updatedJob) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return updatedJob;
  }
  async delete(id: string): Promise<JobDocument> {
    const deletedJob = await this.jobModel.findByIdAndDelete(id).exec();
    if (!deletedJob) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return deletedJob;
  }
  async getJobById(id: string): Promise<JobDocument> {
    const job = await this.jobModel.findById(id).exec();
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
  }

  async countJobsByPostingDate(
    month: number,
    year: number,
    userId: string
  ): Promise<number> {
    const startDate = new Date(year, month - 1, 1); // Ngày đầu tháng
    const endDate = new Date(year, month, 1); // Ngày đầu tháng kế tiếp

    return this.jobModel.countDocuments({
      postedBy: new Types.ObjectId(userId),
      postingDate: {
        $gte: startDate,
        $lt: endDate,
      },
    });
  }

  async getJobsByHr(userId: string): Promise<JobDocument[]> {
    return this.jobModel.find({ user_id: userId }).exec();
  }
}
