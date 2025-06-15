import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CvTemplateDocument = CvTemplate & Document;

@Schema({ timestamps: true })
export class CvTemplate {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    imageUrl: string;

    @Prop({ default: false })
    isRecommended?: boolean;

    @Prop({ type: Object })
    data?: Record<string, any>;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const CvTemplateSchema = SchemaFactory.createForClass(CvTemplate); 