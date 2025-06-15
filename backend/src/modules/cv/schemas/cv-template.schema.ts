import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class CvTemplate extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ default: false })
  isRecommended: boolean;

  @Prop({ type: Object })
  data: Record<string, any>;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const CvTemplateSchema = SchemaFactory.createForClass(CvTemplate); 