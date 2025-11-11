import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  orderCode: number;
  @Prop({ required: true, type: Types.ObjectId, ref: "User" })
  userId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: "Voucher" })
  voucherId: Types.ObjectId;
  @Prop({ required: true })
  totalToken: number;
  @Prop({ required: true })
  price: number;
  @Prop()
  totalAmount: number;
  @Prop({ default: "pending", enum: ["pending", "completed", "cancelled"] })
  status: string;
  @Prop({ required: true })
  paymentMethod: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
