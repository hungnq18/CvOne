import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ApplyJobDocument = ApplyJob & Document;

@Schema({ timestamps: true })
export class ApplyJob {
  @Prop({ type: Types.ObjectId, ref: "Job", required: true })
  jobId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Cv", required: false })
  cvId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "CoverLetter", required: false })
  coverletterId?: Types.ObjectId;

  @Prop({
    type: String,
    enum: ["pending", "reviewed", "approved", "rejected"],
    default: "pending",
  })
  status: string;
}

export const ApplyJobSchema = SchemaFactory.createForClass(ApplyJob);
