import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class CoverLetter extends Document {
  @Prop({ type: Types.ObjectId, ref: "User" })
  userId: string;

  @Prop({ type: Types.ObjectId, ref: "ClTemplate" })
  templateId: string;

  @Prop({ required: true })
  templateName: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, type: Object })
  data: Record<string, any>;
}

export const CoverLetterSchema = SchemaFactory.createForClass(CoverLetter);
