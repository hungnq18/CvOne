import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProfitDocument = Profit & Document;

export enum CostType {
  OPERATING = 'operating',
  MARKETING = 'marketing',
  SALARY = 'salary',
  INFRASTRUCTURE = 'infrastructure',
  SOFTWARE = 'software',
  TAX = 'tax',
  OTHER = 'other',
}

export enum CostStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class Profit {
  @Prop({ required: true })
  period: string; // Format: YYYY-MM for monthly, YYYY-MM-DD for daily

  @Prop({ required: true })
  periodType: string; // 'daily', 'monthly', 'yearly'

  @Prop({ required: true, type: Types.ObjectId, ref: 'Revenue' })
  revenueId: Types.ObjectId;

  @Prop({ required: true })
  totalRevenue: number;

  @Prop({
    type: [
      {
        costType: {
          type: String,
          enum: CostType,
          required: true,
        },
        amount: { type: Number, required: true },
        description: { type: String, required: true },
        status: {
          type: String,
          enum: CostStatus,
          default: CostStatus.PENDING,
        },
        costDate: { type: Date, required: true },
        notes: { type: String },
      },
    ],
    default: [],
  })
  costs: {
    costType: CostType;
    amount: number;
    description: string;
    status: CostStatus;
    costDate: Date;
    notes?: string;
  }[];

  @Prop({ required: true, default: 0 })
  totalCosts: number;

  @Prop({ required: true, default: 0 })
  profit: number; // Calculated: totalRevenue - totalCosts

  @Prop({ required: true, default: 0 })
  profitMargin: number; // Calculated: (profit / totalRevenue) * 100

  @Prop({ required: true })
  currency: string;

  @Prop()
  notes?: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ProfitSchema = SchemaFactory.createForClass(Profit);

// Indexes for better query performance
ProfitSchema.index({ period: 1, periodType: 1 });
ProfitSchema.index({ revenueId: 1 });
ProfitSchema.index({ createdAt: -1 });

// Virtual for calculating profit automatically
ProfitSchema.pre('save', function (next) {
  // Calculate total costs
  this.totalCosts = this.costs.reduce(
    (sum, cost) => sum + (cost.status === CostStatus.PAID ? cost.amount : 0),
    0,
  );

  // Calculate profit
  this.profit = this.totalRevenue - this.totalCosts;

  // Calculate profit margin (percentage)
  this.profitMargin =
    this.totalRevenue > 0 ? (this.profit / this.totalRevenue) * 100 : 0;

  next();
});

