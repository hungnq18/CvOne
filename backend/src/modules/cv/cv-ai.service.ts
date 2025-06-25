import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CvTemplate } from "../cv-template/schemas/cv-template.schema";
import { User } from "../users/schemas/user.schema";
import { GenerateCvDto } from "./dto/generate-cv.dto";
import { OpenAiService } from "./openai.service";
import { CreateGenerateCoverLetterDto } from "../cover-letter/dto/create-generate-cl-ai.dto";

@Injectable()
export class CvAiService {
  private readonly logger = new Logger(CvAiService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(CvTemplate.name) private cvTemplateModel: Model<CvTemplate>,
    private openAiService: OpenAiService
  ) {}

  /**
   * Generate CV content based on user profile and job analysis
   */
  private async generateCvContent(
    user: User,
    jobAnalysis: any,
    additionalRequirements?: string
  ): Promise<any> {
    // Generate professional summary using OpenAI
    const summary = await this.openAiService.generateProfessionalSummary(
      user,
      jobAnalysis,
      additionalRequirements
    );

    // Generate skills section using OpenAI
    const skills = await this.openAiService.generateSkillsSection(jobAnalysis);

    // Generate work experience using OpenAI
    const workHistory = await this.openAiService.generateWorkExperience(
      jobAnalysis,
      jobAnalysis.experienceLevel
    );

    // Generate education
    const education = this.generateEducation(user);

    return {
      userData: {
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        professional: this.generateProfessionalTitle(jobAnalysis),
        city: user.city || "",
        country: user.country || "",
        province: user.city || "",
        phone: user.phone?.toString() || "",
        email: "", // Will be filled from account
        avatar: "",
        summary,
        skills,
        workHistory,
        education: [education],
      },
    };
  }

  private generateEducation(user: User): any {
    return {
      startDate: "2016-09-01",
      endDate: "2020-06-30",
      major: "Computer Science",
      degree: "Bachelor",
      institution: "University",
    };
  }

  private generateProfessionalTitle(jobAnalysis: any): string {
    const titles = {
      senior: "Senior Software Developer",
      "mid-level": "Software Developer",
      junior: "Junior Software Developer",
    };
    return titles[jobAnalysis.experienceLevel] || "Software Developer";
  }

  /**
   * Check OpenAI API status
   */
  async checkOpenAiStatus() {
    return this.openAiService.checkApiStatus();
  }

  /**
   * Main method to generate AI-powered CV
   */
  async generateCvWithAI(
    userId: string,
    generateCvDto: GenerateCvDto
  ): Promise<any> {
    try {
      // Get user profile
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Analyze job description using OpenAI
      const jobAnalysis = await this.openAiService.analyzeJobDescription(
        generateCvDto.jobDescription
      );

      // Generate CV content using OpenAI
      const cvContent = await this.generateCvContent(
        user,
        jobAnalysis,
        generateCvDto.additionalRequirements
      );

      // Get default template if not specified
      let templateId: string | undefined = generateCvDto.cvTemplateId;
      if (!templateId) {
        const defaultTemplate = await this.cvTemplateModel.findOne();
        templateId = defaultTemplate?._id?.toString();
      }

      // Check if we're using fallback methods (indicated by basic analysis)
      const isUsingFallback =
        !jobAnalysis.softSkills || jobAnalysis.softSkills.length === 0;
      const message = isUsingFallback
        ? "CV generated using basic analysis (OpenAI quota exceeded). Please check your OpenAI billing to enable AI-powered features."
        : "CV generated successfully using AI analysis";

      return {
        success: true,
        data: {
          title:
            generateCvDto.title ||
            `AI Generated CV - ${new Date().toLocaleDateString()}`,
          cvTemplateId: templateId,
          content: cvContent,
          jobAnalysis,
          message,
          isUsingFallback,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error generating CV with AI: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }
}
