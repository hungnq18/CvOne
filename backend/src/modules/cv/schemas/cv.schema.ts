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

  @Prop({ required: true, type: Object })
  content: Record<string, any>;

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