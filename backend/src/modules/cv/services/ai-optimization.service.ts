import { Injectable, Logger } from '@nestjs/common';
import { CvAiService } from '../cv-ai.service';

@Injectable()
export class AiOptimizationService {
  private readonly logger = new Logger(AiOptimizationService.name);
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second

  constructor(private readonly cvAiService: CvAiService) {}

  /**
   * Analyze CV content with retry mechanism
   */
  async analyzeCvContentWithRetry(cvText: string): Promise<any> {
    return this.retryOperation(
      () => this.cvAiService.analyzeCvContent(cvText),
      'analyzeCvContent'
    );
  }

  /**
   * Analyze job description with retry mechanism
   */
  async analyzeJobDescriptionWithRetry(jobDescription: string): Promise<any> {
    return this.retryOperation(
      () => this.cvAiService.getOpenAiService().analyzeJobDescription(jobDescription),
      'analyzeJobDescription'
    );
  }

  /**
   * Generate optimized CV with retry mechanism
   */
  async generateOptimizedCvWithRetry(
    analysisResult: any,
    jobAnalysis: any,
    additionalRequirements?: string
  ): Promise<any> {
    return this.retryOperation(
      () => this.cvAiService.generateOptimizedCvWithAI(
        analysisResult,
        jobAnalysis,
        additionalRequirements
      ),
      'generateOptimizedCv'
    );
  }

  /**
   * Process CV upload with parallel AI calls for better performance
   */
  async processCvUploadOptimized(
    cvText: string,
    jobDescription: string,
    additionalRequirements?: string
  ): Promise<{
    analysisResult: any;
    jobAnalysis: any;
    optimizedCv: any;
  }> {
    try {
      // Run AI analysis in parallel for better performance
      const [analysisResult, jobAnalysis] = await Promise.all([
        this.analyzeCvContentWithRetry(cvText),
        this.analyzeJobDescriptionWithRetry(jobDescription)
      ]);

      // Generate optimized CV after both analyses are complete
      const optimizedCv = await this.generateOptimizedCvWithRetry(
        analysisResult,
        jobAnalysis,
        additionalRequirements
      );

      return {
        analysisResult,
        jobAnalysis,
        optimizedCv
      };
    } catch (error) {
      this.logger.error(`Error in processCvUploadOptimized: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retry operation with exponential backoff
   */
  private async retryOperation<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.logger.debug(`${operationName} attempt ${attempt}`);
        return await operation();
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`${operationName} attempt ${attempt} failed: ${error.message}`);
        
        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1);
          this.logger.debug(`Retrying ${operationName} in ${delay}ms`);
          await this.sleep(delay);
        }
      }
    }
    
    this.logger.error(`${operationName} failed after ${this.maxRetries} attempts`);
    throw lastError || new Error(`${operationName} failed after ${this.maxRetries} attempts`);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
