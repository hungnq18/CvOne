import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ApplyJobDocument = ApplyJob & Document;

@Schema({ timestamps: true })
export class ApplyJob {
  @Prop({ type: Types.ObjectId, ref: "Job", required: true })
  jobId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Cv" })
  cvId?: Types.ObjectId;

  @Prop({ type: String })
  cvUrl?: string;

  @Prop({ type: Types.ObjectId, ref: "CoverLetter" })
  coverletterId?: Types.ObjectId;

  @Prop({ type: String })
  coverletterUrl?: string;

  @Prop({
    type: String,
    enum: ["pending", "reviewed", "approved", "rejected"],
    default: "pending",
  })
  status: string;
}

export const ApplyJobSchema = SchemaFactory.createForClass(ApplyJob);

// Thêm pre-validate hook để kiểm tra ít nhất một trong cvId hoặc cvUrl, và coverletterId hoặc coverletterUrl
ApplyJobSchema.pre("validate", function (next) {
  if (!this.cvId && !this.cvUrl) {
    next(new Error("Phải cung cấp ít nhất cvId hoặc cvUrl"));
  }
  if (!this.coverletterId && !this.coverletterUrl) {
    next(new Error("Phải cung cấp ít nhất coverletterId hoặc coverletterUrl"));
  }
  next();
});
