import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Job, JobDocument } from "./schemas/job.schema";
import { Model } from "mongoose";
import { CreateJobDto } from "./dto/create-job.dto";
import { NotFoundException } from "@nestjs/common";
import { UpdateJobDto } from "./dto/update-job.dto";

@Injectable()
export class JobsService {
  constructor(@InjectModel(Job.name) private jobModel: Model<JobDocument>) {}

  async findAll(): Promise<JobDocument[]> {
    return this.jobModel.find().exec();
  }

  async create(jobData: CreateJobDto): Promise<JobDocument> {
    const createdJob = new this.jobModel(jobData);
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
}
