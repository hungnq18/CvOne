import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Banner extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  redirectUrl?: string;
  @Prop({ required: true })
  imageUrl?: string;
  @Prop({ required: true, enum: ["top", "bottom", "center", "left", "right"] })
  position?: string;
  @Prop({ required: true })
  startDate?: Date;
  @Prop({ required: true })
  endDate?: Date;
  @Prop({ default: true })
  isActive?: boolean;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);
