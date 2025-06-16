import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class Conversation extends Document {
  @Prop({ type: [Types.ObjectId], ref: "User" })
  participants: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: "Message" })
  lastMessage?: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  unreadCount: number;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
