import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type CreditDocument = Credit & Document;

@Schema({ timestamps: true })
export class Credit {
  @Prop({ required: true, type: Types.ObjectId, ref: "User" })
  userId: Types.ObjectId;

  @Prop({ default: 0 })
  token: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: "Voucher" }] })
  vouchers: Types.ObjectId[];
}

export const CreditSchema = SchemaFactory.createForClass(Credit);
