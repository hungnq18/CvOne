import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import * as fs from "fs";
import { Model } from "mongoose";
import * as path from "path";
import * as pdf from "pdf-parse";
import { CvTemplate } from "../cv-template/schemas/cv-template.schema";
import { User } from "../users/schemas/user.schema";
import { CvPdfService } from "./cv-pdf.service";
import { GenerateCvDto } from "./dto/generate-cv.dto";
import { OpenAiService } from "./openai.service";

@Injectable()
export class CvAiService {
  private readonly logger = new Logger(CvAiService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(CvTemplate.name) private cvTemplateModel: Model<CvTemplate>,
    private openAiService: OpenAiService,
    private cvPdfService: CvPdfService
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
   * Public: Phân tích JD (dùng cho endpoint riêng)
   */
  public async analyzeJobDescription(jobDescription: string) {
    return this.openAiService.analyzeJobDescription(jobDescription);
  }

  /**
   * Public: Gợi ý Professional Summary bằng AI
   */
  public async suggestProfessionalSummary(user: any, jobAnalysis: any, additionalRequirements?: string) {
    // Now returns an array of summaries
    return { summaries: await this.openAiService.generateProfessionalSummary(user, jobAnalysis, additionalRequirements) };
  }

  /**
   * Public: Gợi ý Skills Section bằng AI
   */
  public async suggestSkillsSection(jobAnalysis: any, userSkills?: Array<{ name: string; rating: number }>) {
    // Now returns an array of skills lists
    return { skillsOptions: await this.openAiService.generateSkillsSection(jobAnalysis, userSkills) };
  }

  /**
   * Public: Gợi ý Work Experience bằng AI
   */
  public async suggestWorkExperience(jobAnalysis: any, experienceLevel: string) {
    return this.openAiService.generateWorkExperience(jobAnalysis, experienceLevel);
  }

  /**
   * Public: Sinh CV dựa trên jobAnalysis đã có (không phân tích lại JD)
   */
  public async generateCvWithJobAnalysis(
    userId: string,
    jobAnalysis: any,
    additionalRequirements?: string
  ) {
    // Lấy user
    const user = await this.userModel.findById(userId);
    if (!user) throw new Error("User not found");
    // Sinh nội dung CV
    const cvContent = await this.generateCvContent(user, jobAnalysis, additionalRequirements);
    // Trả về kết quả
    return {
      success: true,
      data: {
        content: cvContent,
        jobAnalysis,
        message: "CV generated from provided job analysis"
      }
    };
  }

  /**
   * Main method to generate AI-powered CV
   * Bước 1: Phân tích job description (JD) trước, sau đó mới sinh nội dung CV dựa trên kết quả phân tích JD
   */
  async generateCvWithAI(
    userId: string,
    generateCvDto: GenerateCvDto
  ): Promise<any> {
    try {
      // 1. Lấy thông tin user
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // 2. PHÂN TÍCH JOB DESCRIPTION TRƯỚC
      const jobAnalysis = await this.openAiService.analyzeJobDescription(
        generateCvDto.jobDescription
      );

      // 3. Sinh nội dung CV dựa trên kết quả phân tích JD
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

  /**
   * Upload and analyze CV PDF using AI
   */
  public async uploadAndAnalyzeCv(
    userId: string,
    filePath: string
  ): Promise<{
    success: boolean;
    data?: {
      cvAnalysis: any;
      suggestions: {
        strengths: string[];
        areasForImprovement: string[];
        recommendations: string[];
      };
    };
    error?: string;
  }> {
    try {
      // 1. Extract text from PDF
      const pdfBuffer = fs.readFileSync(filePath);
      const pdfData = await pdf(pdfBuffer);
      const cvText = pdfData.text;

      if (!cvText || cvText.trim().length === 0) {
        throw new Error("Could not extract text from PDF. Please ensure the PDF contains readable text.");
      }

      // 2. Analyze CV content using AI
      const cvAnalysis = await this.openAiService.analyzeCvContent(cvText);

      // 3. Generate suggestions based on analysis
      const suggestions = await this.generateCvSuggestions(cvAnalysis);

      // 4. Clean up uploaded file
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        this.logger.warn(`Failed to delete uploaded file: ${error.message}`);
      }

      return {
        success: true,
        data: {
          cvAnalysis,
          suggestions
        }
      };
    } catch (error) {
      this.logger.error(
        `Error uploading and analyzing CV: ${error.message}`,
        error.stack
      );

      // Clean up uploaded file on error
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (cleanupError) {
        this.logger.warn(`Failed to delete uploaded file: ${cleanupError.message}`);
      }

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Upload CV PDF, analyze it, and generate optimized PDF based on job description
   */
  public async uploadAnalyzeAndGeneratePdf(
    userId: string,
    cvFilePath: string,
    jobDescription: string,
    additionalRequirements?: string
  ): Promise<{
    success: boolean;
    data?: {
      cvAnalysis: any;
      jobAnalysis: any;
      optimizedCv: any;
      suggestions: any;
      pdfPath: string;
    };
    error?: string;
  }> {
    try {
      // 1. Extract text from CV PDF
      const pdfBuffer = fs.readFileSync(cvFilePath);
      const pdfData = await pdf(pdfBuffer);
      const cvText = pdfData.text;

      if (!cvText || cvText.trim().length === 0) {
        throw new Error("Could not extract text from PDF. Please ensure the PDF contains readable text.");
      }

      // 2. Analyze CV content using AI
      const cvAnalysis = await this.openAiService.analyzeCvContent(cvText);

      // 3. Analyze job description
      const jobAnalysis = await this.openAiService.analyzeJobDescription(jobDescription);

      // 4. Generate optimized CV with AI (NEW STEP)
      const optimizedCv = await this.generateOptimizedCvWithAI(
        cvAnalysis,
        jobAnalysis,
        additionalRequirements
      );

      // 5. Generate suggestions
      const suggestions = await this.generateCvSuggestions(cvAnalysis);

      // 6. Generate optimized PDF with original layout preserved
      const outputFileName = `optimized-cv-${Date.now()}.pdf`;
      const outputPath = path.join('./uploads', outputFileName);
      
      const pdfResult = await this.cvPdfService.createOptimizedCvPdfWithOriginalLayout(
        cvAnalysis, // Original CV analysis for layout reference
        optimizedCv, // Optimized CV content
        jobDescription,
        jobAnalysis,
        outputPath
      );

      if (!pdfResult.success) {
        throw new Error(pdfResult.error || 'Failed to generate PDF');
      }

      // 7. Clean up original uploaded file
      try {
        fs.unlinkSync(cvFilePath);
      } catch (error) {
        this.logger.warn(`Failed to delete uploaded file: ${error.message}`);
      }

      return {
        success: true,
        data: {
          cvAnalysis,
          jobAnalysis,
          optimizedCv,
          suggestions,
          pdfPath: `/uploads/${outputFileName}`
        }
      };
    } catch (error) {
      this.logger.error(
        `Error in uploadAnalyzeAndGeneratePdf: ${error.message}`,
        error.stack
      );

      // Clean up uploaded file on error
      try {
        if (fs.existsSync(cvFilePath)) {
          fs.unlinkSync(cvFilePath);
        }
      } catch (cleanupError) {
        this.logger.warn(`Failed to delete uploaded file: ${cleanupError.message}`);
      }

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Upload CV PDF (buffer), analyze it, and generate optimized PDF based on job description
   */
  public async uploadAnalyzeAndGeneratePdfFromBuffer(
    userId: string,
    pdfBuffer: Buffer,
    jobDescription: string,
    additionalRequirements?: string
  ): Promise<{
    success: boolean;
    data?: {
      cvAnalysis: any;
      jobAnalysis: any;
      optimizedCv: any;
      suggestions: any;
      pdfPath: string;
    };
    error?: string;
  }> {
    try {
      // 1. Extract text from PDF buffer
      const pdfData = await pdf(pdfBuffer);
      const cvText = pdfData.text;

      if (!cvText || cvText.trim().length === 0) {
        throw new Error("Could not extract text from PDF. Please ensure the PDF contains readable text.");
      }

      // 2. Analyze CV content using AI
      const cvAnalysis = await this.openAiService.analyzeCvContent(cvText);

      // 3. Analyze job description
      const jobAnalysis = await this.openAiService.analyzeJobDescription(jobDescription);

      // 4. Generate optimized CV with AI (NEW STEP)
      const optimizedCv = await this.generateOptimizedCvWithAI(
        cvAnalysis,
        jobAnalysis,
        additionalRequirements
      );

      // 5. Generate suggestions
      const suggestions = await this.generateCvSuggestions(cvAnalysis);

      // 6. Generate optimized PDF with original layout preserved
      const outputFileName = `optimized-cv-${Date.now()}.pdf`;
      const outputPath = path.join('./uploads', outputFileName);
      
      const pdfResult = await this.cvPdfService.createOptimizedCvPdfWithOriginalLayout(
        cvAnalysis, // Original CV analysis for layout reference
        optimizedCv, // Optimized CV content
        jobDescription,
        jobAnalysis,
        outputPath
      );

      if (!pdfResult.success) {
        throw new Error(pdfResult.error || 'Failed to generate PDF');
      }

      return {
        success: true,
        data: {
          cvAnalysis,
          jobAnalysis,
          optimizedCv,
          suggestions,
          pdfPath: `/uploads/${outputFileName}`
        }
      };
    } catch (error) {
      this.logger.error(
        `Error in uploadAnalyzeAndGeneratePdfFromBuffer: ${error.message}`,
        error.stack
      );
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Upload CV PDF (buffer), analyze it, and generate optimized PDF as buffer (no file output)
   */
  public async uploadAnalyzeAndGeneratePdfBufferFromBuffer(
    userId: string,
    pdfBuffer: Buffer,
    jobDescription: string,
    additionalRequirements?: string
  ): Promise<{
    success: boolean;
    pdfBuffer?: Buffer;
    cvAnalysis?: any;
    jobAnalysis?: any;
    optimizedCv?: any;
    suggestions?: any;
    error?: string;
  }> {
    try {
      // 1. Extract text from PDF buffer
      const pdfData = await pdf(pdfBuffer);
      const cvText = pdfData.text;

      if (!cvText || cvText.trim().length === 0) {
        throw new Error("Could not extract text from PDF. Please ensure the PDF contains readable text.");
      }

      // 2. Analyze CV content using AI
      const cvAnalysis = await this.openAiService.analyzeCvContent(cvText);

      // 3. Analyze job description
      const jobAnalysis = await this.openAiService.analyzeJobDescription(jobDescription);

      // 4. Generate optimized CV with AI
      const optimizedCv = await this.generateOptimizedCvWithAI(
        cvAnalysis,
        jobAnalysis,
        additionalRequirements
      );

      // 5. Generate suggestions
      const suggestions = await this.generateCvSuggestions(cvAnalysis);

      // 6. Generate optimized PDF as buffer
      const pdfBufferOut = await this.cvPdfService.createOptimizedCvPdfBufferWithOriginalLayout(
        cvAnalysis,
        optimizedCv,
        jobDescription,
        jobAnalysis
      );

      return {
        success: true,
        pdfBuffer: pdfBufferOut,
        cvAnalysis,
        jobAnalysis,
        optimizedCv,
        suggestions
      };
    } catch (error) {
      this.logger.error(
        `Error in uploadAnalyzeAndGeneratePdfBufferFromBuffer: ${error.message}`,
        error.stack
      );
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate optimized CV with AI after analyzing user CV and job description
   * Điều chỉnh CV người dùng để gây ấn tượng với nhà tuyển dụng
   */
  public async generateOptimizedCvWithAI(
    userCvAnalysis: any,
    jobAnalysis: any,
    additionalRequirements?: string
  ): Promise<any> {
    try {
      const prompt = `
Bạn là chuyên gia viết CV. Dưới đây là phân tích CV gốc của ứng viên và phân tích mô tả công việc (JD):

CV gốc của ứng viên (dạng JSON):
${JSON.stringify(userCvAnalysis, null, 2)}

Phân tích JD (dạng JSON):
${JSON.stringify(jobAnalysis, null, 2)}

Yêu cầu:
- Dựa trên CV gốc và JD, hãy điều chỉnh lại toàn bộ nội dung CV để làm nổi bật các kỹ năng, kinh nghiệm, thành tựu phù hợp nhất với JD.
- Nhấn mạnh các điểm mạnh, giảm thiểu điểm yếu, tăng sức thuyết phục với nhà tuyển dụng.
- Có thể thay đổi, bổ sung, sắp xếp lại các phần (summary, skills, workHistory, education, ...), miễn sao gây ấn tượng tốt nhất với nhà tuyển dụng cho vị trí này.
- Sử dụng ngôn ngữ chuyên nghiệp, súc tích, tập trung vào giá trị ứng viên mang lại cho công ty.
- Trả về kết quả dưới dạng JSON đúng cấu trúc sau:
{
  "userData": {
    "firstName": "",
    "lastName": "",
    "professional": "",
    "city": "",
    "country": "",
    "province": "",
    "phone": "",
    "email": "",
    "avatar": "",
    "summary": "",
    "skills": [ { "name": "", "rating": 4 } ],
    "workHistory": [ { "title": "", "company": "", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "description": "" } ],
    "education": [ { "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "major": "", "degree": "", "institution": "" } ]
  }
}
${additionalRequirements ? `\nYêu cầu bổ sung: ${additionalRequirements}` : ''}

Chỉ trả về JSON hợp lệ, không thêm giải thích, markdown hay text thừa.
`;

      const openai = this.openAiService.getOpenAI();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "Bạn là chuyên gia tối ưu hóa CV để gây ấn tượng với nhà tuyển dụng. Luôn trả về JSON đúng schema.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 2000,
      });

      let response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error("No response from OpenAI");
      }
      // Loại bỏ markdown nếu có
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```/, '').replace(/```$/, '').trim();
      }
      const optimizedCv = JSON.parse(cleanResponse);
      return optimizedCv;
    } catch (error) {
      this.logger.error(
        `Error generating optimized CV with AI: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Generate suggestions based on CV analysis
   */
  private async generateCvSuggestions(cvAnalysis: any): Promise<{
    strengths: string[];
    areasForImprovement: string[];
    recommendations: string[];
  }> {
    const suggestions: {
      strengths: string[];
      areasForImprovement: string[];
      recommendations: string[];
    } = {
      strengths: [],
      areasForImprovement: [],
      recommendations: []
    };

    // Analyze skills
    if (cvAnalysis.skills && cvAnalysis.skills.length > 0) {
      const highRatedSkills = cvAnalysis.skills.filter(skill => skill.rating >= 4);
      if (highRatedSkills.length > 0) {
        suggestions.strengths.push(`Strong skills in: ${highRatedSkills.map(s => s.name).join(', ')}`);
      }

      const lowRatedSkills = cvAnalysis.skills.filter(skill => skill.rating <= 2);
      if (lowRatedSkills.length > 0) {
        suggestions.areasForImprovement.push(`Consider improving: ${lowRatedSkills.map(s => s.name).join(', ')}`);
      }
    }

    // Analyze work experience
    if (cvAnalysis.workExperience && cvAnalysis.workExperience.length > 0) {
      suggestions.strengths.push(`Good work experience with ${cvAnalysis.workExperience.length} positions`);
      
      // Check for gaps in employment
      const sortedExperience = cvAnalysis.workExperience.sort((a, b) => 
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );
      
      if (sortedExperience.length > 1) {
        const latestEndDate = new Date(sortedExperience[0].endDate);
        const now = new Date();
        const monthsSinceLastJob = (now.getTime() - latestEndDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
        
        if (monthsSinceLastJob > 6) {
          suggestions.areasForImprovement.push("Consider addressing employment gap in your CV");
        }
      }
    }

    // Analyze education
    if (cvAnalysis.education && cvAnalysis.education.length > 0) {
      suggestions.strengths.push("Good educational background");
    }

    // Generate recommendations
    if (cvAnalysis.skills && cvAnalysis.skills.length < 5) {
      suggestions.recommendations.push("Consider adding more skills to make your CV more comprehensive");
    }

    if (!cvAnalysis.summary || cvAnalysis.summary.length < 50) {
      suggestions.recommendations.push("Add a professional summary to highlight your key strengths");
    }

    if (cvAnalysis.certifications && cvAnalysis.certifications.length === 0) {
      suggestions.recommendations.push("Consider adding relevant certifications to enhance your profile");
    }

    return suggestions;
  }

  async analyzeCvJson(pdfJson: any): Promise<any> {
    // Trích xuất toàn bộ text từ JSON giữ layout
    const allText = pdfJson.Pages?.flatMap((page: any) =>
      page.Texts?.flatMap((t: any) =>
        t.R?.map((r: any) => r.T) || []
      ) || []
    ).join('\n') || '';

    // Gửi cho AI (OpenAI, GPT, v.v.)
    const aiResult = await this.openAiService.analyzeCvContent(allText);
    return aiResult;
  }

  public async analyzeCvContent(cvText: string) {
    return this.openAiService.analyzeCvContent(cvText);
  }
}
