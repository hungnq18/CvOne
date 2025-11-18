import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Cv extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'CvTemplate' })
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
      careerObjective: { type: String },
      Project: {
        type: [
          {
            title: { type: String },
            summary: { type: String },
            startDate: { type: Date },
            endDate: { type: Date },
            tags: [{ type: String }],
          },
        ],
        default: [],
      },
      certification: {
        type: [
          {
            title: { type: String },
            organization: { type: String },
            issuedDate: { type: Date },
            expiryDate: { type: Date },
            credentialId: { type: String },
          },
        ],
        default: [],
      },
      achievement: {
        type: [
          {
            title: { type: String },
            description: { type: String },
            date: { type: Date },
          },
        ],
        default: [],
      },
      hobby: { type: [{ type: String }], default: [] },
      sectionPositions: {
        type: Map,
        of: {
          place: { type: Number },
          order: { type: Number },
        },
        default: {},
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
    careerObjective?: string;
    Project?: {
      title: string;
      summary: string;
      startDate?: Date;
      endDate?: Date;
      tags?: string[];
    }[];
    certification?: {
      title: string;
      organization?: string;
      issuedDate?: Date;
      expiryDate?: Date;
      credentialId?: string;
    }[];
    achievement?: {
      title: string;
      description?: string;
      date?: Date;
    }[];
    hobby?: string[];
    sectionPositions?: Record<
      string,
      {
        place?: number;
        order?: number;
      }
    >;
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