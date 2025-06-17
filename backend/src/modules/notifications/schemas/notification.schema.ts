// src/notifications/schemas/notification.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, required: true, ref: "User" })
  recipient: Types.ObjectId; // Người nhận thông báo

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String })
  message: string;

  @Prop({ type: String })
  type: string; // ví dụ: "info", "warning", "chat", "order", v.v.

  @Prop({ type: Boolean, default: false })
  isRead: boolean;

  @Prop({ type: String }) // Ví dụ: URL liên kết tới hành động
  link?: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
