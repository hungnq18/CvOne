import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AccountDocument = Account & Document;

@Schema({ timestamps: true })
export class Account {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 'user' })
  role: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ type: String, nullable: true })
  emailVerificationToken: string | null;

  @Prop({ type: Date, nullable: true })
  emailVerificationTokenExpires: Date | null;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  refreshToken?: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const AccountSchema = SchemaFactory.createForClass(Account); 