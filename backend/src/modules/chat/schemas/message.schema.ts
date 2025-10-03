import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ type: Types.ObjectId, ref: "Conversation" })
  conversationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User" })
  receiverId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User" })
  senderId: Types.ObjectId;

  @Prop()
  content: string;
  @Prop({
    type: {
      title: { type: String },
      imageUrl: { type: String },
    },
    default: null,
  })
  templateData?: {
    title?: string;
    imageUrl?: string;
  };

  @Prop({ type: [Types.ObjectId], default: [] })
  readBy: Types.ObjectId[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);
