import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CvTemplateDocument = CvTemplate & Document;

@Schema({ timestamps: true })
export class CvTemplate {
    _id: Types.ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    password: string;

    @Prop({ type: String, required: true })
    description: string;

    @Prop({ type: String, required: true })
    previewImgUrl: string;

    @Prop({ type: String, required: true })
    themeColor: string | null;

    @Prop({ type: String, required: true, default: 'en' })
    supportedLanguages: string;

    @Prop({ default: false })
    status: boolean;

    @Prop({ default: Date.now })
    createdAt: Date;

    @Prop({ default: Date.now })
    updatedAt: Date;

    @Prop({ type: String, required: true })
    category_CV: string;

    @Prop({ type: String, required: true })
    popular_score: string;
}

export const CvTemplateSchema = SchemaFactory.createForClass(CvTemplate); 