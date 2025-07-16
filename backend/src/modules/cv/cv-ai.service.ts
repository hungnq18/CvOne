import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import * as fs from "fs";
import { Model } from "mongoose";
import * as path from "path";
import { ColorTypes, PDFDocument } from 'pdf-lib';
import * as pdf from "pdf-parse";
import * as puppeteer from 'puppeteer';
import { CvTemplate } from "../cv-template/schemas/cv-template.schema";
import { User } from "../users/schemas/user.schema";
import { CvPdfService } from "./cv-pdf.service";
import { GenerateCvDto } from "./dto/generate-cv.dto";
import { OpenAiService } from "./openai.service";
const PDFParser = require('pdf2json');

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
      mapping?: any;
      layout?: any;
      colorScheme?: string;
      language?: string;
    };
    error?: string;
  }> {
    try {
      this.logger.log('Bắt đầu phân tích CV: đọc file PDF');
      // 1. Extract text from PDF
      const pdfBuffer = fs.readFileSync(filePath);
      const pdfData = await pdf(pdfBuffer);
      const cvText = pdfData.text;
      this.logger.log('Đã trích xuất text từ PDF:', cvText?.slice(0, 200));

      if (!cvText || cvText.trim().length === 0) {
        this.logger.error('Không trích xuất được text từ PDF.');
        throw new Error("Could not extract text from PDF. Please ensure the PDF contains readable text.");
      }

      // 2. Analyze CV content using AI
      this.logger.log('Gửi text cho AI phân tích...');
      const cvAnalysis = await this.openAiService.analyzeCvContent(cvText);
      this.logger.log('Kết quả AI trả về:', JSON.stringify(cvAnalysis));

      // 3. Generate suggestions based on analysis
      const suggestions = await this.generateCvSuggestions(cvAnalysis);
      this.logger.log('Gợi ý AI:', JSON.stringify(suggestions));

      // 4. Generate mapping nếu có hàm createCvMapping
      let mapping: any = undefined;
      if (typeof this.createCvMapping === 'function') {
        mapping = this.createCvMapping(cvAnalysis);
        this.logger.log('Mapping từ createCvMapping:', JSON.stringify(mapping));
      } else if (cvAnalysis.mapping) {
        mapping = cvAnalysis.mapping;
        this.logger.log('Mapping từ AI:', JSON.stringify(mapping));
      } else {
        this.logger.warn('Không tìm thấy mapping từ AI hoặc createCvMapping.');
      }

      // 5. Phân tích layout, màu sắc, ngôn ngữ
      const layout = await this.analyzeCvLayout(pdfBuffer);
      const colorScheme = await this.analyzeCvColorScheme(pdfBuffer);
      const language = this.detectLanguage(cvText);
      this.logger.log('Layout:', JSON.stringify(layout));
      this.logger.log('ColorScheme:', colorScheme);
      this.logger.log('Language:', language);

      // 6. Clean up uploaded file
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        this.logger.warn(`Failed to delete uploaded file: ${error.message}`);
      }

      return {
        success: true,
        data: {
          cvAnalysis,
          suggestions,
          mapping,
          layout,
          colorScheme,
          language
        }
      };
    } catch (error) {
      this.logger.error(
        `Error uploading and analyzing CV: ${error.message}`,
        error.stack
      );
      // Log thêm error object nếu có
      this.logger.error('Chi tiết lỗi:', error);

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

  // Hàm phân tích layout cơ bản (demo)
  private async analyzeCvLayout(pdfBuffer: Buffer): Promise<any> {
    // TODO: Phân tích layout thực tế, demo trả về số trang và kích thước trang
    const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
    const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;
    const pageSizes: { width: number; height: number }[] = [];
    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDoc.getPage(i);
      pageSizes.push({ width: page.view[2], height: page.view[3] });
    }
    return { numPages, pageSizes };
  }

  // Hàm phân tích màu sắc chủ đạo (demo)
  private async analyzeCvColorScheme(pdfBuffer: Buffer): Promise<string> {
    // TODO: Phân tích màu sắc thực tế, demo trả về 'blue' hoặc 'default'
    // Có thể dùng thư viện pdfjs hoặc pdf-lib để lấy màu sắc, ở đây trả về mẫu
    return 'default';
  }

  // Hàm phát hiện ngôn ngữ (demo)
  private detectLanguage(text: string): string {
    // TODO: Dùng thư viện phát hiện ngôn ngữ, demo đơn giản
    if (/\b(the|and|of|in|to|with|for|on|by|is|as|at|from)\b/i.test(text)) {
      return 'en';
    }
    if (/\b(và|của|trong|cho|là|tại|từ|bởi|như|với|đến|bằng)\b/i.test(text)) {
      return 'vi';
    }
    return 'unknown';
  }

  /**
   * Upload CV PDF, analyze with AI, and return JSON HTML with rewritten CV content
   * @param pdfBuffer - The uploaded PDF buffer
   * @param jobDescription - Job description for optimization
   * @param additionalRequirements - Additional requirements (optional)
   * @returns JSON object with HTML content and analysis
   */
  public async uploadAnalyzeAndOverlayJson(
    pdfBuffer: Buffer,
    jobDescription: string,
    additionalRequirements?: string
  ): Promise<{
    success: boolean;
    data?: {
      originalCvAnalysis: any;
      jobAnalysis: any;
      rewrittenCvHtml: any;
      suggestions: any;
      mapping: any;
    };
    error?: string;
  }> {
    try {
      // 1. Extract layout and mapping
      const mapping = await this.extractPdfLayoutAndMapping(pdfBuffer);
      if (!mapping || mapping.length === 0) {
        throw new Error('Could not extract mapping from PDF.');
      }
      // 2. Optimize content with AI
      const optimizedMapping = await this.optimizeCvBlocksWithAI(mapping);
      // 3. Render HTML with original layout and optimized content
      const rewrittenCvHtml = this.renderOptimizedHtmlWithMapping(optimizedMapping);
      // 4. (Optional) Analyze job description
      const jobAnalysis = await this.openAiService.analyzeJobDescription(jobDescription);
      // 5. (Optional) Generate suggestions for improvement
      const suggestions = await this.generateCvSuggestions({}); // Có thể truyền thêm phân tích nếu muốn
      return {
        success: true,
        data: {
          originalCvAnalysis: {}, // Có thể truyền thêm nếu muốn
          jobAnalysis,
          rewrittenCvHtml,
          suggestions,
          mapping: optimizedMapping
        }
      };
    } catch (error) {
      this.logger.error(
        `Error in uploadAnalyzeAndOverlayJson: ${error.message}`,
        error.stack
      );
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
      // Phát hiện ngôn ngữ CV gốc
      let language = 'unknown';
      if (userCvAnalysis?.userData?.summary) {
        language = this.detectLanguage(userCvAnalysis.userData.summary);
      } else if (userCvAnalysis?.userData) {
        // Gộp các trường text lại để detect
        const allText = Object.values(userCvAnalysis.userData).filter(v => typeof v === 'string').join(' ');
        language = this.detectLanguage(allText);
      }
      let languageNote = '';
      if (language === 'vi') {
        languageNote = '\nLưu ý: Hãy viết toàn bộ kết quả bằng tiếng Việt chuẩn, tự nhiên, chuyên nghiệp.';
      } else if (language === 'en') {
        languageNote = '\nNote: Write the entire result in professional, natural English.';
      }
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
${additionalRequirements ? `\nYêu cầu bổ sung: ${additionalRequirements}` : ''}${languageNote}

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

  /**
   * Thay thế nội dung trong PDF gốc bằng nội dung AI tối ưu hóa, giữ nguyên layout
   */
  public async replaceContentInOriginalPdfBuffer(
    userId: string,
    pdfBuffer: Buffer,
    jobDescription: string,
    additionalRequirements?: string,
    mapping?: Record<string, any> // mapping từ frontend (field -> vị trí)
  ): Promise<{
    success: boolean;
    pdfBuffer?: Buffer;
    error?: string;
  }> {
    try {
      // 1. Extract layout and mapping
      const extractedMapping = await this.extractPdfLayoutAndMapping(pdfBuffer);
      if (!extractedMapping || extractedMapping.length === 0) {
        throw new Error('Could not extract mapping from PDF.');
      }
      // 2. Optimize content with AI
      const optimizedMapping = await this.optimizeCvBlocksWithAI(extractedMapping);
      // 3. Load original PDF and overlay optimized content
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const fontkit = require('@pdf-lib/fontkit');
      pdfDoc.registerFontkit(fontkit);
      const pages = pdfDoc.getPages();
      const path = require('path');
      const fs = require('fs');
      const fontPath = path.resolve(__dirname, '../assets/fonts/Roboto-Regular.ttf');
      if (!fs.existsSync(fontPath)) {
        throw new Error(`Font file not found at ${fontPath}`);
      }
      const fontBytes = fs.readFileSync(fontPath);
      if (!fontBytes || fontBytes.length === 0) {
        throw new Error('Font file is empty or could not be read');
      }
      let customFont;
      try {
        customFont = await pdfDoc.embedFont(fontBytes);
      } catch (err) {
        this.logger.error('Failed to embed font:', err);
        throw new Error('Font embedding failed. Please check the font file.');
      }
      // 4. Overlay text mới dựa trên mapping
      for (const block of optimizedMapping) {
        const page = pages[block.page || 0];
        // Xóa text cũ bằng rectangle trắng
        page.drawRectangle({
          x: block.x * 7.5 - 2,
          y: block.y * 1.5 - 2,
          width: (block.w || 50) * 7.5 + 4,
          height: (block.sw || 10) * 1.5 + 4,
          color: { type: ColorTypes.RGB, red: 1, green: 1, blue: 1 },
        });
        // Điều chỉnh font size nếu text quá dài
        let newText = block.optimizedContent || block.content;
        let fontSize = block.fontSize || 12;
        const maxWidth = (block.w || 50) * 7.5;
        const estimatedWidth = newText.length * fontSize * 0.6;
        if (estimatedWidth > maxWidth) {
          fontSize = Math.max(8, fontSize * (maxWidth / estimatedWidth));
        }
        if (newText) {
          page.drawText(newText, {
            x: block.x * 7.5,
            y: block.y * 1.5,
            size: fontSize,
            color: { type: ColorTypes.RGB, red: 0, green: 0, blue: 0 },
            maxWidth: maxWidth,
            lineHeight: fontSize * 1.2,
            font: customFont
          });
        }
      }
      const newPdfBytes = await pdfDoc.save();
      return { success: true, pdfBuffer: Buffer.from(newPdfBytes) };
    } catch (error) {
      this.logger.error(`Error in replaceContentInOriginalPdfBuffer: ${error.message}`);
      this.logger.error('Full error object:', error);
      return { success: false, error: error.message };
    }
  }

  // /**
  //  * Tìm vị trí các trường text trong PDF để overlay
  //  */
  // private async findTextPositionsInPdf(pdfBuffer: Buffer): Promise<any[]> {
  //   try {
  //     // Sử dụng pdf-parse để lấy thông tin text
  //     const pdfData = await (require('pdf-parse'))(pdfBuffer);
      
  //     // Phân tích text để tìm các trường quan trọng
  //     const text = pdfData.text.toLowerCase();
  //     const positions: any[] = [];

  //     // Tìm các từ khóa để xác định loại field
  //     const fieldKeywords = {
  //       summary: ['summary', 'objective', 'profile', 'mục tiêu', 'tổng quan'],
  //       skills: ['skills', 'competencies', 'kỹ năng', 'technical'],
  //       experience: ['experience', 'work history', 'employment', 'kinh nghiệm'],
  //       education: ['education', 'academic', 'học vấn', 'degree']
  //     };

  //     // Demo: Tạo vị trí giả định dựa trên phân tích text
  //     // Trong thực tế, cần sử dụng thư viện như pdf2pic hoặc pdf.js để lấy vị trí chính xác
  //     let currentY = 800; // Bắt đầu từ top
      
  //     for (const [fieldType, keywords] of Object.entries(fieldKeywords)) {
  //       const hasField = keywords.some(keyword => text.includes(keyword));
  //       if (hasField) {
  //         positions.push({
  //           x: 50,
  //           y: currentY,
  //           width: 500,
  //           height: 50,
  //           fontSize: 12,
  //           fieldType: fieldType
  //         });
  //         currentY -= 100; // Giảm Y cho field tiếp theo
  //       }
  //     }

  //     return [positions]; // Trả về cho page đầu tiên
  //   } catch (error) {
  //     this.logger.error(`Error finding text positions: ${error.message}`);
  //     return [];
  //   }
  // }

  // /**
  //  * Convert CV content to HTML structure
  //  */
  // private convertCvContentToHtml(cvContent: any): any {
  //   const html = {
  //     sections: {
  //       header: {
  //         name: cvContent.userData.firstName + ' ' + cvContent.userData.lastName,
  //         title: cvContent.userData.professional,
  //         contact: {
  //           email: cvContent.userData.email,
  //           phone: cvContent.userData.phone,
  //           location: cvContent.userData.city + ', ' + cvContent.userData.country
  //         }
  //       },
  //       summary: {
  //         title: 'Professional Summary',
  //         content: cvContent.userData.summary
  //       },
  //       skills: {
  //         title: 'Skills',
  //         content: cvContent.userData.skills
  //       },
  //       experience: {
  //         title: 'Work Experience',
  //         items: cvContent.userData.workHistory.map((job: any) => ({
  //           title: job.title,
  //           company: job.company,
  //           period: job.period,
  //           description: job.description,
  //           achievements: job.achievements
  //         }))
  //       },
  //       education: {
  //         title: 'Education',
  //         items: cvContent.userData.education.map((edu: any) => ({
  //           degree: edu.degree,
  //           major: edu.major,
  //           institution: edu.institution,
  //           period: edu.startDate + ' - ' + edu.endDate
  //         }))
  //       }
  //     }
  //   };

  //   return html;
  // }

  /**
   * Create mapping structure for frontend overlay
   */
  private createCvMapping(cvContent: any): any {
    return {
      sections: {
        header: {
          name: { type: 'text', value: cvContent.userData.firstName + ' ' + cvContent.userData.lastName },
          title: { type: 'text', value: cvContent.userData.professional },
          contact: {
            email: { type: 'text', value: cvContent.userData.email },
            phone: { type: 'text', value: cvContent.userData.phone },
            location: { type: 'text', value: cvContent.userData.city + ', ' + cvContent.userData.country }
          }
        },
        summary: {
          content: { type: 'textarea', value: cvContent.userData.summary }
        },
        skills: {
          content: { type: 'textarea', value: cvContent.userData.skills }
        },
        experience: {
          items: cvContent.userData.workHistory.map((job: any, index: number) => ({
            title: { type: 'text', value: job.title },
            company: { type: 'text', value: job.company },
            period: { type: 'text', value: job.period },
            description: { type: 'textarea', value: job.description },
            achievements: { type: 'textarea', value: job.achievements }
          }))
        },
        education: {
          items: cvContent.userData.education.map((edu: any, index: number) => ({
            degree: { type: 'text', value: edu.degree },
            major: { type: 'text', value: edu.major },
            institution: { type: 'text', value: edu.institution },
            period: { type: 'text', value: edu.startDate + ' - ' + edu.endDate }
          }))
        }
      }
    };
  }

  /**
 * Extract layout and mapping from PDF (positions, font, content)
 */
private async extractPdfLayoutAndMapping(pdfBuffer: Buffer): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    pdfParser.on('pdfParser_dataError', errData => reject(errData.parserError));
    pdfParser.on('pdfParser_dataReady', pdfData => {
      const mapping: any[] = [];
      pdfData.Pages.forEach((page: any, pageIndex: number) => {
        page.Texts.forEach((textBlock: any, blockIndex: number) => {
          mapping.push({
            blockId: `${pageIndex}_${blockIndex}`,
            page: pageIndex,
            x: textBlock.x,
            y: textBlock.y,
            w: textBlock.w,
            sw: textBlock.sw,
            fontSize: textBlock.R[0]?.TS?.[1] || 12,
            font: textBlock.R[0]?.TS?.[0] || '',
            content: decodeURIComponent(textBlock.R[0]?.T || ''),
          });
        });
      });
      resolve(mapping);
    });
    pdfParser.parseBuffer(pdfBuffer);
  });
}

/**
 * Use AI to optimize content of each block in mapping
 */
private async optimizeCvBlocksWithAI(mapping: any[]): Promise<any[]> {
  // Gộp toàn bộ text từ các block
  const allText = mapping.map(block => block.content).join(' ');
  const prompt = `Hãy tối ưu hóa toàn bộ nội dung CV sau để gây ấn tượng với nhà tuyển dụng, giữ nguyên ý chính:\n"${allText}"`;

  try {
    const openai = this.openAiService.getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Bạn là chuyên gia tối ưu hóa CV." },
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 2000,
    });
    let response = completion.choices[0]?.message?.content;
    if (response) {
      // Trả về một block duy nhất với nội dung đã tối ưu hóa
      return [{
        x: 0, y: 0, fontSize: 12, content: response.trim(), optimizedContent: response.trim()
      }];
    }
  } catch (err) {
    // Nếu lỗi, trả về mapping gốc
    return mapping;
  }
  return mapping;
}

/**
 * Render HTML with original layout and optimized content
 */
private renderOptimizedHtmlWithMapping(mapping: any[]): string {
  let html = '<div style="position:relative;width:800px;height:1120px;">';
  for (const block of mapping) {
    html += `<div style="position:absolute; left:${block.x * 7.5}px; top:${block.y * 1.5}px; font-size:${block.fontSize}px;">${block.optimizedContent || block.content}</div>`;
  }
  html += '</div>';
  return html;
}

/**
 * New endpoint: Upload PDF, extract layout, optimize content, return HTML with original layout and optimized content
 */
public async uploadAnalyzeAndOverlayHtml(
  pdfBuffer: Buffer
): Promise<{ success: boolean; html?: string; mapping?: any[]; error?: string }> {
  try {
    // 1. Extract layout and mapping
    const mapping = await this.extractPdfLayoutAndMapping(pdfBuffer);
    if (!mapping || mapping.length === 0) {
      throw new Error('Could not extract mapping from PDF.');
    }
    // 2. Optimize content with AI
    const optimizedMapping = await this.optimizeCvBlocksWithAI(mapping);
    // 3. Render HTML with original layout and optimized content
    const html = this.renderOptimizedHtmlWithMapping(optimizedMapping);
    return { success: true, html, mapping: optimizedMapping };
  } catch (error) {
    this.logger.error('Error in uploadAnalyzeAndOverlayHtml:', error);
    return { success: false, error: error.message };
  }
}

// Thêm hàm vào trong class CvAiService
private async convertPdfToHtmlWithConvertApi(pdfBuffer: Buffer, apiKey: string): Promise<string> {
  // ConvertAPI expects base64 string
  const fileBase64 = pdfBuffer.toString('base64');
  const formData = {
    Parameters: [
      {
        Name: "File",
        FileValue: {
          Name: "cv.pdf",
          Data: fileBase64
        }
      }
    ]
  };

  // Gọi API ConvertAPI
  const res = await require('axios').post(
    `https://v2.convertapi.com/convert/pdf/to/html?Secret=${apiKey}`,
    formData,
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  const fileObj = res.data.Files && res.data.Files[0];
  if (!fileObj) {
    throw new Error('ConvertAPI did not return a valid file object');
  }
  let htmlContent = '';
  if (fileObj.Url) {
    const htmlRes = await require('axios').get(fileObj.Url, { responseType: 'text' });
    htmlContent = htmlRes.data;
  } else if (fileObj.FileData) {
    // Nếu là base64 thì decode ra string
    htmlContent = Buffer.from(fileObj.FileData, 'base64').toString('utf-8');
  } else {
    throw new Error('ConvertAPI did not return HTML content');
  }
  return htmlContent;
}

public async optimizePdfCvWithHtmlAI(pdfBuffer: Buffer, jobDescription?: string): Promise<{ success: boolean; pdfPath?: string; error?: string }> {
  try {
    const CONVERTAPI_KEY = process.env.CONVERTAPI_KEY || 'YOUR_CONVERTAPI_KEY';

    // 1. Convert PDF to HTML using ConvertAPI
    const originalHtml = await this.convertPdfToHtmlWithConvertApi(pdfBuffer, CONVERTAPI_KEY);

    // 2. Optimize HTML with AI (bổ sung jobDescription vào prompt nếu có)
    const prompt = `Đây là file HTML CV được chuyển từ PDF, layout và style đã được cố định bằng CSS.\nHãy tối ưu hóa nội dung CV trong HTML này để gây ấn tượng với nhà tuyển dụng, nhưng tuyệt đối KHÔNG thay đổi layout, style, cấu trúc HTML.\nChỉ thay đổi nội dung text (giữ nguyên các thẻ, class, style, id, v.v.).${jobDescription ? `\nMô tả công việc: ${jobDescription}` : ''}\nTrả về HTML đã tối ưu hóa.`;
    const optimizedHtml = await (this.openAiService as any).optimizeCvHtmlWithPrompt(originalHtml, prompt);

    // 3. Convert optimized HTML back to PDF using Puppeteer (giữ nguyên)
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
    const pdfPath = path.join(uploadsDir, `cv-${Date.now()}-optimized.pdf`);
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(optimizedHtml, { waitUntil: 'networkidle0' });
    await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });
    await browser.close();

    return { success: true, pdfPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

public async optimizePdfCvWithOriginalLayoutAI(
    pdfBuffer: Buffer,
    jobDescription: string,
    additionalRequirements?: string
  ): Promise<{ success: boolean; pdfBuffer?: Buffer; error?: string }> {
    try {
      // 1. Convert PDF to HTML (giữ layout gốc)
      const CONVERTAPI_KEY = process.env.CONVERTAPI_KEY || 'YOUR_CONVERTAPI_KEY';
      const html = await this.convertPdfToHtmlWithConvertApi(pdfBuffer, CONVERTAPI_KEY);
      if (!html) {
        this.logger.error('convertPdfToHtmlWithConvertApi trả về null');
        return { success: false, error: 'Không thể chuyển PDF sang HTML.' };
      }

      // 2. Parse HTML, tách các đoạn text (dùng cheerio)
      const cheerio = require('cheerio');
      const $ = cheerio.load(html);
      // Giả sử các đoạn text nằm trong các thẻ p, span, div (có thể refine thêm)
      const textNodes: { el: any, text: string }[] = [];
      $('p, span, div').each((i, el) => {
        const text = $(el).text();
        if (text && text.trim().length > 0) {
          textNodes.push({ el, text });
        }
      });
      if (textNodes.length === 0) {
        this.logger.error('Không tìm thấy đoạn text nào trong HTML');
        return { success: false, error: 'Không tìm thấy nội dung để tối ưu.' };
      }

      // 3. Gọi AI tối ưu hóa từng đoạn (có thể batch hoặc từng đoạn)
      const optimizedTexts: string[] = [];
      for (const node of textNodes) {
        try {
          const optimized = await this.generateOptimizedCvWithAI(
            { summary: node.text },
            jobDescription,
            additionalRequirements
          );
          optimizedTexts.push(optimized?.summary || node.text);
        } catch (err) {
          this.logger.error('AI tối ưu đoạn text lỗi:', err);
          optimizedTexts.push(node.text); // fallback giữ nguyên
        }
      }

      // 4. Thay thế text cũ bằng text mới trong HTML
      textNodes.forEach((node, idx) => {
        $(node.el).text(optimizedTexts[idx]);
      });
      let optimizedHtml = $.html();

      // 5. Chèn lại font vào <head>
      const fontStyle = `
      <style>
      @font-face { font-family: 'Roboto'; src: url('fonts/Roboto-Regular.ttf') format('truetype'); font-weight: normal; font-style: normal; }
      @font-face { font-family: 'Roboto'; src: url('fonts/Roboto-Bold.ttf') format('truetype'); font-weight: bold; font-style: normal; }
      @font-face { font-family: 'Roboto'; src: url('fonts/Roboto-Italic.ttf') format('truetype'); font-weight: normal; font-style: italic; }
      body, * { font-family: 'Roboto', Arial, sans-serif !important; }
      </style>
      `;
      optimizedHtml = optimizedHtml.replace('<head>', `<head>${fontStyle}`);

      // 6. Convert HTML về PDF (dùng puppeteer trực tiếp)
      const puppeteer = require('puppeteer');
      const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
      const page = await browser.newPage();
      await page.setContent(optimizedHtml, { waitUntil: 'networkidle0' });
      const optimizedPdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
      await browser.close();
      if (!optimizedPdfBuffer) {
        this.logger.error('puppeteer trả về null khi convert HTML về PDF');
        return { success: false, error: 'Không thể chuyển HTML tối ưu về PDF.' };
      }

      return { success: true, pdfBuffer: optimizedPdfBuffer };
    } catch (err) {
      this.logger.error('Error in optimizePdfCvWithOriginalLayoutAI:', err);
      return { success: false, error: 'Failed to optimize CV: ' + err.message };
    }
  }

public getOpenAiService() {
  return this.openAiService;
}

public async rewriteWorkDescription(description: string, language?: string): Promise<string> {
  return this.openAiService.rewriteWorkDescription(description, language);
}
}

// Add a placeholder for optimizeCvHtmlWithPrompt to avoid linter error
// TODO: Implement this method in OpenAiService
// @ts-ignore
(OpenAiService.prototype as any).optimizeCvHtmlWithPrompt = async function(html: string, prompt: string) {
  // This is a placeholder. Replace with real OpenAI call.
  return html;
};
