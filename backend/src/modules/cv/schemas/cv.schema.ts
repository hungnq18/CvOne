import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class Cv extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: "User" })
  userId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: "CvTemplate" })
  cvTemplateId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({
    required: true,
    type: {
      userData: {
        firstName: { type: String },
        lastName: { type: String },
        professional: { type: String },
        city: { type: String },
        country: { type: String },
        province: { type: String },
        phone: { type: String },
        email: { type: String },
        avatar: { type: String },
        summary: { type: String },
        skills: [
          {
            name: { type: String },
            rating: { type: Number },
          },
        ],
        workHistory: [
          {
            title: { type: String },
            company: { type: String },
            startDate: { type: String },
            endDate: { type: String },
            description: { type: String },
          },
        ],
        education: [
          {
            startDate: { type: String },
            endDate: { type: String },
            major: { type: String },
            degree: { type: String },
            institution: { type: String },
          },
        ],
      },
    },
  })
  content: {
    userData: {
      firstName: string;
      lastName: string;
      professional: string;
      city: string;
      country: string;
      province: string;
      phone: string;
      email: string;
      avatar: string;
      summary: string;
      skills: {
        name: string;
        rating: number;
      }[];
      workHistory: {
        title: string;
        company: string;
        startDate: string;
        endDate: string;
        description: string;
      }[];
      education: {
        startDate: string;
        endDate: string;
        major: string;
        degree: string;
        institution: string;
      }[];
    };
  };

  @Prop({ default: false })
  isPublic: boolean;

  @Prop({ default: false })
  isSaved: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const CvSchema = SchemaFactory.createForClass(Cv);
