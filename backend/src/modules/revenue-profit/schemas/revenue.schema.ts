import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RevenueDocument = Revenue & Document;

export enum RevenueType {
  ORDER = 'order',
  SUBSCRIPTION = 'subscription',
  SERVICE = 'service',
  ADVERTISING = 'advertising',
  COMMISSION = 'commission',
  OTHER = 'other',
}

export enum RevenueStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

@Schema({ timestamps: true })
export class Revenue {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Order' })
  orderId?: Types.ObjectId;

  @Prop({
    required: true,
    enum: RevenueType,
    default: RevenueType.ORDER,
  })
  revenueType: RevenueType;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  currency: string;

  @Prop({
    required: true,
    enum: RevenueStatus,
    default: RevenueStatus.PENDING,
  })
  status: RevenueStatus;

  @Prop({ required: true })
  description: string;

  @Prop()
  paymentMethod?: string;

  @Prop()
  transactionId?: string;

  @Prop()
  notes?: string;

  @Prop({ required: true })
  revenueDate: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const RevenueSchema = SchemaFactory.createForClass(Revenue);

// Indexes for better query performance
RevenueSchema.index({ userId: 1, revenueDate: -1 });
RevenueSchema.index({ revenueType: 1 });
RevenueSchema.index({ status: 1 });
RevenueSchema.index({ orderId: 1 });

