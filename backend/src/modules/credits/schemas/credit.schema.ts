import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type CreditDocument = Credit & Document;

@Schema({ timestamps: true })
export class Credit {
  @Prop({ required: true, type: Types.ObjectId, ref: "User" })
  userId: Types.ObjectId;

  @Prop({ default: 0 })
  token: number;

  @Prop({
    type: [
      {
        voucherId: { type: Types.ObjectId, ref: "Voucher", required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
      },
    ],
    default: [],
  })
  vouchers: {
    voucherId: Types.ObjectId;
    startDate: Date;
    endDate: Date;
  }[];
  @Prop({
    type: [
      {
        voucherId: { type: Types.ObjectId, ref: "Voucher", required: true },
        usedAt: { type: Date, required: true },
      },
    ],
    default: [],
  })
  usedVouchers: {
    voucherId: Types.ObjectId;
    usedAt: Date;
  }[];
}

export const CreditSchema = SchemaFactory.createForClass(Credit);
