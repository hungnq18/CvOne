import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Account' })
  account_id: Types.ObjectId;

  @Prop({ required: true })
  first_name: string; // Sửa String -> string

  @Prop({ required: true })
  last_name: string; // Sửa String -> string

  @Prop({ required: true })
  phone: number; // Thêm required nếu muốn bắt buộc

  @Prop()
  city: string; // Sửa String -> string

  @Prop()
  country: string; // Sửa String -> string
}

export const UserSchema = SchemaFactory.createForClass(User);
