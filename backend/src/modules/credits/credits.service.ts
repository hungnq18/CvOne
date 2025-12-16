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
import { exists } from "fs";
import { FeedbackFeature } from "../feedback/schemas/feedback.schema";
@Injectable()
export class CreditsService {
  constructor(
    @InjectModel(Credit.name) private creditModel: Model<CreditDocument>,

    private readonly voucherService: VouchersService
  ) {}

  async createCredit(userId: Types.ObjectId) {
    return await this.creditModel.create({
      userId,
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

  async exitsVoucher(userId: string, voucherId: string) {
    const credit = await this.creditModel.findOne({
      userId: new Types.ObjectId(userId),
      vouchers: {
        $elemMatch: { voucherId: new Types.ObjectId(voucherId) },
      },
    });
    return !!credit;
  }

  async saveVoucher(userId: string, voucherId: string) {
    const voucher = await this.voucherService.getVoucherById(voucherId);
    if (!voucher) return { message: "Voucher not found" };

    if (voucher.type !== "saveable")
      return { message: "Voucher is not saveable" };

    if (!voucher.isActive) {
      return { message: "Voucher is not active" };
    }
    const existsVoucher = await this.exitsVoucher(userId, voucherId);
    if (existsVoucher) {
      return { message: "Voucher already exists" };
    }
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
    // 1️⃣ Lấy credit hiện tại
    const credit = await this.creditModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!credit) {
      throw new NotFoundException("Credit not found");
    }

    // 2️⃣ Kiểm tra số token đủ hay không
    if (credit.token < token) {
      throw new BadRequestException(
        `Not enough token. Required: ${token}, available: ${credit.token}`
      );
    }

    // 3️⃣ Trừ token khi hợp lệ
    credit.token -= token;

    await credit.save();

    return credit;
  }

  async updateUsageVoucher(
    userId: string,
    voucherId: string,
    voucherType: string
  ) {
    const userObjId = new Types.ObjectId(userId);
    const voucherObjId = new Types.ObjectId(voucherId);

    // 1. Check user đã dùng voucher chưa
    const existed = await this.creditModel.findOne({
      userId: userObjId,
      "usedVouchers.voucherId": voucherObjId,
    });

    if (existed) {
      throw new BadRequestException("User already used this voucher");
    }

    const updateQuery: any = {
      $addToSet: {
        usedVouchers: {
          voucherId: voucherObjId,
          usedAt: new Date(),
        },
      },
    };

    // 2. Nếu voucher là saveable → phải pull khỏi credit.vouchers
    if (voucherType === "saveable") {
      updateQuery.$pull = { vouchers: { voucherId: voucherObjId } };
    }

    // 3. Update credit log
    const credit = await this.creditModel.findOneAndUpdate(
      { userId: userObjId },
      updateQuery,
      { new: true }
    );

    if (!credit) throw new NotFoundException("Credit not found");

    return credit;
  }

  async hasUserUsedVoucher(
    userId: string,
    voucherId: string
  ): Promise<boolean> {
    const credit = await this.creditModel.findOne(
      {
        userId: new Types.ObjectId(userId),
        usedVouchers: {
          $elemMatch: { voucherId: new Types.ObjectId(voucherId) },
        },
      },
      { _id: 1 } // chỉ lấy _id cho nhẹ
    );

    return !!credit; // true = đã dùng, false = chưa dùng
  }

  async useVoucherDirect(userId: string, voucherId: string) {
    const used = await this.hasUserUsedVoucher(userId, voucherId);

    if (used) {
      throw new BadRequestException("User has already used this voucher");
    }
    // 1. Atomic increase usage count
    await this.voucherService.incrementVoucherUsageAtomic(voucherId);

    // 2. Save usage log
    const updatedCredit = await this.creditModel.findOneAndUpdate(
      { userId: userId },
      {
        $addToSet: {
          usedVouchers: {
            voucherId: voucherId,
            usedAt: new Date(),
          },
        },
      },
      { new: true, upsert: true }
    );

    return updatedCredit;
  }

  async useVoucherSaveable(userId: string, voucherId: string) {
    const used = await this.hasUserUsedVoucher(userId, voucherId);

    if (used) {
      throw new BadRequestException("User has already used this voucher");
    }
    await this.deleteVoucher(userId, voucherId);
    const updatedCredit = await this.creditModel.findOneAndUpdate(
      { userId: userId },
      {
        $addToSet: {
          usedVouchers: {
            voucherId: voucherId,
            usedAt: new Date(),
          },
        },
      },
      { new: true, upsert: true }
    );

    return updatedCredit;
  }

  async addVoucherForUserFeedback(userId: string, voucherId: string) {
    const credit = await this.saveVoucher(userId, voucherId);
    return credit;
  }
  async getVouchersDisplayForUser(userId: string) {
    // Lấy credit của user
    const credit = await this.creditModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!credit) {
      throw new NotFoundException("Credit not found");
    }

    // Lấy danh sách voucher hiển thị cho user
    const vouchers = await this.voucherService.getVoucherDisplayUsers();

    // Lấy danh sách voucherId user đang sở hữu
    const ownedVoucherIds = credit.vouchers.map((v) => v.voucherId.toString());

    // Lấy danh sách voucherId user đã dùng
    const usedVoucherIds = credit.usedVouchers.map((v) =>
      v.voucherId.toString()
    );

    // LOẠI BỎ voucher đã có hoặc đã dùng
    const availableVouchers = vouchers.filter((voucher: any) => {
      const vid = voucher._id.toString();
      return !ownedVoucherIds.includes(vid) && !usedVoucherIds.includes(vid);
    });

    return availableVouchers;
  }
  async hasEnoughToken(
    userId: string | Types.ObjectId,
    requiredToken: number
  ): Promise<boolean> {
    const userObjectId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const credit = await this.creditModel.findOne(
      { userId: userObjectId },
      { token: 1 }
    );

    if (!credit) {
      throw new NotFoundException("Credit not found");
    }

    return credit.token >= requiredToken;
  }
}
