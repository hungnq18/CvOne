import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { JobsService } from "../jobs/jobs.service";
import { CreateApplyJobDto } from "./dto/create-apply-job.dto";
import { UpdateApplyJobByUserDto } from "./dto/update-apply-job.dto";
import { ApplyJob, ApplyJobDocument } from "./schemas/apply-job.schema";

@Injectable()
export class ApplyJobService {
  constructor(
    @InjectModel(ApplyJob.name)
    private readonly applyJobModel: Model<ApplyJobDocument>,
    private readonly jobService: JobsService,
  ) {}

  async apply(dto: CreateApplyJobDto, userId: string) {
    // Kiểm tra đã ứng tuyển trước đó chưa
    const existingApplication = await this.applyJobModel.findOne({
      jobId: new Types.ObjectId(dto.jobId),
      userId: new Types.ObjectId(userId),
    });

    if (existingApplication) {
      throw new BadRequestException("Bạn đã ứng tuyển vào công việc này rồi.");
    }

    // Lấy thông tin job để kiểm tra hạn nộp và trạng thái
    const job = await this.jobService.getJobById(dto.jobId);

    if (!job.isActive) {
      throw new BadRequestException("Công việc này không còn hoạt động.");
    }

    const now = new Date();
    if (now > job.applicationDeadline) {
      throw new BadRequestException("Công việc đã hết hạn nộp hồ sơ.");
    }

    // Tạo apply mới
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

  async getCountApplyJobByStatus(
    status: string,
    userId: string,
    day: number,
    month: number,
    year: number,
  ): Promise<{ count: number }> {
    // Trả về object { count: number }
    // Lấy danh sách job do HR này quản lý
    const jobsByHr = await this.jobService.getJobsByHr(userId);
    if (!jobsByHr || !jobsByHr.data || jobsByHr.data.length === 0) {
      return { count: 0 };
    }
    const jobIds = jobsByHr.data.map((job) => job._id);

    // Tạo khoảng thời gian lọc
    const startDate = new Date(year, month - 1, day, 0, 0, 0);
    const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);

    // Đếm số lượng apply job theo status, jobId và ngày tạo
    const count = await this.applyJobModel.countDocuments({
      status,
      jobId: { $in: jobIds },
      createdAt: { $gte: startDate, $lt: endDate },
    });

    return { count }; // Trả về object
  }

  async getCountApplyJobByStatusWeek(
    status: string,
    userId: string,
    week: number,
    month: number,
    year: number,
  ): Promise<{ days: string[]; counts: number[] }> {
    // Lấy danh sách jobId của HR
    const jobsByHr = await this.jobService.getJobsByHr(userId);
    const jobIds = jobsByHr.data.map((job) => job._id);

    // Tìm ngày đầu tuần (thứ 2) của tuần cần lấy
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const firstDayOfWeek = new Date(firstDayOfMonth);
    firstDayOfWeek.setDate(1 + (week - 1) * 7);
    // Đảm bảo là thứ 2
    const dayOfWeek = firstDayOfWeek.getDay();
    if (dayOfWeek !== 1) {
      // Nếu là chủ nhật (0) thì +1 để ra thứ 2, còn lại thì + (8 - dayOfWeek) % 7
      firstDayOfWeek.setDate(firstDayOfWeek.getDate() + ((8 - dayOfWeek) % 7));
    }
    const days: string[] = [];
    const counts: number[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(firstDayOfWeek);
      day.setDate(firstDayOfWeek.getDate() + i);
      const start = new Date(day);
      start.setHours(0, 0, 0, 0);
      const end = new Date(day);
      end.setHours(23, 59, 59, 999);
      const count = await this.applyJobModel.countDocuments({
        status,
        jobId: { $in: jobIds },
        createdAt: { $gte: start, $lt: end },
      });
      days.push(day.toISOString().slice(0, 10));
      counts.push(count);
    }
    return { days, counts };
  }

  async getApplyJobByHr(
    hrId: string,
    day?: number,
    month?: number,
    year?: number,
  ) {
    const { data: jobsByHr } = await this.jobService.getJobsByHr(hrId);
    const jobIds = jobsByHr.map((job) => job._id);

    const query: any = { jobId: { $in: jobIds } };

    if (day && month && year) {
      const startDate = new Date(year, month - 1, day);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(year, month - 1, day);
      endDate.setHours(23, 59, 59, 999);

      query.createdAt = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    return this.applyJobModel
      .find(query)
      .populate("jobId")
      .populate("userId")
      .populate("cvId")
      .populate("coverletterId")
      .sort({ createdAt: -1 })
      .exec();
  }
}
