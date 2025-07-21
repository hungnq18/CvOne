import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { ApplyJob, ApplyJobDocument } from "./schemas/apply-job.schema";
import { CreateApplyJobDto } from "./dto/create-apply-job.dto";
import { UpdateApplyJobByUserDto } from "./dto/update-apply-job.dto";
import { Job, JobDocument } from "../jobs/schemas/job.schema";
import { JobsService } from "../jobs/jobs.service";

@Injectable()
export class ApplyJobService {
  constructor(
    @InjectModel(ApplyJob.name)
    private readonly applyJobModel: Model<ApplyJobDocument>,
    private readonly jobService: JobsService,
  ) { }

  async apply(dto: CreateApplyJobDto, userId: string) {
    // Validate trong service để đảm bảo
    if (!dto.cvId && !dto.cvUrl) {
      throw new BadRequestException("Phải cung cấp ít nhất cvId hoặc cvUrl");
    }
    if (!dto.coverletterId && !dto.coverletterUrl) {
      throw new BadRequestException(
        "Phải cung cấp ít nhất coverletterId hoặc coverletterUrl",
      );
    }

    const applyJob = new this.applyJobModel({
      ...dto,
      jobId: new Types.ObjectId(dto.jobId),
      userId: new Types.ObjectId(userId),
      cvId: dto.cvId ? new Types.ObjectId(dto.cvId) : undefined,
      cvUrl: dto.cvUrl,
      coverletterId: dto.coverletterId
        ? new Types.ObjectId(dto.coverletterId)
        : undefined,
      coverletterUrl: dto.coverletterUrl,
    });

    return applyJob.save();
  }

  async getAll() {
    return this.applyJobModel
      .find()
      .populate("jobId userId cvId coverletterId");
  }

  async getByUser(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.applyJobModel
        .find({ userId })
        .populate("jobId cvId coverletterId userId")
        .skip(skip)
        .limit(limit)
        .sort(),
      this.applyJobModel.countDocuments({ userId }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async getByHr(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const results = await this.applyJobModel
      .find()
      .populate({
        path: "jobId",
        match: { user_id: userId },
      })
      .populate("cvId")
      .populate("coverletterId")
      .populate("userId")
      .skip(skip)
      .limit(limit)
      .sort();

    const filtered = results.filter((item) => item.jobId);

    const paginated = filtered.slice(skip, skip + limit);

    return {
      data: paginated,
      total: filtered.length,
      page,
      limit,
    };
  }

  async getApplyJobDetail(applyJobId: string) {
    return this.applyJobModel
      .findById(applyJobId)
      .populate("jobId")
      .populate("cvId")
      .populate("coverletterId")
      .populate("userId");
  }

  async getByJob(
    userId: string,
    jobId: string,
    status: string,
    page: number,
    limit: number,
  ) {
    const skip = (page - 1) * limit;

    if (!jobId || !status) {
      throw new BadRequestException("Thiếu jobId hoặc status");
    }

    const allMatching = await this.applyJobModel
      .find({ status })
      .populate({
        path: "jobId",
        match: { user_id: userId, _id: jobId },
        select: "user_id",
      })
      .populate("userId cvId coverletterId")
      .lean();

    const filtered = allMatching.filter((apply) => apply.jobId !== null);
    const paginated = filtered.slice(skip, skip + limit);

    return {
      data: paginated,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    };
  }

  async getApplyJobDetailByHr(applyJobId: string, hrUserId: string) {
    const apply = await this.applyJobModel
      .findById(applyJobId)
      .populate("jobId")
      .populate("cvId")
      .populate("coverletterId");

    if (!apply) {
      throw new NotFoundException("Apply job not found");
    }

    const job = apply.jobId as any;

    if (!job || job.userId.toString() !== hrUserId) {
      throw new ForbiddenException("Bạn không có quyền xem đơn ứng tuyển này");
    }

    if (apply.status === "pending") {
      apply.status = "reviewed";
      await apply.save();
    }

    return apply;
  }

  async updateStatusByHr(
    applyJobId: string,
    hrUserId: string,
    newStatus: string,
  ) {
    if (!["approved", "rejected", "reviewed"].includes(newStatus)) {
      throw new BadRequestException("Trạng thái không hợp lệ");
    }

    const apply = await this.applyJobModel
      .findById(applyJobId)
      .populate("jobId");

    if (!apply) {
      throw new NotFoundException("Đơn ứng tuyển không tồn tại");
    }
    apply.status = newStatus;
    await apply.save();

    return apply;
  }

  async updateApplyJobByUser(
    applyJobId: string,
    userId: string,
    updates: UpdateApplyJobByUserDto,
  ) {
    const applyJob = await this.applyJobModel.findById(applyJobId);

    if (!applyJob) {
      throw new NotFoundException("Không tìm thấy đơn ứng tuyển");
    }

    if (applyJob.userId.toString() !== userId) {
      throw new ForbiddenException("Bạn không có quyền cập nhật đơn này");
    }

    const forbiddenStatuses = ["accepted", "reviewed", "rejected"];
    if (forbiddenStatuses.includes(applyJob.status)) {
      throw new ForbiddenException(
        `Đơn ứng tuyển đã ở trạng thái "${applyJob.status}" và không thể chỉnh sửa`,
      );
    }

    // Validate khi cập nhật CV hoặc Cover Letter
    if (
      (updates.cvId !== undefined || updates.cvUrl !== undefined) &&
      !updates.cvId &&
      !updates.cvUrl
    ) {
      throw new BadRequestException(
        "Phải cung cấp ít nhất cvId hoặc cvUrl khi cập nhật CV",
      );
    }
    if (
      (updates.coverletterId !== undefined ||
        updates.coverletterUrl !== undefined) &&
      !updates.coverletterId &&
      !updates.coverletterUrl
    ) {
      throw new BadRequestException(
        "Phải cung cấp ít nhất coverletterId hoặc coverletterUrl khi cập nhật Cover Letter",
      );
    }

    if (updates.cvId) {
      applyJob.cvId = new Types.ObjectId(updates.cvId);
    }
    if (updates.cvUrl) {
      applyJob.cvUrl = updates.cvUrl;
    }
    if (updates.coverletterId) {
      applyJob.coverletterId = new Types.ObjectId(updates.coverletterId);
    }
    if (updates.coverletterUrl) {
      applyJob.coverletterUrl = updates.coverletterUrl;
    }

    await applyJob.save();
    return applyJob;
  }

  async countByCreateAt(
    month: number,
    year: number,
    userId: string,
  ): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    return this.applyJobModel.countDocuments({
      userId: new Types.ObjectId(userId),
      createdAt: {
        $gte: startDate,
        $lt: endDate,
      },
    });
  }

  async deleteApplyJob(applyJobId: string) {
    return this.applyJobModel.findByIdAndDelete(applyJobId);
  }

  async getCountApplyJob(userId: string) {
    const applyJobs = await this.applyJobModel
      .find()
      .populate({
        path: "jobId",
        match: { user_id: userId },
        select: "_id",
      })
      .exec();

    const count = applyJobs.filter((aj) => aj.jobId !== null).length;

    return count;
  }

  async getCountApplyJobByStatus(status: string, userId: string) {
    const applyJobs = await this.applyJobModel
      .find({ status })
      .populate({
        path: "jobId",
        match: { user_id: userId },
        select: "_id",
      })
      .exec();

    const count = applyJobs.filter((aj) => aj.jobId !== null).length;

    return count;
  }
}
