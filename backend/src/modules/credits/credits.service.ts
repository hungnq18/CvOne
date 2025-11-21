import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { VouchersService } from "../vouchers/vouchers.service";
import { Credit, CreditDocument } from "./schemas/credit.schema";
@Injectable()
export class CreditsService {
  constructor(
    @InjectModel(Credit.name) private creditModel: Model<CreditDocument>,

    private readonly voucherService: VouchersService
  ) {}

  async createCredit(userId: string) {
    return await this.creditModel.create({
      userId: new Types.ObjectId(userId),
    });
  }
  async updateToken(userId: string, token: number) {
    const credit = await this.creditModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $inc: { token: token } },
      { new: true }
    );
    if (!credit) {
      throw new NotFoundException("Credit not found");
    }
    return credit;
  }

  async saveVoucher(userId: string, voucherId: string) {
    const voucher = await this.voucherService.getVoucherById(voucherId);
    if (!voucher) throw new NotFoundException("Voucher not found");

    if (voucher.type !== "saveable")
      throw new BadRequestException("Voucher is not saveable");

    if (!voucher.isActive)
      throw new BadRequestException("Voucher is not active");

    const now = new Date();
    if (voucher.startDate && now < new Date(voucher.startDate))
      throw new BadRequestException("Voucher is not yet active");
    if (voucher.endDate && now > new Date(voucher.endDate))
      throw new BadRequestException("Voucher has expired");

    // Atomically check and update usage count
    if (voucher.usageLimit) {
      await this.voucherService.incrementVoucherUsageAtomic(voucherId);
    }

    // Compute endDate
    const startDate = new Date();
    const endDate = voucher.durationDays
      ? new Date(
          startDate.getTime() + voucher.durationDays * 24 * 60 * 60 * 1000
        )
      : voucher.endDate;

    // Add to user's credit (or create if not exists)
    await this.creditModel.updateOne(
      { userId: new Types.ObjectId(userId) },
      {
        $addToSet: {
          vouchers: {
            voucherId: new Types.ObjectId(voucherId),
            startDate,
            endDate,
          },
        },
      },
      { upsert: true }
    );

    return { message: "Voucher saved successfully" };
  }

  async getVouchers(userId: string) {
    const credit = await this.creditModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (!credit) {
      throw new NotFoundException("Credit not found");
    }
    return credit.vouchers;
  }

  async getCredit(userId: string) {
    const credit = await this.creditModel
      .findOne({
        userId: new Types.ObjectId(userId),
      })
      .populate("vouchers.voucherId");
    if (!credit) {
      throw new NotFoundException("Credit not found");
    }
    return credit;
  }

  async deleteVoucher(userId: string, voucherId: string) {
    const credit = await this.creditModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $pull: { vouchers: { voucherId: new Types.ObjectId(voucherId) } } },
      { new: true }
    );
    if (!credit) {
      throw new NotFoundException("Credit not found");
    }
    return credit;
  }
  async useToken(userId: string, token: number) {
    const credit = await this.creditModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $inc: { token: -token } },
      { new: true }
    );
    if (!credit) {
      throw new NotFoundException("Credit not found");
    }
    return credit;
  }
}
