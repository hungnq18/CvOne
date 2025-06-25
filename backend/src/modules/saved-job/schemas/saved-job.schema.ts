import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type SavedJobDocument = SavedJob & Document;

@Schema({ timestamps: true })
export class SavedJob {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId; // Người dùng đã lưu job

  @Prop({ type: Types.ObjectId, ref: "Job", required: true })
  jobId: Types.ObjectId; // Job được lưu
}

export const SavedJobSchema = SchemaFactory.createForClass(SavedJob);
