import { Injectable, Logger } from "@nestjs/common";
import { CvAiService } from "../cv-ai.service";
import { CvUploadValidator } from "../validators/cv-upload.validator";

@Injectable()
export class CvUploadService {
  private readonly logger = new Logger(CvUploadService.name);

  constructor(private readonly cvAiService: CvAiService) {}

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
}
