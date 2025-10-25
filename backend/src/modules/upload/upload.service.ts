import { Injectable, Logger } from "@nestjs/common";
import { CvPdfCloudService } from "../cv/cv-pdf-cloud.service";

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private readonly cvPdfCloudService: CvPdfCloudService) {}

  saveFile(file) {
    return {
      originalname: file.originalname,
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  /**
   * Save file to cloud storage instead of local storage
   */
  async saveFileToCloud(file: any, userId: string) {
    try {
      // Determine file type and create appropriate title
      const isPdf = file.mimetype === 'application/pdf';
      const fileTitle = isPdf ? `document-${Date.now()}` : `file-${Date.now()}`;
      
      if (isPdf) {
        // Upload PDF to cloud storage
        const uploadResult = await this.cvPdfCloudService.uploadPdfToCloudinary(
          file.buffer,
          fileTitle,
          userId
        );

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Failed to upload PDF to cloud');
        }

        return {
          originalname: file.originalname,
          filename: file.filename,
          path: uploadResult.shareUrl,
          cloudUrl: uploadResult.shareUrl,
          size: file.size,
          mimetype: file.mimetype,
          uploadedToCloud: true,
        };
      } else {
        // For non-PDF files, we'll still use local storage for now
        // but you can extend this to use other cloud services
        return this.saveFile(file);
      }
    } catch (error) {
      this.logger.error(`Error uploading file to cloud: ${error.message}`);
      throw error;
    }
  }
}
