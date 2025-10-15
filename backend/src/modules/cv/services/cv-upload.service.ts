import { Injectable, Logger } from "@nestjs/common";
import { CvPdfCloudService } from "../cv-pdf-cloud.service";
import { CvUploadValidator } from "../validators/cv-upload.validator";
import { CvAnalysisService } from "./cv-analysis.service";
import { CvContentGenerationService } from "./cv-content-generation.service";
import { JobAnalysisService } from "./job-analysis.service";

@Injectable()
export class CvUploadService {
  private readonly logger = new Logger(CvUploadService.name);

  constructor(
    private readonly cvAnalysisService: CvAnalysisService,
    private readonly cvContentGenerationService: CvContentGenerationService,
    private readonly jobAnalysisService: JobAnalysisService,
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
        this.cvAnalysisService.analyzeCvContent(cvText),
        this.jobAnalysisService.analyzeJobDescription(jobDescription),
      ]);

      return {
        analysisResult,
        jobAnalysis,
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
        this.cvAnalysisService.analyzeCvContent(cvText),
        this.jobAnalysisService.analyzeJobDescription(jobDescription),
      ]);

      return {
        analysisResult,
        jobAnalysis,
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
