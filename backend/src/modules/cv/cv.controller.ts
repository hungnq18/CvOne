import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FileInterceptor } from "@nestjs/platform-express";
import { Model, Types } from "mongoose";
import { User } from "../../common/decorators/user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CvTemplate } from "../cv-template/schemas/cv-template.schema";
import { User as UserSchema } from "../users/schemas/user.schema";
import { CvService } from "./cv.service";
import { CreateCvDto } from "./dto/create-cv.dto";
import { GenerateCvDto } from "./dto/generate-cv.dto";
import { CvAnalysisService } from "./services/cv-analysis.service";
import { CvContentGenerationService } from "./services/cv-content-generation.service";
import { CvUploadService } from "./services/cv-upload.service";
import { JobAnalysisService } from "./services/job-analysis.service";
import { OpenAiService } from "./services/openai.service";
/**
 * Controller for handling CV (Curriculum Vitae) related requests
 * Most endpoints require authentication using JWT
 * Template endpoints are public (no authentication required)
 */
@Controller("cv")
export class CvController {
  constructor(
    private readonly cvService: CvService,
    private readonly cvUploadService: CvUploadService,
    private readonly cvAnalysisService: CvAnalysisService,
    private readonly cvContentGenerationService: CvContentGenerationService,
    private readonly jobAnalysisService: JobAnalysisService,
    private readonly openAiService: OpenAiService,
    @InjectModel(UserSchema.name) private userModel: Model<UserSchema>,
  ) { }

  /**
   * Upload and analyze CV PDF using AI
   * @param file - The uploaded PDF file
   * @param userId - The ID of the authenticated user
   * @returns Analysis results and suggestions
   * @requires Authentication
   */
  @UseGuards(JwtAuthGuard)
  @Post("upload-and-analyze")
  @UseInterceptors(
    FileInterceptor("cvFile", {
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype || !file.mimetype.includes("pdf")) {
          return cb(
            new BadRequestException("Only PDF files are allowed!"),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadAndAnalyzeCv(
    @UploadedFile() file: any,
    @Body("jobDescription") jobDescription: string,
    @Body("additionalRequirements") additionalRequirements: string,
    @User("_id") userId: string,
  ) {
    return this.cvUploadService.uploadCvToCloudAndAnalyze(
      file,
      jobDescription,
      userId,
      additionalRequirements,
    );
  }

  /**
   * Get all CVs for the authenticated user
   * @param userId - The ID of the authenticated user
   * @returns Array of user's CVs
   * @requires Authentication
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  getAll(@User("_id") userId: string) {
    return this.cvService.getAllCVs(userId);
  }

  /**
   * Get all saved CVs for the current user
   * @param userId - The ID of the authenticated user
   */
  @UseGuards(JwtAuthGuard)
  @Get("saved")
  async getSavedCVs(@User("_id") userId: string) {
    return this.cvService.getSavedCVs(userId);
  }

  /**
   * Get all available CV templates
   * @returns Array of CV templates
   * @public - No authentication required
   */
  @Get("templates")
  async getAllTemplates(): Promise<CvTemplate[]> {
    return this.cvService.getAllTemplates();
  }

  /**
   * Get a specific CV template by ID
   * @param id - The ID of the template to retrieve
   * @returns Template object
   * @public - No authentication required
   */
  @Get("templates/:id")
  async getTemplateById(@Param("id") id: string): Promise<CvTemplate> {
    return this.cvService.getTemplateById(id);
  }

  /**
   * Phân tích Job Description (JD) bằng AI, trả về kết quả phân tích
   */
  @UseGuards(JwtAuthGuard)
  @Post("analyze-jd")
  async analyzeJobDescription(@Body("jobDescription") jobDescription: string) {
    return this.jobAnalysisService.analyzeJobDescription(jobDescription);
  }

  /**
   * Sinh CV với AI dựa trên kết quả phân tích JD đã có
   * @param userId - ID user
   * @param jobAnalysis - Kết quả phân tích JD
   * @param additionalRequirements - Yêu cầu bổ sung (nếu có)
   */
  @UseGuards(JwtAuthGuard)
  @Post("generate-with-ai")
  async generateCvWithAI(
    @User("_id") userId: string,
    @Body("jobAnalysis") jobAnalysis: any,
    @Body("additionalRequirements") additionalRequirements?: string,
  ) {
    // Get user data
    const user = await this.userModel.findById(userId);
    if (!user) throw new Error("User not found");

    // Generate CV content
    const cvContent = await this.cvContentGenerationService.generateCvContent(
      user,
      jobAnalysis,
      additionalRequirements,
    );

    return {
      success: true,
      data: {
        content: cvContent,
        jobAnalysis,
        message: "CV generated from provided job analysis",
      },
    };
  }

  /**
   * Generate and save CV with AI
   * @param generateCvDto - Job description and generation parameters
   * @param userId - The ID of the authenticated user
   */
  @UseGuards(JwtAuthGuard)
  @Post("generate-and-save")
  async generateAndSaveCv(
    @Body() generateCvDto: GenerateCvDto,
    @User("_id") userId: string,
  ) {
    try {
      // 1. Get user data
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // 2. Analyze job description
      const jobAnalysis = await this.jobAnalysisService.analyzeJobDescription(
        generateCvDto.jobDescription,
      );

      // 3. Generate CV content
      const cvContent = await this.cvContentGenerationService.generateCvContent(
        user,
        jobAnalysis,
        generateCvDto.additionalRequirements,
      );

      // Get default template if not specified
      let templateId: string = generateCvDto.cvTemplateId || "";
      if (!templateId) {
        const defaultTemplate = await this.cvService.getAllTemplates();
        templateId = defaultTemplate[0]?._id?.toString() || "";
      }

      // Check if we're using fallback methods
      const isUsingFallback =
        !jobAnalysis.softSkills || jobAnalysis.softSkills.length === 0;
      const message = isUsingFallback
        ? "CV generated using basic analysis (OpenAI quota exceeded). Please check your OpenAI billing to enable AI-powered features."
        : "CV generated successfully using AI analysis";

      // Create CV using the generated content
      const createCvDto: CreateCvDto = {
        cvTemplateId: new Types.ObjectId(templateId),
        title:
          generateCvDto.title ||
          `AI Generated CV - ${new Date().toLocaleDateString()}`,
        content: cvContent,
      };

      // Save the generated CV
      const savedCv = await this.cvService.createCV(createCvDto, userId);

      return {
        success: true,
        message: "CV generated and saved successfully",
        cv: savedCv,
        jobAnalysis,
        aiMessage: message,
        isUsingFallback,
      };
    } catch (error) {
      throw new Error(`Failed to generate CV with AI: ${error.message}`);
    }
  }

  /**
   * Check OpenAI API status
   */
  @UseGuards(JwtAuthGuard)
  @Get("ai-status")
  async checkAiStatus() {
    return this.openAiService.checkApiStatus();
  }

  /**
   * Gợi ý Professional Summary bằng AI
   */
  @UseGuards(JwtAuthGuard)
  @Post("suggest/summary")
  async suggestSummary(
    @User() user: any,
    @Body("jobAnalysis") jobAnalysis: any,
    @Body("additionalRequirements") additionalRequirements?: string,
  ) {
    // Không truyền userProfile nữa, chỉ truyền jobAnalysis và additionalRequirements
    const summary = await this.openAiService.generateProfessionalSummaryVi(
      jobAnalysis,
      additionalRequirements,
    );

    return { summaries: [summary] };
  }

  /**
   * Gợi ý Skills Section bằng AI
   */
  @UseGuards(JwtAuthGuard)
  @Post("suggest/skills")
  async suggestSkills(
    @Body("jobAnalysis") jobAnalysis: any,
    @Body("userSkills") userSkills?: Array<{ name: string; rating: number }>,
  ) {
    return {
      skillsOptions:
        await this.cvContentGenerationService.generateSkillsSection(
          jobAnalysis,
          userSkills,
        ),
    };
  }

  /**
   * Gợi ý Work Experience bằng AI
   */
  @UseGuards(JwtAuthGuard)
  @Post("suggest/work-experience")
  async suggestWorkExperience(
    @Body("jobAnalysis") jobAnalysis: any,
    @Body("experienceLevel") experienceLevel: string,
  ) {
    return this.cvContentGenerationService.generateWorkExperience(
      jobAnalysis,
      experienceLevel,
    );
  }

  /**
   * Get a specific CV by ID
   * @param id - The ID of the CV to retrieve
   * @param userId - The ID of the authenticated user
   * @returns CV object if found and user has access
   * @requires Authentication
   */
  @UseGuards(JwtAuthGuard)
  @Get(":id")
  getById(@Param("id") id: string, @User("_id") userId: string) {
    return this.cvService.getCVById(id, userId);
  }

  /**
   * Create a new CV
   * @param createCvDto - The CV data
   * @param userId - The ID of the authenticated user
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async createCV(
    @Body() createCvDto: CreateCvDto,
    @User("_id") userId: string,
  ) {
    return this.cvService.createCV(createCvDto, userId);
  }

  /**
   * Update an existing CV
   * @param id - The ID of the CV to update
   * @param data - Updated CV data
   * @param userId - The ID of the authenticated user
   * @returns Updated CV object
   * @requires Authentication
   */
  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(@Param("id") id: string, @Body() data, @User("_id") userId: string) {
    return this.cvService.updateCV(id, userId, data);
  }

  /**
   * Delete a CV
   * @param id - The ID of the CV to delete
   * @param userId - The ID of the authenticated user
   * @returns Deletion confirmation
   * @requires Authentication
   */
  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  delete(@Param("id") id: string, @User("_id") userId: string) {
    return this.cvService.deleteCV(id, userId);
  }

  /**
   * Save a CV
   * @param id - The ID of the CV to save
   * @param userId - The ID of the authenticated user
   */
  @UseGuards(JwtAuthGuard)
  @Post(":id/save")
  async saveCV(@Param("id") id: string, @User("_id") userId: string) {
    return this.cvService.saveCV(id, userId);
  }

  /**
   * Unsave a CV
   * @param id - The ID of the CV to unsave
   * @param userId - The ID of the authenticated user
   */
  @UseGuards(JwtAuthGuard)
  @Post(":id/unsave")
  async unsaveCV(@Param("id") id: string, @User("_id") userId: string) {
    return this.cvService.unsaveCV(id, userId);
  }

  /**
   * Share a CV
   * @param id - The ID of the CV to share
   * @param userId - The ID of the authenticated user
   */
  @UseGuards(JwtAuthGuard)
  @Post(":id/share")
  async shareCV(@Param("id") id: string, @User("_id") userId: string) {
    return this.cvService.shareCV(id, userId);
  }

  /**
   * Unshare a CV
   * @param id - The ID of the CV to unshare
   * @param userId - The ID of the authenticated user
   */
  @UseGuards(JwtAuthGuard)
  @Post(":id/unshare")
  async unshareCV(@Param("id") id: string, @User("_id") userId: string) {
    return this.cvService.unshareCV(id, userId);
  }

  /**
   * Translate CV content to a target language using AI
   * Accepts JSON `content` following the CV schema and `targetLanguage` (e.g., "vi", "en").
   * Returns translated JSON with the same structure.
   */
  @UseGuards(JwtAuthGuard)
  @Post("translate")
  async translateCv(
    @Body("content") content: any,
    @Body("uiTexts") uiTexts: Record<string, string> = {},
    @Body("targetLanguage") targetLanguage: string,
  ) {
    if (!content || typeof content !== "object") {
      throw new BadRequestException("content (CV JSON) is required");
    }

    if (!targetLanguage || typeof targetLanguage !== "string") {
      throw new BadRequestException("targetLanguage is required");
    }

    const translated = await this.cvContentGenerationService.translateCvContent(
      content,
      uiTexts,
      targetLanguage,
    );

    return {
      success: true,
      data: translated,
    };
  }

  /**
   * Viết lại mô tả công việc trong work experience cho chuyên nghiệp hơn
   */
  @UseGuards(JwtAuthGuard)
  @Post("rewrite-work-description")
  async rewriteWorkDescription(
    @Body("description") description: string,
    @Body("language") language?: string,
  ) {
    if (!description || description.trim().length === 0) {
      throw new BadRequestException("Description is required.");
    }
    const rewritten = await this.cvAnalysisService.rewriteWorkDescription(
      description,
      language,
    );
    return { rewritten };
  }
}
