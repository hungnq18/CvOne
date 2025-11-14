import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Cron, CronExpression } from "@nestjs/schedule";
import { NotificationsService } from "../notifications/notifications.service";
import { CreateNotificationDto } from "../notifications/dto/create-notification.dto";
import { Voucher, VoucherDocument } from "./schemas/voucher.schema";
import { CreateVoucherDirectDto } from "./dto/create-voucher-direct.dto";
import { CreateVoucherSaveableDto } from "./dto/create-voucher-saveable.dto";
import { UpdateVoucherDirectDto } from "./dto/update-voucher-direct.dto";
import { UpdateVoucherSaveableDto } from "./dto/update-voucher-saveable.dto";
@Injectable()
export class VouchersService {
  constructor(
    @InjectModel(Voucher.name) private voucherModel: Model<VoucherDocument>,
  ) { }

  async createVoucherDirect(voucher: CreateVoucherDirectDto) {
    const newVoucher = {
      ...voucher,
      startDate: new Date(voucher.startDate),
      endDate: new Date(voucher.endDate),
    };
    const createdVoucher = await this.voucherModel.create(newVoucher);
    return createdVoucher;
  }
  async createVoucherSaveable(voucher: CreateVoucherSaveableDto) {
    const newVoucher = {
      ...voucher,
      startDate: new Date(voucher.startDate),
      endDate: new Date(voucher.endDate),
    };
    const createdVoucher = await this.voucherModel.create(newVoucher);
    return createdVoucher;
  }

  async getAllVouchers() {
    const vouchers = await this.voucherModel.find();
    return vouchers;
  }
  async getVoucherById(id: string) {
    const voucher = await this.voucherModel.findById(id);
    return voucher;
  }
  async deleteVoucherById(id: string) {
    const deletedVoucher = await this.voucherModel.findByIdAndDelete(id);
    return deletedVoucher;
  }

  async getVoucherDisplayUsers() {
    const dateNow = new Date();
    const vouchers = await this.voucherModel.find({
      isActive: true,
      startDate: { $lte: dateNow },
      endDate: { $gte: dateNow },
    });
    if (!vouchers) {
      throw new NotFoundException("Vouchers not found");
    }
    return vouchers;
  }

  async updateVoucherDirect(
    id: string,
    updateVoucherDto: UpdateVoucherDirectDto,
  ) {
    const voucher = await this.voucherModel.findById(id);
    if (!voucher) {
      throw new NotFoundException(`Voucher not found`);
    }
    if (voucher.type !== "direct") {
      throw new NotFoundException(`Voucher is not direct`);
    }

    // Create a new object for updates to handle date conversion
    const updateData: any = { ...updateVoucherDto };
    if (updateVoucherDto.startDate) {
      updateData.startDate = new Date(updateVoucherDto.startDate);
    }
    if (updateVoucherDto.endDate) {
      updateData.endDate = new Date(updateVoucherDto.endDate);
    }

    // Cập nhật các trường được gửi lên
    Object.assign(voucher, updateData);

    await voucher.save();
    return voucher;
  }
  async updateVoucherSaveable(
    id: string,
    updateVoucherDto: UpdateVoucherSaveableDto,
  ) {
    const voucher = await this.voucherModel.findById(id);
    if (!voucher) {
      throw new NotFoundException(`Voucher  not found`);
    }
    if (voucher.type !== "saveable") {
      throw new NotFoundException(`Voucher is not direct`);
    }

    // Cập nhật các trường được gửi lên
    Object.assign(voucher, updateVoucherDto);

    await voucher.save();
    return voucher;
  }

  async updateVoucherUsedCount(id: string) {
    const voucher = await this.voucherModel.findById(id);
    if (!voucher) {
      throw new NotFoundException(`Voucher  not found`);
    }
    voucher.usedCount += 1;
    await voucher.save();
    return voucher;
  }
  async incrementVoucherUsageAtomic(voucherId: string): Promise<void> {
    const updated = await this.voucherModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(voucherId), // ép sang ObjectId
        $expr: { $lt: ["$usedCount", "$usageLimit"] }, // atomic check
      },
      { $inc: { usedCount: 1 } },
      { new: true },
    );

    if (!updated) {
      throw new BadRequestException(
        "Voucher has reached usage limit or not found",
      );
    }
  }
}
