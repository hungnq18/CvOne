import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class CoverLetter extends Document {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: string;

  @Prop({ type: Types.ObjectId, ref: "ClTemplate", required: true })
  templateId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, type: Object })
  data: Record<string, any>;

  @Prop({ type: Boolean, default: false })
  isSaved: boolean;
}

export const CoverLetterSchema = SchemaFactory.createForClass(CoverLetter);
