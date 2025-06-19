import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class Conversation extends Document {
  @Prop({ type: [Types.ObjectId], ref: "User" })
  participants: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: "Message" })
  lastMessage?: Types.ObjectId;

  @Prop({
    type: [
      {
        userId: { type: Types.ObjectId, ref: "User", required: true },
        count: { type: Number, default: 0 },
      },
    ],
    validate: [
      (val: any[]) => val.length <= 2,
      "Only 2 participants supported",
    ],
    default: [],
  })
  unreadCount: { userId: Types.ObjectId; count: number }[];
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
