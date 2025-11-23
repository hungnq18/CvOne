import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: "Account" })
  account_id: Types.ObjectId;

  @Prop({ required: true, type: String })
  first_name: string;

  @Prop({ required: true, type: String })
  last_name: string;

  @Prop({ type: String })
  phone: string;

  @Prop({ type: String, default: "" })
  city: string;

  @Prop({ type: String, default: "" })
  country: string;

  // --- Các trường riêng cho HR ---
  @Prop()
  company_name?: string;

  @Prop()
  company_country?: string;

  @Prop()
  company_city?: string;

  @Prop()
  company_district?: string;

  @Prop()
  vatRegistrationNumber?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Drop all existing indexes except _id
UserSchema.indexes().forEach((index) => {
  if (index[1].name !== "_id_") {
    UserSchema.index(index[0], { ...index[1], background: true });
  }
});

// Add new index for account_id
UserSchema.index({ account_id: 1 }, { unique: true });
