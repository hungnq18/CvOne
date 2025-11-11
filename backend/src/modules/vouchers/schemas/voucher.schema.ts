import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type VoucherDocument = Voucher & Document;

@Schema({ timestamps: true })
export class Voucher {
  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  description: string;
  @Prop({ required: true, enum: ["direct", "saveable"] })
  type: string;
  @Prop({ required: true })
  discountValue: number;
  @Prop({ required: true, enum: ["percent", "amount"] })
  discountType: string;
  @Prop()
  maxDiscountValue: number;
  @Prop()
  minOrderValue: number;
  @Prop()
  usageLimit: number;
  @Prop({ default: 0 })
  usedCount: number;
  @Prop({ default: 1 })
  perUserLimit: number;
  @Prop()
  durationDays: number;
  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;
  @Prop({ default: true })
  isActive: boolean;
}

export const VoucherSchema = SchemaFactory.createForClass(Voucher);
