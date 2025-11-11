import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, type: Types.ObjectId, ref: "User" })
  userId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: "Voucher" })
  voucherId: Types.ObjectId;
  @Prop({ required: true })
  totalToken: number;
  @Prop({ required: true })
  price: number;
  @Prop()
  discountAmount: number;
  @Prop()
  totalAmount: number;
  @Prop({ required: true, enum: ["pending", "completed", "cancelled"] })
  status: string;
  @Prop({ required: true })
  paymentMethod: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
