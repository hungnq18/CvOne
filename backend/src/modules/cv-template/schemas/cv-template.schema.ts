import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
/**s
 * Schema definition for CV Template
 * Represents the structure of a CV template in the database
 */
@Schema({ timestamps: true })
export class CvTemplate extends Document {
  /**
   * Title of the CV template
   * @example "Professional CV Template"
   */
  @Prop({ required: true })
  title: string;

  /**
   * URL to the preview image of the template
   * @example "https://example.com/template1.jpg"
   */
  @Prop({ required: true })
  imageUrl: string;

  /**
   * Flag indicating if this template is recommended
   * Used to highlight featured templates
   */
  @Prop({ default: false })
  isRecommended: boolean;

  /**
   * Template data structure
   * Contains the actual template configuration and layout
   * @example { sections: [...], layout: {...} }
   */
  @Prop({ type: Object, required: true })
  data: Record<string, any>;
}

export const CvTemplateSchema = SchemaFactory.createForClass(CvTemplate);
