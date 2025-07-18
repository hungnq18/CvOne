import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import * as pdf from 'pdf-parse';
// @ts-ignore: No type declarations for pdfjs-dist
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
import * as puppeteer from 'puppeteer';
import { User } from '../../common/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CvTemplate } from '../cv-template/schemas/cv-template.schema';
import { CvAiService } from './cv-ai.service';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { GenerateCvDto } from './dto/generate-cv.dto';
/**
 * Controller for handling CV (Curriculum Vitae) related requests
 * Most endpoints require authentication using JWT
 * Template endpoints are public (no authentication required)
 */
@Controller('cv')
export class CvController {
  constructor(
    private readonly cvService: CvService,
    private readonly cvAiService: CvAiService,
  ) {}

  /**
   * Get all CVs for the authenticated user
   * @param userId - The ID of the authenticated user
   * @returns Array of user's CVs
   * @requires Authentication
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  getAll(@User('_id') userId: string) {
    return this.cvService.getAllCVs(userId);
  }

  /**
   * Get all saved CVs for the current user
   * @param userId - The ID of the authenticated user
   */
  @UseGuards(JwtAuthGuard)
  @Get('saved')
  async getSavedCVs(@User('_id') userId: string) {
    return this.cvService.getSavedCVs(userId);
  }

  /**
   * Get all available CV templates
   * @returns Array of CV templates
   * @public - No authentication required
   */
  @Get('templates')
  async getAllTemplates(): Promise<CvTemplate[]> {
    return this.cvService.getAllTemplates();
  }

  /**
   * Get a specific CV template by ID
   * @param id - The ID of the template to retrieve
   * @returns Template object
   * @public - No authentication required
   */
  @Get('templates/:id')
  async getTemplateById(@Param('id') id: string): Promise<CvTemplate> {
    return this.cvService.getTemplateById(id);
  }

  /**
   * Phân tích Job Description (JD) bằng AI, trả về kết quả phân tích
   */
  @UseGuards(JwtAuthGuard)
  @Post('analyze-jd')
  async analyzeJobDescription(@Body('jobDescription') jobDescription: string) {
    return this.cvAiService.analyzeJobDescription(jobDescription);
  }

  /**
   * Sinh CV với AI dựa trên kết quả phân tích JD đã có
   * @param userId - ID user
   * @param jobAnalysis - Kết quả phân tích JD
   * @param additionalRequirements - Yêu cầu bổ sung (nếu có)
   */
  @UseGuards(JwtAuthGuard)
  @Post('generate-with-ai')
  async generateCvWithAI(
    @User('_id') userId: string,
    @Body('jobAnalysis') jobAnalysis: any,
    @Body('additionalRequirements') additionalRequirements?: string
  ) {
    return this.cvAiService.generateCvWithJobAnalysis(userId, jobAnalysis, additionalRequirements);
  }

  /**
   * Generate and save CV with AI
   * @param generateCvDto - Job description and generation parameters
   * @param userId - The ID of the authenticated user
   */
  @UseGuards(JwtAuthGuard)
  @Post('generate-and-save')
  async generateAndSaveCv(@Body() generateCvDto: GenerateCvDto, @User('_id') userId: string) {
    // Generate CV with AI
    const aiResult = await this.cvAiService.generateCvWithAI(userId, generateCvDto);
    
    if (!aiResult.success) {
      throw new Error('Failed to generate CV with AI');
    }

    // Create CV using the generated content
    const createCvDto: CreateCvDto = {
      cvTemplateId: aiResult.data.cvTemplateId,
      title: aiResult.data.title,
      content: aiResult.data.content,
    };

    // Save the generated CV
    const savedCv = await this.cvService.createCV(createCvDto, userId);

    return {
      success: true,
      message: 'CV generated and saved successfully',
      cv: savedCv,
      jobAnalysis: aiResult.data.jobAnalysis,
    };
  }

  /**
   * Check OpenAI API status
   */
  @UseGuards(JwtAuthGuard)
  @Get('ai-status')
  async checkAiStatus() {
    return this.cvAiService.checkOpenAiStatus();
  }

  /**
   * Gợi ý Professional Summary bằng AI
   */
  @UseGuards(JwtAuthGuard)
  @Post('suggest/summary')
  async suggestSummary(
    @User() user: any,
    @Body('jobAnalysis') jobAnalysis: any,
    @Body('additionalRequirements') additionalRequirements?: string
  ) {
    return this.cvAiService.suggestProfessionalSummary(user, jobAnalysis, additionalRequirements);
  }

  /**
   * Gợi ý Skills Section bằng AI
   */
  @UseGuards(JwtAuthGuard)
  @Post('suggest/skills')
  async suggestSkills(
    @Body('jobAnalysis') jobAnalysis: any,
    @Body('userSkills') userSkills?: Array<{ name: string; rating: number }>
  ) {
    return this.cvAiService.suggestSkillsSection(jobAnalysis, userSkills);
  }

  /**
   * Gợi ý Work Experience bằng AI
   */
  @UseGuards(JwtAuthGuard)
  @Post('suggest/work-experience')
  async suggestWorkExperience(
    @Body('jobAnalysis') jobAnalysis: any,
    @Body('experienceLevel') experienceLevel: string
  ) {
    return this.cvAiService.suggestWorkExperience(jobAnalysis, experienceLevel);
  }

  /**
   * Upload and analyze CV PDF using AI
   * @param file - The uploaded PDF file
   * @param userId - The ID of the authenticated user
   * @returns Analysis results and suggestions
   * @requires Authentication
   */
  @UseGuards(JwtAuthGuard)
  @Post('upload-and-analyze')
  @UseInterceptors(FileInterceptor('cvFile', {
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!file.mimetype || !file.mimetype.includes('pdf')) {
        return cb(new BadRequestException('Only PDF files are allowed!'), false);
      }
      cb(null, true);
    }
  }))
  async uploadAndAnalyzeCv(@UploadedFile() file: any, @Body('jobDescription') jobDescription: string, @Body('additionalRequirements') additionalRequirements: string) {
    console.log('DEBUG upload-and-analyze: file:', file);
    if (!file) {
      console.log('DEBUG upload-and-analyze: No file uploaded');
      throw new BadRequestException('No CV file uploaded or invalid file type.');
    }
    if (!jobDescription || jobDescription.trim().length === 0) {
      throw new BadRequestException('Job description is required.');
    }
    // 1. Trích xuất text từ PDF
    const pdfData = await pdf(file.buffer);
    const cvText = pdfData.text;
    console.log('DEBUG upload-and-analyze: cvText:', cvText?.slice(0, 200));
    if (!cvText || cvText.trim().length === 0) {
      console.log('DEBUG upload-and-analyze: Could not extract text from PDF');
      throw new BadRequestException('Could not extract text from PDF.');
    }
    // 2. Gửi text cho AI phân tích
    const analysisResult = await this.cvAiService.analyzeCvContent(cvText);
    // 3. Phân tích JD
    const jobAnalysis = await this.cvAiService.getOpenAiService().analyzeJobDescription(jobDescription);
    // 4. Viết lại CV bằng AI dựa trên phân tích CV gốc và JD
    const optimizedCv = await this.cvAiService.generateOptimizedCvWithAI(analysisResult, jobAnalysis, additionalRequirements);
    // 5. Trả về kết quả phân tích và CV đã viết lại
    return {
      analysisResult,
      jobAnalysis,
      optimizedCv,
    };
  }

  /**
   * Upload CV PDF, analyze with AI, and return JSON HTML with rewritten CV content
   * @param file - The uploaded PDF file
   * @param jobDescription - Job description for optimization
   * @param additionalRequirements - Additional requirements (optional)
   * @returns JSON object with HTML content and analysis
   * @requires Authentication
   */
  @UseGuards(JwtAuthGuard)
  @Post('upload-analyze-overlay-pdf')
  @UseInterceptors(FileInterceptor('cvFile', {
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!file.mimetype || !file.mimetype.includes('pdf')) {
        return cb(new BadRequestException('Only PDF files are allowed!'), false);
      }
      cb(null, true);
    }
  }))
  async uploadAnalyzeAndOverlayPdf(
    @UploadedFile() file: any,
    @Body('jobDescription') jobDescription: string,
    @Body('additionalRequirements') additionalRequirements: string,
    @Body('mapping') mapping: string, // nhận mapping từ frontend
    @Res() res: any
  ) {
    console.log('DEBUG upload-analyze-overlay-pdf: file:', file);
    console.log('DEBUG upload-analyze-overlay-pdf: jobDescription:', jobDescription);
    console.log('DEBUG upload-analyze-overlay-pdf: mapping:', mapping);
    if (!file) {
      console.log('DEBUG upload-analyze-overlay-pdf: No file uploaded');
      throw new BadRequestException('No CV file uploaded or invalid file type.');
    }
    if (!jobDescription || jobDescription.trim().length === 0) {
      console.log('DEBUG upload-analyze-overlay-pdf: Missing jobDescription');
      throw new BadRequestException('Job description is required.');
    }
    // Parse mapping nếu có
    let mappingObj = undefined;
    if (mapping) {
      try {
        mappingObj = JSON.parse(mapping);
      } catch (e) {
        console.log('DEBUG upload-analyze-overlay-pdf: Invalid mapping format', mapping);
        throw new BadRequestException('Invalid mapping format');
      }
    }
    // Nếu không có mapping, truyền undefined để service tự extract mapping từ PDF
    if (!mappingObj || Object.keys(mappingObj).length === 0) {
      mappingObj = undefined;
    }
    try {
      // Gọi service để tạo HTML giữ layout gốc với nội dung tối ưu hóa
      const result = await this.cvAiService.uploadAnalyzeAndOverlayHtml(
        file.buffer
      );
      if (!result.success || !result.html) {
        throw new BadRequestException(result.error || 'Failed to process CV');
      }
      res.set({
        'Content-Type': 'application/json',
      });
      res.send({
        html: result.html,
        mapping: result.mapping
      });
    } catch (error) {
      console.log('DEBUG upload-analyze-overlay-pdf: Exception', error);
      throw new BadRequestException(`Failed to process CV: ${error.message}`);
    }
  }

  // Thêm hàm sinh mapping tự động từ buffer (dùng lại logic của autoMappingPdf)
  // private async autoGenerateMappingFromBuffer(buffer: Buffer): Promise<any> {
  //   const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
  //   const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
  //   const pdf = await loadingTask.promise;
  //   const mapping: any = {};
  //   const keywords = {
  //     summary: ['summary', 'tóm tắt', 'objective', 'professional summary', 'profile'],
  //     skills: ['skill', 'kỹ năng', 'competencies', 'technical skills'],
  //     experience: ['experience', 'kinh nghiệm', 'work experience', 'employment'],
  //     education: ['education', 'học vấn', 'academic', 'degree', 'bằng cấp']
  //   };
  //   for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
  //     const page = await pdf.getPage(pageNum);
  //     const textContent = await page.getTextContent();
  //     (textContent.items as any[]).forEach(item => {
  //       let x = Number(item.transform[4]);
  //       let y = Number(item.transform[5]);
  //       let fontSize = Number(item.height);
  //       let width = Number(item.width);
  //       let height = Number(item.height);
  //       if (!Number.isFinite(x)) x = 0;
  //       if (!Number.isFinite(y)) y = 0;
  //       if (!Number.isFinite(fontSize)) fontSize = 12;
  //       if (!Number.isFinite(width)) width = 100;
  //       if (!Number.isFinite(height)) height = 20;
  //       if (typeof item.str === 'string') {
  //         const str = item.str.toLowerCase();
  //         for (const [field, keys] of Object.entries(keywords)) {
  //           if (keys.some(k => str.includes(k))) {
  //             // Nếu đã có mapping, chọn block có width*height lớn hơn hoặc y lớn hơn (gần đầu trang hơn)
  //             if (
  //               !mapping[field] ||
  //               (height * width > mapping[field].height * mapping[field].width) ||
  //               (y > mapping[field].y)
  //             ) {
  //               mapping[field] = { x, y, page: pageNum - 1, width, height, fontSize };
  //             }
  //           }
  //         }
  //       }
  //     });
  //   }
  //   return mapping;
  // }

  /**
   * Upload original CV PDF, replace content with AI-optimized content, and return the new PDF (preserving original layout)
   */
  @UseGuards(JwtAuthGuard)
  @Post('upload-replace-content-pdf')
  @UseInterceptors(
    FileInterceptor('cvFile', {
      storage: multer.memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^application\/pdf$/)) {
          return cb(
            new BadRequestException('Only PDF files are allowed for CV upload!'),
            false
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    })
  )
  async uploadReplaceContentPdf(
    @UploadedFile() file: any,
    @Body('jobDescription') jobDescription: string,
    @User('_id') userId: string,
    @Body('additionalRequirements') additionalRequirements: string,
    @Res() res: any
  ) {
    if (!file) {
      throw new BadRequestException('No CV file uploaded or invalid file type.');
    }
    if (!jobDescription || jobDescription.trim().length === 0) {
      throw new BadRequestException('Job description is required.');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required.');
    }
    // Gọi service để thay thế nội dung trong PDF gốc
    const result = await this.cvAiService.replaceContentInOriginalPdfBuffer(
      userId,
      file.buffer,
      jobDescription,
      additionalRequirements
    );
    if (!result.success || !result.pdfBuffer) {
      throw new BadRequestException(result.error || 'Failed to process CV');
    }
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="optimized-original-layout.pdf"',
    });
    res.send(result.pdfBuffer);
  }

  /**
   * Auto-mapping: Nhận file PDF, trả về danh sách đoạn text và vị trí để AI hoặc frontend phân loại
   */
  @UseGuards(JwtAuthGuard)
  @Post('auto-mapping-pdf')
  @UseInterceptors(FileInterceptor('cvFile', {
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!file.mimetype || !file.mimetype.includes('pdf')) {
        return cb(new BadRequestException('Only PDF files are allowed!'), false);
      }
      cb(null, true);
    }
  }))
  async autoMappingPdf(
    @UploadedFile() file: any,
    @Res() res: any
  ) {
    if (!file) {
      throw new BadRequestException('No CV file uploaded or invalid file type.');
    }
    try {
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(file.buffer) });
      const pdf = await loadingTask.promise;
      const results: any[] = [];
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        (textContent.items as any[]).forEach(item => {
          // Đảm bảo các giá trị là số hợp lệ, nếu không thì gán mặc định
          const x = typeof item.transform[4] === 'number' && !isNaN(item.transform[4]) ? item.transform[4] : 0;
          const y = typeof item.transform[5] === 'number' && !isNaN(item.transform[5]) ? item.transform[5] : 0;
          const fontSize = typeof item.height === 'number' && !isNaN(item.height) ? item.height : 12;
          const width = typeof item.width === 'number' && !isNaN(item.width) ? item.width : 100;
          const height = typeof item.height === 'number' && !isNaN(item.height) ? item.height : 20;
          results.push({
            text: item.str,
            page: pageNum - 1,
            x,
            y,
            fontSize,
            width,
            height
          });
        });
      }
      res.json({ success: true, mappingCandidates: results });
    } catch (error) {
      throw new BadRequestException(`Failed to extract mapping: ${error.message}`);
    }
  }

  /**
   * Get a specific CV by ID
   * @param id - The ID of the CV to retrieve
   * @param userId - The ID of the authenticated user
   * @returns CV object if found and user has access
   * @requires Authentication
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getById(@Param('id') id: string, @User('_id') userId: string) {
    return this.cvService.getCVById(id, userId);
  }

  /**
   * Create a new CV
   * @param createCvDto - The CV data
   * @param userId - The ID of the authenticated user
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async createCV(@Body() createCvDto: CreateCvDto, @User('_id') userId: string) {
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
  @Patch(':id')
  update(@Param('id') id: string, @Body() data, @User('_id') userId: string) {
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
  @Delete(':id')
  delete(@Param('id') id: string, @User('_id') userId: string) {
    return this.cvService.deleteCV(id, userId);
  }

  /**
   * Save a CV
   * @param id - The ID of the CV to save
   * @param userId - The ID of the authenticated user
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/save')
  async saveCV(@Param('id') id: string, @User('_id') userId: string) {
    return this.cvService.saveCV(id, userId);
  }

  /**
   * Unsave a CV
   * @param id - The ID of the CV to unsave
   * @param userId - The ID of the authenticated user
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/unsave')
  async unsaveCV(@Param('id') id: string, @User('_id') userId: string) {
    return this.cvService.unsaveCV(id, userId);
  }

  /**
   * Share a CV
   * @param id - The ID of the CV to share
   * @param userId - The ID of the authenticated user
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/share')
  async shareCV(@Param('id') id: string, @User('_id') userId: string) {
    return this.cvService.shareCV(id, userId);
  }

  /**
   * Unshare a CV
   * @param id - The ID of the CV to unshare
   * @param userId - The ID of the authenticated user
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/unshare')
  async unshareCV(@Param('id') id: string, @User('_id') userId: string) {
    return this.cvService.unshareCV(id, userId);
  }

  @Post('html-to-pdf')
  async htmlToPdf(@Body('html') html: string, @Res() res: any) {
    if (!html || html.trim().length === 0) {
      throw new BadRequestException('HTML content is required.');
    }
    try {
      const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
      await browser.close();

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="final-cv.pdf"',
      });
      res.send(pdfBuffer);
    } catch (error) {
      throw new BadRequestException('Failed to generate PDF: ' + error.message);
    }
  }

  @Post('overlay-optimize-cv')
  @UseInterceptors(FileInterceptor('cvFile', {
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!file.mimetype || !file.mimetype.includes('pdf')) {
        return cb(new BadRequestException('Only PDF files are allowed!'), false);
      }
      cb(null, true);
    }
  }))
  async overlayOptimizeCv(
    @UploadedFile() file: any,
    @Body('jobDescription') jobDescription: string,
    @Body('additionalRequirements') additionalRequirements: string,
    @Res() res: any
  ) {
    if (!file) {
      throw new BadRequestException('No CV file uploaded or invalid file type.');
    }
    try {
      const result = await this.cvAiService.optimizePdfCvWithOriginalLayoutAI(file.buffer, jobDescription, additionalRequirements);
      if (!result.success || !result.pdfBuffer) {
        throw new BadRequestException(result.error || 'Failed to optimize CV');
      }
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="optimized-cv.pdf"',
      });
      res.send(result.pdfBuffer);
    } catch (error) {
      throw new BadRequestException(`Failed to optimize CV: ${error.message}`);
    }
  }

  /**
   * Viết lại mô tả công việc trong work experience cho chuyên nghiệp hơn
   */
  @UseGuards(JwtAuthGuard)
  @Post('rewrite-work-description')
  async rewriteWorkDescription(@Body('description') description: string, @Body('language') language?: string) {
    if (!description || description.trim().length === 0) {
      throw new BadRequestException('Description is required.');
    }
    const rewritten = await this.cvAiService.rewriteWorkDescription(description, language);
    return { rewritten };
  }
} 