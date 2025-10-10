import { Injectable, Logger } from "@nestjs/common";
import { CvAiService } from "../cv-ai.service";
import { CvPdfCloudService } from "../cv-pdf-cloud.service";
import { CvUploadValidator } from "../validators/cv-upload.validator";

@Injectable()
export class CvUploadService {
  private readonly logger = new Logger(CvUploadService.name);

  constructor(
    private readonly cvAiService: CvAiService,
    private readonly cvPdfCloudService: CvPdfCloudService
  ) {}

  /**
   * Upload and analyze CV with comprehensive validation
   */
  async uploadAndAnalyzeCv(
    file: any,
    jobDescription: string,
    additionalRequirements?: string
  ) {
    // Validate inputs
    CvUploadValidator.validateFile(file);
    CvUploadValidator.validateJobDescription(jobDescription);

    // Extract and validate PDF text
    const cvText = await CvUploadValidator.validateAndExtractText(file);

    try {
      // Process with AI in parallel for better performance
      const [analysisResult, jobAnalysis] = await Promise.all([
        this.cvAiService.analyzeCvContent(cvText),
        this.cvAiService
          .getOpenAiService()
          .analyzeJobDescription(jobDescription),
      ]);

      // Generate optimized CV
      const optimizedCv = await this.cvAiService.generateOptimizedCvWithAI(
        analysisResult,
        jobAnalysis,
        additionalRequirements
      );

      return {
        analysisResult,
        jobAnalysis,
        optimizedCv,
      };
    } catch (error) {
      this.logger.error(
        `Error in uploadAndAnalyzeCv: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Upload CV to cloud storage and analyze with comprehensive validation
   */
  async uploadCvToCloudAndAnalyze(
    file: any,
    jobDescription: string,
    userId: string,
    additionalRequirements?: string
  ) {
    // Validate inputs
    CvUploadValidator.validateFile(file);
    CvUploadValidator.validateJobDescription(jobDescription);

    // Extract and validate PDF text
    const cvText = await CvUploadValidator.validateAndExtractText(file);

    try {
      // Upload original CV to cloud storage
      const cvTitle = `original-cv-${Date.now()}`;
      const uploadResult = await this.cvPdfCloudService.uploadPdfToCloudinary(
        file.buffer,
        cvTitle,
        userId
      );

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Failed to upload CV to cloud");
      }

      // Process with AI in parallel for better performance
      const [analysisResult, jobAnalysis] = await Promise.all([
        this.cvAiService.analyzeCvContent(cvText),
        this.cvAiService
          .getOpenAiService()
          .analyzeJobDescription(jobDescription),
      ]);

      // Generate optimized CV
      const optimizedCv = await this.cvAiService.generateOptimizedCvWithAI(
        analysisResult,
        jobAnalysis,
        additionalRequirements
      );

      return {
        analysisResult,
        jobAnalysis,
        optimizedCv,
        originalCvUrl: uploadResult.shareUrl,
      };
    } catch (error) {
      this.logger.error(
        `Error in uploadCvToCloudAndAnalyze: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }
}
