import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class CategoryCV extends Document {
  @Prop({ required: true, unique: true })
  name: string; // Tên danh mục, ví dụ: "IT", "Marketing"

  @Prop()
  description?: string; // Mô tả thêm
}

export const CategoryCVSchema = SchemaFactory.createForClass(CategoryCV);
