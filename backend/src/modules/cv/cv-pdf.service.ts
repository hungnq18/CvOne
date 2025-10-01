// NOTE: Để tránh lỗi font Unicode, hãy tải các file font Roboto sau và đặt vào backend/src/assets/fonts/:
// - Roboto-Regular.ttf
// - Roboto-Bold.ttf
// - Roboto-Italic.ttf
// Có thể tải tại https://fonts.google.com/specimen/Roboto

import { Injectable, Logger } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
const PDFDocument = require("pdfkit");

@Injectable()
export class CvPdfService {
  private readonly logger = new Logger(CvPdfService.name);

  /**
   * Generate PDF CV based on CV analysis and job description
   */
  async generateCvPdf(
    cvAnalysis: any,
    jobDescription: string,
    outputPath: string,
  ): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50,
        },
      });

      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Header with personal info
      this.addHeader(doc, cvAnalysis.personalInfo);

      // Professional Summary
      this.addSection(doc, "Professional Summary", cvAnalysis.summary);

      // Skills Section
      this.addSkillsSection(doc, cvAnalysis.skills);

      // Work Experience
      this.addWorkExperienceSection(doc, cvAnalysis.workExperience);

      // Education
      this.addEducationSection(doc, cvAnalysis.education);

      // Certifications
      if (cvAnalysis.certifications && cvAnalysis.certifications.length > 0) {
        this.addSection(
          doc,
          "Certifications",
          cvAnalysis.certifications.join(", "),
        );
      }

      // Job Description Analysis
      this.addJobDescriptionSection(doc, jobDescription);

      doc.end();

      return new Promise((resolve, reject) => {
        stream.on("finish", () => {
          this.logger.log(`PDF generated successfully: ${outputPath}`);
          resolve({ success: true, filePath: outputPath });
        });

        stream.on("error", (error) => {
          this.logger.error(`Error generating PDF: ${error.message}`);
          reject({ success: false, error: error.message });
        });
      });
    } catch (error) {
      this.logger.error(`Error in generateCvPdf: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Add header with personal information
   */
  private addHeader(doc: PDFKit.PDFDocument, personalInfo: any) {
    // Name
    doc
      .fontSize(24)
      .font("Roboto-Bold")
      .text(personalInfo.name || "Your Name", { align: "center" });

    doc.moveDown(0.5);

    // Contact info
    doc
      .fontSize(12)
      .font("Roboto")
      .text(`${personalInfo.email || "email@example.com"}`, {
        align: "center",
      });

    doc
      .fontSize(12)
      .font("Roboto")
      .text(
        `${personalInfo.phone || "Phone Number"} | ${personalInfo.location || "Location"}`,
        { align: "center" },
      );

    doc.moveDown(2);
  }

  /**
   * Add a section with title and content
   */
  private addSection(doc: any, title: string, content: string) {
    // Section title
    doc.fontSize(16).font("Roboto-Bold").text(title);

    doc.moveDown(0.5);

    // Section content
    doc.fontSize(12).font("Roboto").text(content, { align: "justify" });

    doc.moveDown(1);
  }

  /**
   * Add skills section with ratings
   */
  private addSkillsSection(
    doc: PDFKit.PDFDocument,
    skills: Array<{ name: string; rating: number }>,
  ) {
    doc.fontSize(16).font("Roboto-Bold").text("Skills");

    doc.moveDown(0.5);

    if (skills && skills.length > 0) {
      const skillsPerRow = 3;
      let currentRow: string[] = [];

      skills.forEach((skill, index) => {
        currentRow.push(`${skill.name} (${skill.rating}/5)`);

        if (currentRow.length === skillsPerRow || index === skills.length - 1) {
          doc.fontSize(12).font("Roboto").text(currentRow.join(" • "));
          currentRow = [];
        }
      });
    } else {
      doc.fontSize(12).font("Roboto").text("No skills listed");
    }

    doc.moveDown(1);
  }

  /**
   * Add work experience section
   */
  private addWorkExperienceSection(
    doc: PDFKit.PDFDocument,
    workExperience: Array<any>,
  ) {
    doc.fontSize(16).font("Roboto-Bold").text("Work Experience");

    doc.moveDown(0.5);

    if (workExperience && workExperience.length > 0) {
      workExperience.forEach((job, index) => {
        // Job title and company
        doc
          .fontSize(14)
          .font("Roboto-Bold")
          .text(`${job.title} at ${job.company}`);

        // Dates
        doc
          .fontSize(12)
          .font("Roboto-Oblique")
          .text(`${job.startDate} - ${job.endDate}`);

        doc.moveDown(0.5);

        // Description
        doc
          .fontSize(12)
          .font("Roboto")
          .text(job.description, { align: "justify" });

        if (index < workExperience.length - 1) {
          doc.moveDown(1);
        }
      });
    } else {
      doc.fontSize(12).font("Roboto").text("No work experience listed");
    }

    doc.moveDown(1);
  }

  /**
   * Add education section
   */
  private addEducationSection(doc: PDFKit.PDFDocument, education: Array<any>) {
    doc.fontSize(16).font("Roboto-Bold").text("Education");

    doc.moveDown(0.5);

    if (education && education.length > 0) {
      education.forEach((edu, index) => {
        // Degree and institution
        doc
          .fontSize(14)
          .font("Roboto-Bold")
          .text(`${edu.degree} from ${edu.institution}`);

        // Dates
        doc
          .fontSize(12)
          .font("Roboto-Oblique")
          .text(`${edu.startDate} - ${edu.endDate}`);

        if (index < education.length - 1) {
          doc.moveDown(0.5);
        }
      });
    } else {
      doc.fontSize(12).font("Roboto").text("No education listed");
    }

    doc.moveDown(1);
  }

  /**
   * Add job description analysis section
   */
  private addJobDescriptionSection(
    doc: PDFKit.PDFDocument,
    jobDescription: string,
  ) {
    doc.fontSize(16).font("Roboto-Bold").text("Target Job Description");

    doc.moveDown(0.5);

    doc.fontSize(12).font("Roboto").text(jobDescription, { align: "justify" });

    doc.moveDown(1);
  }

  /**
   * Create optimized CV PDF based on job description
   */
  async createOptimizedCvPdf(
    cvAnalysis: any,
    jobDescription: string,
    jobAnalysis: any,
    outputPath: string,
  ): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50,
        },
      });

      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Header with personal info
      this.addHeader(doc, cvAnalysis.personalInfo);

      // Optimized Professional Summary
      const optimizedSummary = this.generateOptimizedSummary(
        cvAnalysis,
        jobAnalysis,
      );
      this.addSection(doc, "Professional Summary", optimizedSummary);

      // Prioritized Skills (matching job requirements)
      const prioritizedSkills = this.prioritizeSkills(
        cvAnalysis.skills,
        jobAnalysis,
      );
      this.addSkillsSection(doc, prioritizedSkills);

      // Work Experience (highlighting relevant experience)
      this.addWorkExperienceSection(doc, cvAnalysis.workExperience);

      // Education
      this.addEducationSection(doc, cvAnalysis.education);

      // Certifications
      if (cvAnalysis.certifications && cvAnalysis.certifications.length > 0) {
        this.addSection(
          doc,
          "Certifications",
          cvAnalysis.certifications.join(", "),
        );
      }

      // Job Requirements Match
      this.addJobRequirementsMatch(doc, cvAnalysis, jobAnalysis);

      doc.end();

      return new Promise((resolve, reject) => {
        stream.on("finish", () => {
          this.logger.log(
            `Optimized PDF generated successfully: ${outputPath}`,
          );
          resolve({ success: true, filePath: outputPath });
        });

        stream.on("error", (error) => {
          this.logger.error(`Error generating optimized PDF: ${error.message}`);
          reject({ success: false, error: error.message });
        });
      });
    } catch (error) {
      this.logger.error(`Error in createOptimizedCvPdf: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate optimized summary based on job requirements
   */
  private generateOptimizedSummary(cvAnalysis: any, jobAnalysis: any): string {
    const relevantSkills =
      jobAnalysis.requiredSkills?.slice(0, 3).join(", ") || "";
    const experienceLevel = jobAnalysis.experienceLevel || "professional";

    return `Experienced ${experienceLevel} professional with expertise in ${relevantSkills}. 
    Demonstrated success in ${cvAnalysis.workExperience?.length || 0} positions with strong focus on 
    ${jobAnalysis.industry || "technology"} industry. Proven track record of delivering high-quality 
    solutions and collaborating effectively with cross-functional teams.`;
  }

  /**
   * Prioritize skills based on job requirements
   */
  private prioritizeSkills(
    cvSkills: Array<{ name: string; rating: number }>,
    jobAnalysis: any,
  ): Array<{ name: string; rating: number }> {
    if (!cvSkills) return [];

    const requiredSkills = jobAnalysis.requiredSkills || [];
    const technologies = jobAnalysis.technologies || [];

    return cvSkills.sort((a, b) => {
      const aIsRequired = requiredSkills.some(
        (skill) =>
          a.name.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(a.name.toLowerCase()),
      );
      const bIsRequired = requiredSkills.some(
        (skill) =>
          b.name.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(b.name.toLowerCase()),
      );

      if (aIsRequired && !bIsRequired) return -1;
      if (!aIsRequired && bIsRequired) return 1;
      return b.rating - a.rating;
    });
  }

  /**
   * Add job requirements match section
   */
  private addJobRequirementsMatch(
    doc: PDFKit.PDFDocument,
    cvAnalysis: any,
    jobAnalysis: any,
  ) {
    doc.fontSize(16).font("Roboto-Bold").text("Job Requirements Match");

    doc.moveDown(0.5);

    const requiredSkills = jobAnalysis.requiredSkills || [];
    const cvSkillNames =
      cvAnalysis.skills?.map((s) => s.name.toLowerCase()) || [];

    const matchedSkills = requiredSkills.filter((skill) =>
      cvSkillNames.some(
        (cvSkill) =>
          cvSkill.includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(cvSkill),
      ),
    );

    const missingSkills = requiredSkills.filter(
      (skill) =>
        !cvSkillNames.some(
          (cvSkill) =>
            cvSkill.includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(cvSkill),
        ),
    );

    doc.fontSize(12).font("Roboto-Bold").text("Matched Skills:");

    doc
      .fontSize(12)
      .font("Roboto")
      .text(matchedSkills.length > 0 ? matchedSkills.join(", ") : "None");

    doc.moveDown(0.5);

    doc.fontSize(12).font("Roboto-Bold").text("Missing Skills:");

    doc
      .fontSize(12)
      .font("Roboto")
      .text(missingSkills.length > 0 ? missingSkills.join(", ") : "None");
  }

  /**
   * Create optimized CV PDF with original layout preserved
   */
  async createOptimizedCvPdfWithOriginalLayout(
    originalCvAnalysis: any,
    optimizedCv: any,
    jobDescription: string,
    jobAnalysis: any,
    outputPath: string,
  ): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50,
        },
      });

      // Đăng ký font Unicode
      const fontDir = path.join(__dirname, "../assets/fonts");
      doc.registerFont("Roboto", path.join(fontDir, "Roboto-Regular.ttf"));
      doc.registerFont("Roboto-Bold", path.join(fontDir, "Roboto-Bold.ttf"));
      doc.registerFont(
        "Roboto-Italic",
        path.join(fontDir, "Roboto-Italic.ttf"),
      );

      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Header with personal info (using optimized data but original layout)
      this.addEnhancedHeader(doc, {
        name: `${optimizedCv.userData.firstName} ${optimizedCv.userData.lastName}`,
        email: optimizedCv.userData.email,
        phone: optimizedCv.userData.phone,
        location: `${optimizedCv.userData.city}, ${optimizedCv.userData.country}`,
        professional: optimizedCv.userData.professional,
      });

      // Professional Summary (optimized with highlighting)
      this.addEnhancedSummarySection(
        doc,
        optimizedCv.userData.summary,
        jobAnalysis,
      );

      // Skills (optimized and prioritized with visual enhancement)
      const prioritizedSkills = this.prioritizeSkills(
        optimizedCv.userData.skills,
        jobAnalysis,
      );
      this.addEnhancedSkillsSection(doc, prioritizedSkills, jobAnalysis);

      // Work Experience (optimized with achievements highlighting)
      this.addEnhancedWorkExperienceSection(
        doc,
        optimizedCv.userData.workHistory,
        jobAnalysis,
      );

      // Education (optimized)
      this.addEnhancedEducationSection(doc, optimizedCv.userData.education);

      // Key Achievements Section (new)
      this.addKeyAchievementsSection(
        doc,
        optimizedCv.userData.workHistory,
        jobAnalysis,
      );

      // Job Requirements Match Analysis (enhanced)
      this.addEnhancedJobRequirementsMatch(
        doc,
        optimizedCv.userData,
        jobAnalysis,
      );

      doc.end();

      return new Promise((resolve, reject) => {
        stream.on("finish", () => {
          this.logger.log(
            `Enhanced optimized PDF with original layout generated successfully: ${outputPath}`,
          );
          resolve({ success: true, filePath: outputPath });
        });

        stream.on("error", (error) => {
          this.logger.error(`Error generating optimized PDF: ${error.message}`);
          reject({ success: false, error: error.message });
        });
      });
    } catch (error) {
      this.logger.error(
        `Error in createOptimizedCvPdfWithOriginalLayout: ${error.message}`,
      );
      return { success: false, error: error.message };
    }
  }

  /**
   * Create optimized CV PDF with original layout and return as buffer (no file output)
   */
  async createOptimizedCvPdfBufferWithOriginalLayout(
    originalCvAnalysis: any,
    optimizedCv: any,
    jobDescription: string,
    jobAnalysis: any,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const PDFDocument = require("pdfkit");
      const { PassThrough } = require("stream");
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });
      // Đăng ký font Unicode
      const fontDir = path.join(__dirname, "../assets/fonts");
      doc.registerFont("Roboto", path.join(fontDir, "Roboto-Regular.ttf"));
      doc.registerFont("Roboto-Bold", path.join(fontDir, "Roboto-Bold.ttf"));
      doc.registerFont(
        "Roboto-Italic",
        path.join(fontDir, "Roboto-Italic.ttf"),
      );
      const bufferChunks: Buffer[] = [];
      const passthrough = new PassThrough();
      doc.pipe(passthrough);
      passthrough.on("data", (chunk: Buffer) => bufferChunks.push(chunk));
      passthrough.on("end", () => resolve(Buffer.concat(bufferChunks)));
      passthrough.on("error", (err: any) => reject(err));

      // Header with personal info (using optimized data but original layout)
      this.addEnhancedHeader(doc, {
        name: `${optimizedCv.userData.firstName} ${optimizedCv.userData.lastName}`,
        email: optimizedCv.userData.email,
        phone: optimizedCv.userData.phone,
        location: `${optimizedCv.userData.city}, ${optimizedCv.userData.country}`,
        professional: optimizedCv.userData.professional,
      });

      // Professional Summary (optimized with highlighting)
      this.addEnhancedSummarySection(
        doc,
        optimizedCv.userData.summary,
        jobAnalysis,
      );

      // Skills (optimized and prioritized with visual enhancement)
      const prioritizedSkills = this.prioritizeSkills(
        optimizedCv.userData.skills,
        jobAnalysis,
      );
      this.addEnhancedSkillsSection(doc, prioritizedSkills, jobAnalysis);

      // Work Experience (optimized with achievements highlighting)
      this.addEnhancedWorkExperienceSection(
        doc,
        optimizedCv.userData.workHistory,
        jobAnalysis,
      );

      // Education (optimized)
      this.addEnhancedEducationSection(doc, optimizedCv.userData.education);

      // Key Achievements Section (new)
      this.addKeyAchievementsSection(
        doc,
        optimizedCv.userData.workHistory,
        jobAnalysis,
      );

      // Job Requirements Match Analysis (enhanced)
      this.addEnhancedJobRequirementsMatch(
        doc,
        optimizedCv.userData,
        jobAnalysis,
      );

      doc.end();
    });
  }

  /**
   * Enhanced header with professional title
   */
  private addEnhancedHeader(doc: PDFKit.PDFDocument, personalInfo: any) {
    // Name
    doc
      .fontSize(24)
      .font("Roboto-Bold")
      .text(personalInfo.name || "Your Name", { align: "center" });

    doc.moveDown(0.3);

    // Professional title
    if (personalInfo.professional) {
      doc
        .fontSize(16)
        .font("Roboto-Italic")
        .text(personalInfo.professional, { align: "center" });
      doc.moveDown(0.5);
    }

    // Contact info
    doc
      .fontSize(12)
      .font("Roboto")
      .text(`${personalInfo.email || "email@example.com"}`, {
        align: "center",
      });

    doc
      .fontSize(12)
      .font("Roboto")
      .text(
        `${personalInfo.phone || "Phone Number"} | ${personalInfo.location || "Location"}`,
        { align: "center" },
      );

    doc.moveDown(2);
  }

  /**
   * Enhanced summary section with key highlights
   */
  private addEnhancedSummarySection(
    doc: PDFKit.PDFDocument,
    summary: string,
    jobAnalysis: any,
  ) {
    doc.fontSize(16).font("Roboto-Bold").text("Professional Summary");

    doc.moveDown(0.5);

    // Add a subtle background highlight for the summary
    const summaryLines = summary.split("\n");
    summaryLines.forEach((line, index) => {
      doc.fontSize(12).font("Roboto").text(line.trim(), { align: "justify" });

      if (index < summaryLines.length - 1) {
        doc.moveDown(0.3);
      }
    });

    doc.moveDown(1);
  }

  /**
   * Enhanced skills section with visual prioritization
   */
  private addEnhancedSkillsSection(
    doc: PDFKit.PDFDocument,
    skills: Array<{ name: string; rating: number }>,
    jobAnalysis: any,
  ) {
    doc.fontSize(16).font("Roboto-Bold").text("Core Competencies");

    doc.moveDown(0.5);

    if (skills && skills.length > 0) {
      const requiredSkills = jobAnalysis.requiredSkills || [];
      const technologies = jobAnalysis.technologies || [];

      // Group skills by relevance
      const highPrioritySkills = skills.filter(
        (skill) =>
          requiredSkills.some(
            (req) =>
              skill.name.toLowerCase().includes(req.toLowerCase()) ||
              req.toLowerCase().includes(skill.name.toLowerCase()),
          ) ||
          technologies.some(
            (tech) =>
              skill.name.toLowerCase().includes(tech.toLowerCase()) ||
              tech.toLowerCase().includes(skill.name.toLowerCase()),
          ),
      );

      const otherSkills = skills.filter(
        (skill) => !highPrioritySkills.some((high) => high.name === skill.name),
      );

      // Display high priority skills first with emphasis
      if (highPrioritySkills.length > 0) {
        doc.fontSize(12).font("Roboto-Bold").text("Key Skills (Job-Relevant):");

        doc.moveDown(0.3);

        const skillsPerRow = 2;
        let currentRow: string[] = [];

        highPrioritySkills.forEach((skill, index) => {
          currentRow.push(`★ ${skill.name} (${skill.rating}/5)`);

          if (
            currentRow.length === skillsPerRow ||
            index === highPrioritySkills.length - 1
          ) {
            doc.fontSize(11).font("Roboto").text(currentRow.join("    "));
            currentRow = [];
          }
        });

        doc.moveDown(0.5);
      }

      // Display other skills
      if (otherSkills.length > 0) {
        doc.fontSize(12).font("Roboto-Bold").text("Additional Skills:");

        doc.moveDown(0.3);

        const skillsPerRow = 3;
        let currentRow: string[] = [];

        otherSkills.forEach((skill, index) => {
          currentRow.push(`${skill.name} (${skill.rating}/5)`);

          if (
            currentRow.length === skillsPerRow ||
            index === otherSkills.length - 1
          ) {
            doc.fontSize(11).font("Roboto").text(currentRow.join(" • "));
            currentRow = [];
          }
        });
      }
    } else {
      doc.fontSize(12).font("Roboto").text("No skills listed");
    }

    doc.moveDown(1);
  }

  /**
   * Enhanced work experience section with achievements highlighting
   */
  private addEnhancedWorkExperienceSection(
    doc: PDFKit.PDFDocument,
    workExperience: Array<any>,
    jobAnalysis: any,
  ) {
    doc.fontSize(16).font("Roboto-Bold").text("Professional Experience");

    doc.moveDown(0.5);

    if (workExperience && workExperience.length > 0) {
      workExperience.forEach((job, index) => {
        // Job title and company
        doc
          .fontSize(14)
          .font("Roboto-Bold")
          .text(`${job.title} at ${job.company}`);

        // Dates
        doc
          .fontSize(12)
          .font("Roboto-Italic")
          .text(`${job.startDate} - ${job.endDate}`);

        doc.moveDown(0.5);

        // Description with achievement highlighting
        const description = job.description;
        const sentences = description.split(". ");

        sentences.forEach((sentence, sentIndex) => {
          const trimmedSentence = sentence.trim();
          if (trimmedSentence) {
            // Highlight sentences that contain achievement keywords
            const achievementKeywords = [
              "achieved",
              "increased",
              "improved",
              "developed",
              "led",
              "managed",
              "delivered",
              "reduced",
              "optimized",
              "implemented",
            ];
            const isAchievement = achievementKeywords.some((keyword) =>
              trimmedSentence.toLowerCase().includes(keyword),
            );

            if (isAchievement) {
              doc
                .fontSize(12)
                .font("Roboto-Bold")
                .text(`• ${trimmedSentence}.`, { align: "justify" });
            } else {
              doc
                .fontSize(12)
                .font("Roboto")
                .text(`• ${trimmedSentence}.`, { align: "justify" });
            }
          }
        });

        if (index < workExperience.length - 1) {
          doc.moveDown(1);
        }
      });
    } else {
      doc.fontSize(12).font("Roboto").text("No work experience listed");
    }

    doc.moveDown(1);
  }

  /**
   * Enhanced education section
   */
  private addEnhancedEducationSection(
    doc: PDFKit.PDFDocument,
    education: Array<any>,
  ) {
    doc.fontSize(16).font("Roboto-Bold").text("Education");

    doc.moveDown(0.5);

    if (education && education.length > 0) {
      education.forEach((edu, index) => {
        // Degree and major
        doc
          .fontSize(14)
          .font("Roboto-Bold")
          .text(`${edu.degree} in ${edu.major}`);

        // Institution
        doc.fontSize(12).font("Roboto").text(edu.institution);

        // Dates
        doc
          .fontSize(12)
          .font("Roboto-Italic")
          .text(`${edu.startDate} - ${edu.endDate}`);

        if (index < education.length - 1) {
          doc.moveDown(0.5);
        }
      });
    } else {
      doc.fontSize(12).font("Roboto").text("No education listed");
    }

    doc.moveDown(1);
  }

  /**
   * New section for key achievements
   */
  private addKeyAchievementsSection(
    doc: PDFKit.PDFDocument,
    workHistory: Array<any>,
    jobAnalysis: any,
  ) {
    doc.fontSize(16).font("Roboto-Bold").text("Key Achievements");

    doc.moveDown(0.5);

    const achievements: string[] = [];

    // Extract achievements from work history
    workHistory.forEach((job) => {
      const description = job.description || "";
      const sentences = description.split(". ");

      sentences.forEach((sentence) => {
        const trimmedSentence = sentence.trim();
        const achievementKeywords = [
          "achieved",
          "increased",
          "improved",
          "developed",
          "led",
          "managed",
          "delivered",
          "reduced",
          "optimized",
          "implemented",
        ];

        if (
          achievementKeywords.some((keyword) =>
            trimmedSentence.toLowerCase().includes(keyword),
          )
        ) {
          achievements.push(trimmedSentence);
        }
      });
    });

    if (achievements.length > 0) {
      // Take top 3-5 achievements
      const topAchievements = achievements.slice(0, 5);

      topAchievements.forEach((achievement, index) => {
        doc
          .fontSize(12)
          .font("Roboto-Bold")
          .text(`• ${achievement}`, { align: "justify" });

        if (index < topAchievements.length - 1) {
          doc.moveDown(0.3);
        }
      });
    } else {
      doc.fontSize(12).font("Roboto").text("No specific achievements listed");
    }

    doc.moveDown(1);
  }

  /**
   * Enhanced job requirements match analysis
   */
  private addEnhancedJobRequirementsMatch(
    doc: PDFKit.PDFDocument,
    cvData: any,
    jobAnalysis: any,
  ) {
    doc.fontSize(16).font("Roboto-Bold").text("Job Requirements Analysis");

    doc.moveDown(0.5);

    const requiredSkills = jobAnalysis.requiredSkills || [];
    const cvSkillNames = cvData.skills?.map((s) => s.name.toLowerCase()) || [];

    const matchedSkills = requiredSkills.filter((skill) =>
      cvSkillNames.some(
        (cvSkill) =>
          cvSkill.includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(cvSkill),
      ),
    );

    const missingSkills = requiredSkills.filter(
      (skill) =>
        !cvSkillNames.some(
          (cvSkill) =>
            cvSkill.includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(cvSkill),
        ),
    );

    // Match percentage
    const matchPercentage =
      requiredSkills.length > 0
        ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
        : 0;

    doc
      .fontSize(12)
      .font("Roboto-Bold")
      .text(`Overall Match: ${matchPercentage}%`);

    doc.moveDown(0.5);

    doc.fontSize(12).font("Roboto-Bold").text("Matched Skills:");

    doc
      .fontSize(12)
      .font("Roboto")
      .text(matchedSkills.length > 0 ? matchedSkills.join(", ") : "None");

    doc.moveDown(0.5);

    if (missingSkills.length > 0) {
      doc.fontSize(12).font("Roboto-Bold").text("Skills to Develop:");

      doc.fontSize(12).font("Roboto").text(missingSkills.join(", "));
    }
  }
}
