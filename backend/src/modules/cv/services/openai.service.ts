import { Injectable } from "@nestjs/common";
import { CvAnalysisService } from "./cv-analysis.service";
import { CvContentGenerationService } from "./cv-content-generation.service";
import { JobAnalysisService } from "./job-analysis.service";
import { OpenaiApiService } from "./openai-api.service";
import { VietnameseContentService } from "./vietnamese-content.service";

@Injectable()
export class OpenAiService {
  constructor(
    private jobAnalysisService: JobAnalysisService,
    private cvContentGenerationService: CvContentGenerationService,
    private cvAnalysisService: CvAnalysisService,
    private vietnameseContentService: VietnameseContentService,
    private openaiApiService: OpenaiApiService
  ) {}

  // Job Analysis methods
  async analyzeJobDescription(jobDescription: string) {
    return this.jobAnalysisService.analyzeJobDescription(jobDescription);
  }

  // CV Content Generation methods
  async generateProfessionalSummary(
    userProfile: any,
    jobAnalysis: any,
    additionalRequirements?: string,
    userId?: string
  ) {
    return this.cvContentGenerationService.generateProfessionalSummary(
      userProfile,
      jobAnalysis,
      additionalRequirements,
      userId
    );
  }

  async generateWorkExperience(jobAnalysis: any, experienceLevel: string) {
    return this.cvContentGenerationService.generateWorkExperience(
      jobAnalysis,
      experienceLevel
    );
  }

  async generateSkillsSection(
    jobAnalysis: any,
    userSkills?: Array<{ name: string; rating: number }>
  ) {
    return this.cvContentGenerationService.generateSkillsSection(
      jobAnalysis,
      userSkills
    );
  }

  // CV Analysis methods
  async analyzeCvContent(cvText: string) {
    return this.cvAnalysisService.analyzeCvContent(cvText);
  }

  async rewriteWorkDescription(description: string, language?: string) {
    return this.cvAnalysisService.rewriteWorkDescription(description, language);
  }

  // Vietnamese Content methods
  async generateProfessionalSummaryVi(
    jobAnalysis: any,
    additionalRequirements?: string
  ) {
    return this.vietnameseContentService.generateProfessionalSummaryVi(
      jobAnalysis,
      additionalRequirements
    );
  }

  async generateProfessionalSummariesVi(
    jobAnalysis: any,
    additionalRequirements?: string,
    count: number = 3
  ) {
    return this.vietnameseContentService.generateProfessionalSummariesVi(
      jobAnalysis,
      additionalRequirements,
      count
    );
  }

  // API Status methods
  async checkApiStatus() {
    return this.openaiApiService.checkApiStatus();
  }

  getOpenAiService() {
    return this;
  }
  public async translateCvContent(
    content: any,
    uiTexts: Record<string, string> = {},
    targetLanguage: string
  ): Promise<any> {
    return this.cvContentGenerationService.translateCvContent(
      content,
      uiTexts,
      targetLanguage
    );
  }
  getOpenAI() {
    return this.openaiApiService.getOpenAI();
  }
}
