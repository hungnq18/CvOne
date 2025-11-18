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

import { Order, OrderDocument } from "./schemas/order.schema";
import { PayosService } from "../payos/payos.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { VouchersService } from "../vouchers/vouchers.service";
import { CreditsService } from "../credits/credits.service";
import { VoucherDocument } from "../vouchers/schemas/voucher.schema";
@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly payosService: PayosService,
    private readonly voucherService: VouchersService,
    private readonly creditService: CreditsService,
  ) { }

  generateOrderCode(): number {
    const now = new Date();
    const orderIdStr =
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, "0") +
      now.getDate().toString().padStart(2, "0") +
      Math.floor(Math.random() * 100)
        .toString()
        .padStart(6, "0");

    return parseInt(orderIdStr);
  }
  async createOrder(createOrderDto: CreateOrderDto, userId: string) {
    const { voucherId, totalToken, price, paymentMethod } = createOrderDto;
    const orderCode = this.generateOrderCode();
    let totalAmount = price;
    const now = new Date();

    let voucher: any = null;

    // --- Xử lý voucher nếu có ---
    if (voucherId) {
      voucher = await this.voucherService.getVoucherById(voucherId);
      if (!voucher) throw new NotFoundException("Voucher not found");

      if (!voucher.isActive) {
        throw new BadRequestException("Voucher is not active");
      }

      if (
        now < new Date(voucher.startDate) ||
        now > new Date(voucher.endDate)
      ) {
        throw new BadRequestException("Voucher is expired");
      }

      if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
        throw new BadRequestException("Voucher has reached usage limit");
      }

      // --- Tính giảm giá ---
      let discountAmount = 0;
      if (voucher.discountType === "percent") {
        discountAmount = price * (voucher.discountValue / 100);
        if (
          voucher.maxDiscountValue &&
          discountAmount > voucher.maxDiscountValue
        ) {
          discountAmount = voucher.maxDiscountValue;
        }
      } else if (voucher.discountType === "amount") {
        discountAmount = voucher.discountValue;
      }

      totalAmount = Math.max(price - discountAmount, 0);
    }

    // --- Tính phí giao dịch 2% trên số tiền sau giảm ---
    const transactionFee = totalAmount * 0.02;
    const finalAmount = Math.ceil(totalAmount + transactionFee);

    // --- Tạo order ---
    const createdOrder = await this.orderModel.create({
      orderCode,
      userId: new Types.ObjectId(userId),
      voucherId: voucher ? new Types.ObjectId(voucher._id) : null,
      totalToken,
      price,
      totalAmount: finalAmount, // Total amount bao gồm phí giao dịch
      status: "pending",
      paymentMethod,
    });

    // --- Chỉ trừ voucher sau khi order đã tạo thành công ---
    if (voucher) {
      if (voucher.type === "direct") {
        await this.voucherService.updateVoucherUsedCount(voucher._id);
      } else if (voucher.type === "saveable") {
        await this.creditService.deleteVoucher(userId, voucher._id);
      }
    }

    // --- Xử lý thanh toán ---
    let paymentLink = null;
    if (paymentMethod === "payos") {
      const payos = await this.payosService.createPaymentLink(
        orderCode,
        finalAmount,
        `Thanh toán`,
      );
      paymentLink = payos?.checkoutUrl || payos?.data?.checkoutUrl || null;
    }

    return {
      message: "Order created successfully",
      order: createdOrder,
      paymentLink,
    };
  }

  async updateOrderStatus(orderId: string, status: string) {
    const updatedOrder = await this.orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true },
    );
    if (!updatedOrder) {
      throw new NotFoundException("Order not found");
    }
    return updatedOrder;
  }
  async updateOrderStatusByOrderCode(orderCode: string, status: string) {
    const updatedOrder = await this.orderModel.findOneAndUpdate(
      { orderCode },
      { status },
      { new: true },
    );
    if (!updatedOrder) {
      throw new NotFoundException("Order not found");
    }
    return updatedOrder;
  }

  // Lấy order theo orderCode
  async getOrderByOrderCode(orderCode: string) {
    const order = await this.orderModel
      .findOne({ orderCode })
      .populate("voucherId");
    if (!order) {
      throw new NotFoundException("Order not found");
    }
    return order;
  }

  async getOrderHistory(userId: string) {
    return this.orderModel
      .find({
        userId: new Types.ObjectId(userId),
        status: { $in: ["completed", "cancelled"] },
      })
      .sort({ createdAt: -1 })
      .exec();
  }
}
