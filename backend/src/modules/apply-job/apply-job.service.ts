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

@Injectable()
export class ApplyJobService {
  constructor(
    @InjectModel(ApplyJob.name)
    private readonly applyJobModel: Model<ApplyJobDocument>
  ) {}

  async apply(dto: CreateApplyJobDto, userId: string) {
    if (!dto.cvId && !dto.coverletterId) {
      throw new BadRequestException(
        "Bạn phải gửi ít nhất một trong CV hoặc Cover Letter"
      );
    }

    const applyJob = new this.applyJobModel({
      ...dto,
      jobId: new Types.ObjectId(dto.jobId),
      userId: new Types.ObjectId(userId),
      cvId: dto.cvId ? new Types.ObjectId(dto.cvId) : undefined,
      coverletterId: dto.coverletterId
        ? new Types.ObjectId(dto.coverletterId)
        : undefined,
    });

    return applyJob.save();
  }

  async getAll() {
    return this.applyJobModel
      .find()
      .populate("jobId userId cvId coverletterId");
  }

  async getByUser(userId: string) {
    return this.applyJobModel
      .find({ userId })
      .populate("jobId cvId coverletterId");
  }

  async getByHr(userId: string) {
    return this.applyJobModel
      .find()
      .populate({
        path: "jobId",
        match: { userId }, // 👈 lọc job theo HR userId
      })
      .populate("cvId")
      .populate("coverletterId")
      .then((results) => results.filter((item) => item.jobId)); // 👈 lọc bỏ những cái null do match
  }

  async getApplyJobDetail(applyJobId: string) {
    return this.applyJobModel
      .findById(applyJobId)
      .populate("jobId")
      .populate("cvId")
      .populate("coverletterId")
      .populate("userId");
  }

  async getByJob(jobId: string) {
    return this.applyJobModel
      .find({ jobId })
      .populate("userId cvId coverletterId");
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

    // Nếu chưa review thì cập nhật status thành reviewed
    if (apply.status === "pending") {
      apply.status = "reviewed";
      await apply.save();
    }

    return apply;
  }

  async updateStatusByHr(
    applyJobId: string,
    hrUserId: string,
    newStatus: "accepted" | "rejected"
  ) {
    if (!["accepted", "rejected"].includes(newStatus)) {
      throw new BadRequestException("Trạng thái không hợp lệ");
    }

    const apply = await this.applyJobModel
      .findById(applyJobId)
      .populate("jobId");

    if (!apply) {
      throw new NotFoundException("Đơn ứng tuyển không tồn tại");
    }

    const job = apply.jobId as any;

    if (!job || job.userId.toString() !== hrUserId) {
      throw new ForbiddenException(
        "Bạn không có quyền cập nhật đơn ứng tuyển này"
      );
    }

    apply.status = newStatus;
    await apply.save();

    return apply;
  }

  async updateApplyJobByUser(
    applyJobId: string,
    userId: string,
    updates: {
      cvId?: string;
      coverletterId?: string;
    }
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
        `Đơn ứng tuyển đã ở trạng thái "${applyJob.status}" và không thể chỉnh sửa`
      );
    }

    if (updates.cvId) {
      applyJob.cvId = new Types.ObjectId(updates.cvId);
    }

    if (updates.coverletterId) {
      applyJob.coverletterId = new Types.ObjectId(updates.coverletterId);
    }

    await applyJob.save();
    return applyJob;
  }

  async countByCreateAt(
    month: number,
    year: number,
    userId: string
  ): Promise<number> {
    const startDate = new Date(year, month - 1, 1); // ngày đầu tháng
    const endDate = new Date(year, month, 1); // ngày đầu tháng kế tiếp
    return this.applyJobModel.countDocuments({
      userId: new Types.ObjectId(userId),
      createdAt: {
        $gte: startDate,
        $lt: endDate,
      },
    });
  }
}
