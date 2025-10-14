import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CvTemplate } from "../cv-template/schemas/cv-template.schema";
import { CreateCvDto } from "./dto/create-cv.dto";
import { Cv } from "./schemas/cv.schema";
import { CvCacheService } from "./services/cv-cache.service";
import { CvPdfService } from "./cv-pdf.service";
import { MailService } from "../mail/mail.service";
import * as cloudinary from "cloudinary";

@Injectable()
export class CvService {
  constructor(
    @InjectModel(Cv.name) private cvModel: Model<Cv>,
    @InjectModel(CvTemplate.name) private cvTemplateModel: Model<CvTemplate>,
    private cvCacheService: CvCacheService,
    private cvPdfService: CvPdfService,
    private mailService: MailService,
  ) {
    // Configure Cloudinary
    cloudinary.v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async getAllCVs(userId: string): Promise<Cv[]> {
    return this.cvCacheService.getCachedCVs(userId);
  }

  async getCVById(id: string, userId: string): Promise<Cv> {
    const cv = await this.cvCacheService.getCachedCV(id, userId);
    if (!cv) {
      throw new NotFoundException("CV not found");
    }
    return cv;
  }

  /**
   * Create a new CV
   * @param createCvDto - The CV data
   * @param userId - The ID of the user creating the CV
   */
  async createCV(createCvDto: CreateCvDto, userId: string) {
    // Check if template exists
    const template = await this.cvTemplateModel.findById(
      createCvDto.cvTemplateId,
    );
    if (!template) {
      throw new NotFoundException("CV template not found");
    }

    const newCV = new this.cvModel({
      ...createCvDto,
      userId,
      isPublic: false,
      isSaved: false,
    });

    const savedCV = await newCV.save();

    // Invalidate cache for this user
    this.cvCacheService.invalidateUserCache(userId);

    return savedCV;
  }

  async updateCV(id: string, userId: string, data: Partial<Cv>): Promise<Cv> {
    const cv = await this.cvModel
      .findOneAndUpdate({ _id: id, userId }, { $set: data }, { new: true })
      .exec();
    if (!cv) {
      throw new NotFoundException("CV not found");
    }

    // Invalidate cache for this CV
    this.cvCacheService.invalidateCVCache(id, userId);

    return cv;
  }

  async deleteCV(id: string, userId: string): Promise<void> {
    const result = await this.cvModel.deleteOne({ _id: id, userId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException("CV not found");
    }
  }

  /**
   * Save a CV
   * @param cvId - The ID of the CV to save
   * @param userId - The ID of the user saving the CV
   */
  async saveCV(cvId: string, userId: string) {
    const cv = await this.cvModel.findById(cvId);
    if (!cv) {
      throw new NotFoundException("CV not found");
    }

    // Check if user has permission to save this CV
    if (cv.userId.toString() !== userId) {
      throw new UnauthorizedException(
        "You do not have permission to save this CV",
      );
    }

    cv.isSaved = true;
    await cv.save();

    return { message: "CV saved successfully" };
  }

  /**
   * Unsave a CV
   * @param cvId - The ID of the CV to unsave
   * @param userId - The ID of the user unsaving the CV
   */
  async unsaveCV(cvId: string, userId: string) {
    const cv = await this.cvModel.findById(cvId);
    if (!cv) {
      throw new NotFoundException("CV not found");
    }

    // Check if user has permission to unsave this CV
    if (cv.userId.toString() !== userId) {
      throw new UnauthorizedException(
        "You do not have permission to unsave this CV",
      );
    }

    cv.isSaved = false;
    await cv.save();

    return { message: "CV unsaved successfully" };
  }

  /**
   * Share a CV (make it public)
   * @param cvId - The ID of the CV to share
   * @param userId - The ID of the user sharing the CV
   */
  async shareCV(cvId: string, userId: string) {
    const cv = await this.cvModel.findById(cvId);
    if (!cv) {
      throw new NotFoundException("CV not found");
    }

    // Check if user has permission to share this CV
    if (cv.userId.toString() !== userId) {
      throw new UnauthorizedException(
        "You do not have permission to share this CV",
      );
    }

    cv.isPublic = true;
    await cv.save();

    return { message: "CV shared successfully" };
  }

  /**
   * Unshare a CV (make it private)
   * @param cvId - The ID of the CV to unshare
   * @param userId - The ID of the user unsharing the CV
   */
  async unshareCV(cvId: string, userId: string) {
    const cv = await this.cvModel.findById(cvId);
    if (!cv) {
      throw new NotFoundException("CV not found");
    }

    // Check if user has permission to unshare this CV
    if (cv.userId.toString() !== userId) {
      throw new UnauthorizedException(
        "You do not have permission to unshare this CV",
      );
    }

    cv.isPublic = false;
    await cv.save();

    return { message: "CV unshared successfully" };
  }

  /**
   * Get all saved CVs for a user
   * @param userId - The ID of the user
   */
  async getSavedCVs(userId: string) {
    return this.cvCacheService.getCachedCVs(userId, true);
  }

  async getAllTemplates(): Promise<CvTemplate[]> {
    return this.cvTemplateModel.find().exec();
  }

  async getTemplateById(id: string): Promise<CvTemplate> {
    const template = await this.cvTemplateModel.findById(id).exec();
    if (!template) {
      throw new NotFoundException("Template not found");
    }
    return template;
  }

  /**
   * Generate PDF from CV and upload to Cloudinary
   * @param cvId - The ID of the CV to generate PDF from
   * @param userId - The ID of the user
   * @returns Object containing shareUrl
   */
  async generatePdfAndUploadToCloudinary(
    cvId: string,
    userId: string,
    pdfBase64: string,
  ): Promise<{ success: boolean; shareUrl?: string; error?: string }> {
    try {
      // 1. Get CV data from database
      const cv = await this.getCVById(cvId, userId);
      if (!cv) {
        throw new NotFoundException("CV not found");
      }

      // 2. Use provided base64 PDF from frontend
      const pdfBuffer = Buffer.from(pdfBase64, "base64");

      // 3. Upload PDF to Cloudinary
      const uploadResult = await this.uploadPdfToCloudinary(
        pdfBuffer,
        cv.title,
        userId,
      );

      if (!uploadResult.success) {
        throw new Error(
          uploadResult.error || "Failed to upload PDF to Cloudinary",
        );
      }

      return {
        success: true,
        shareUrl: uploadResult.shareUrl,
      };
    } catch (error: unknown) {
      console.error("Error in generatePdfAndUploadToCloudinary:", error);
      const errMsg =
        error instanceof Error
          ? error.message
          : "Failed to generate and upload PDF";
      return {
        success: false,
        error: errMsg,
      };
    }
  }

  /**
   * Upload PDF buffer to Cloudinary
   * @param pdfBuffer - PDF buffer to upload
   * @param cvTitle - CV title for naming
   * @param userId - User ID for folder organization
   * @returns Upload result with shareUrl
   */
  private async uploadPdfToCloudinary(
    pdfBuffer: Buffer,
    cvTitle: string,
    userId: string,
  ): Promise<{ success: boolean; shareUrl?: string; error?: string }> {
    try {
      // Convert buffer to base64 string for Cloudinary upload
      const base64String = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedTitle = cvTitle.replace(/[^a-zA-Z0-9]/g, "_");
      const filename = `cv_${sanitizedTitle}_${timestamp}`;

      // Upload to Cloudinary
      const result = await cloudinary.v2.uploader.upload(base64String, {
        resource_type: "raw",
        folder: `cv-pdfs/${userId}`,
        public_id: filename,
        format: "pdf",
        tags: ["cv", "pdf", userId],
      });

      return {
        success: true,
        shareUrl: result.secure_url,
      };
    } catch (error: unknown) {
      console.error("Error uploading to Cloudinary:", error);
      const errMsg =
        error instanceof Error
          ? error.message
          : "Failed to upload to Cloudinary";
      return {
        success: false,
        error: errMsg,
      };
    }
  }

  /**
   * Generate PDF from CV and send via email
   * @param cvId - The ID of the CV to generate PDF from
   * @param userId - The ID of the user
   * @param recipientEmail - Email address to send the PDF to
   * @returns Object containing success status
   */
  async generatePdfAndSendEmail(
    cvId: string,
    userId: string,
    recipientEmail: string,
    pdfBase64: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // 1. Get CV data from database
      const cv = await this.getCVById(cvId, userId);
      if (!cv) {
        throw new NotFoundException("CV not found");
      }

      // 2. Use provided base64 from frontend
      const pdfBuffer = Buffer.from(pdfBase64, "base64");

      // 3. Send PDF via email
      await this.mailService.sendCvPdfEmail(
        recipientEmail,
        pdfBuffer,
        cv.title,
      );

      return { success: true };
    } catch (error: unknown) {
      console.error("Error in generatePdfAndSendEmail:", error);
      const errMsg =
        error instanceof Error
          ? error.message
          : "Failed to generate PDF and send email";
      return {
        success: false,
        error: errMsg,
      };
    }
  }
}
