import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ type: Types.ObjectId, required: true, ref: "Account" })
  account_id: Types.ObjectId;

  @Prop({ required: true, type: String })
  first_name: string;

  @Prop({ required: true, type: String })
  last_name: string;

  @Prop({ type: Number })
  phone: number;

  @Prop({ type: String, default: "" })
  city: string;

  @Prop({ type: String, default: "" })
  country: string;
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
