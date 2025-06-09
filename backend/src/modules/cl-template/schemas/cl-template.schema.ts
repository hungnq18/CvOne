import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ClTemplateDocument = ClTemplate & Document;

@Schema({ timestamps: true })
export class ClTemplate {
    _id: Type.ObjectId;

    @Prop({ required: true })
    name: string;

    

}

export const ClTemplateSchema = SchemaFactory.createForClass(ClTemplate);