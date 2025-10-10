import { Injectable, Logger } from '@nestjs/common';
import * as cloudinary from 'cloudinary';

@Injectable()
export class CvPdfCloudService {
  private readonly logger = new Logger(CvPdfCloudService.name);

  constructor() {
    // Configure Cloudinary
    cloudinary.v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  /**
   * Upload PDF buffer to Cloudinary
   * @param pdfBuffer - PDF buffer to upload
   * @param cvTitle - CV title for naming
   * @param userId - User ID for folder organization
   * @returns Upload result with shareUrl
   */
  async uploadPdfToCloudinary(
    pdfBuffer: Buffer,
    cvTitle: string,
    userId: string,
  ): Promise<{ success: boolean; shareUrl?: string; error?: string }> {
    try {
      // Convert buffer to base64 string for Cloudinary upload
      const base64String = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedTitle = cvTitle.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `cv_${sanitizedTitle}_${timestamp}`;

      // Upload to Cloudinary
      const result = await cloudinary.v2.uploader.upload(base64String, {
        resource_type: 'raw',
        folder: `cv-pdfs/${userId}`,
        public_id: filename,
        format: 'pdf',
        tags: ['cv', 'pdf', userId],
      });

      this.logger.log(`PDF uploaded successfully to Cloudinary: ${result.secure_url}`);

      return {
        success: true,
        shareUrl: result.secure_url,
      };
    } catch (error: unknown) {
      this.logger.error('Error uploading to Cloudinary:', error);
      const errMsg =
        error instanceof Error
          ? error.message
          : 'Failed to upload to Cloudinary';
      return {
        success: false,
        error: errMsg,
      };
    }
  }

  /**
   * Upload PDF from base64 string to Cloudinary
   * @param pdfBase64 - Base64 encoded PDF string
   * @param cvTitle - CV title for naming
   * @param userId - User ID for folder organization
   * @returns Upload result with shareUrl
   */
  async uploadPdfFromBase64(
    pdfBase64: string,
    cvTitle: string,
    userId: string,
  ): Promise<{ success: boolean; shareUrl?: string; error?: string }> {
    try {
      // Ensure the base64 string has the proper data URL format
      const base64String = pdfBase64.startsWith('data:')
        ? pdfBase64
        : `data:application/pdf;base64,${pdfBase64}`;

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedTitle = cvTitle.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `cv_${sanitizedTitle}_${timestamp}`;

      // Upload to Cloudinary
      const result = await cloudinary.v2.uploader.upload(base64String, {
        resource_type: 'raw',
        folder: `cv-pdfs/${userId}`,
        public_id: filename,
        format: 'pdf',
        tags: ['cv', 'pdf', userId],
      });

      this.logger.log(`PDF uploaded successfully to Cloudinary: ${result.secure_url}`);

      return {
        success: true,
        shareUrl: result.secure_url,
      };
    } catch (error: unknown) {
      this.logger.error('Error uploading to Cloudinary:', error);
      const errMsg =
        error instanceof Error
          ? error.message
          : 'Failed to upload to Cloudinary';
      return {
        success: false,
        error: errMsg,
      };
    }
  }

  /**
   * Delete PDF from Cloudinary
   * @param publicId - The public ID of the file to delete
   * @returns Deletion result
   */
  async deletePdfFromCloudinary(
    publicId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await cloudinary.v2.uploader.destroy(publicId, {
        resource_type: 'raw',
      });

      this.logger.log(`PDF deleted successfully from Cloudinary: ${publicId}`);

      return {
        success: true,
      };
    } catch (error: unknown) {
      this.logger.error('Error deleting from Cloudinary:', error);
      const errMsg =
        error instanceof Error
          ? error.message
          : 'Failed to delete from Cloudinary';
      return {
        success: false,
        error: errMsg,
      };
    }
  }

  /**
   * Get Cloudinary configuration status
   * @returns Configuration status
   */
  getCloudinaryConfig(): { configured: boolean; cloudName?: string } {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    return {
      configured: !!cloudName,
      cloudName,
    };
  }
}
