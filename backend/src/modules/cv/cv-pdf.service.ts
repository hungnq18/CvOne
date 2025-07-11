import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import PDFDocument from 'pdfkit';

@Injectable()
export class CvPdfService {
  private readonly logger = new Logger(CvPdfService.name);

  /**
   * Generate PDF CV based on CV analysis and job description
   */
  async generateCvPdf(
    cvAnalysis: any,
    jobDescription: string,
    outputPath: string
  ): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });

      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Header with personal info
      this.addHeader(doc, cvAnalysis.personalInfo);
      
      // Professional Summary
      this.addSection(doc, 'Professional Summary', cvAnalysis.summary);
      
      // Skills Section
      this.addSkillsSection(doc, cvAnalysis.skills);
      
      // Work Experience
      this.addWorkExperienceSection(doc, cvAnalysis.workExperience);
      
      // Education
      this.addEducationSection(doc, cvAnalysis.education);
      
      // Certifications
      if (cvAnalysis.certifications && cvAnalysis.certifications.length > 0) {
        this.addSection(doc, 'Certifications', cvAnalysis.certifications.join(', '));
      }

      // Job Description Analysis
      this.addJobDescriptionSection(doc, jobDescription);

      doc.end();

      return new Promise((resolve, reject) => {
        stream.on('finish', () => {
          this.logger.log(`PDF generated successfully: ${outputPath}`);
          resolve({ success: true, filePath: outputPath });
        });
        
        stream.on('error', (error) => {
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
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .text(personalInfo.name || 'Your Name', { align: 'center' });
    
    doc.moveDown(0.5);

    // Contact info
    doc.fontSize(12)
       .font('Helvetica')
       .text(`${personalInfo.email || 'email@example.com'}`, { align: 'center' });
    
    doc.fontSize(12)
       .text(`${personalInfo.phone || 'Phone Number'} | ${personalInfo.location || 'Location'}`, { align: 'center' });
    
    doc.moveDown(2);
  }

  /**
   * Add a section with title and content
   */
  private addSection(doc: any, title: string, content: string) {
    // Section title
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text(title);
    
    doc.moveDown(0.5);

    // Section content
    doc.fontSize(12)
       .font('Helvetica')
       .text(content, { align: 'justify' });
    
    doc.moveDown(1);
  }

  /**
   * Add skills section with ratings
   */
  private addSkillsSection(doc: PDFKit.PDFDocument, skills: Array<{ name: string; rating: number }>) {
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('Skills');
    
    doc.moveDown(0.5);

    if (skills && skills.length > 0) {
      const skillsPerRow = 3;
      let currentRow: string[] = [];

      skills.forEach((skill, index) => {
        currentRow.push(`${skill.name} (${skill.rating}/5)`);
        
        if (currentRow.length === skillsPerRow || index === skills.length - 1) {
          doc.fontSize(12)
             .font('Helvetica')
             .text(currentRow.join(' • '));
          currentRow = [];
        }
      });
    } else {
      doc.fontSize(12)
         .font('Helvetica')
         .text('No skills listed');
    }
    
    doc.moveDown(1);
  }

  /**
   * Add work experience section
   */
  private addWorkExperienceSection(doc: PDFKit.PDFDocument, workExperience: Array<any>) {
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('Work Experience');
    
    doc.moveDown(0.5);

    if (workExperience && workExperience.length > 0) {
      workExperience.forEach((job, index) => {
        // Job title and company
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text(`${job.title} at ${job.company}`);
        
        // Dates
        doc.fontSize(12)
           .font('Helvetica-Oblique')
           .text(`${job.startDate} - ${job.endDate}`);
        
        doc.moveDown(0.5);

        // Description
        doc.fontSize(12)
           .font('Helvetica')
           .text(job.description, { align: 'justify' });
        
        if (index < workExperience.length - 1) {
          doc.moveDown(1);
        }
      });
    } else {
      doc.fontSize(12)
         .font('Helvetica')
         .text('No work experience listed');
    }
    
    doc.moveDown(1);
  }

  /**
   * Add education section
   */
  private addEducationSection(doc: PDFKit.PDFDocument, education: Array<any>) {
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('Education');
    
    doc.moveDown(0.5);

    if (education && education.length > 0) {
      education.forEach((edu, index) => {
        // Degree and institution
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text(`${edu.degree} from ${edu.institution}`);
        
        // Dates
        doc.fontSize(12)
           .font('Helvetica-Oblique')
           .text(`${edu.startDate} - ${edu.endDate}`);
        
        if (index < education.length - 1) {
          doc.moveDown(0.5);
        }
      });
    } else {
      doc.fontSize(12)
         .font('Helvetica')
         .text('No education listed');
    }
    
    doc.moveDown(1);
  }

  /**
   * Add job description analysis section
   */
  private addJobDescriptionSection(doc: PDFKit.PDFDocument, jobDescription: string) {
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('Target Job Description');
    
    doc.moveDown(0.5);

    doc.fontSize(12)
       .font('Helvetica')
       .text(jobDescription, { align: 'justify' });
    
    doc.moveDown(1);
  }

  /**
   * Create optimized CV PDF based on job description
   */
  async createOptimizedCvPdf(
    cvAnalysis: any,
    jobDescription: string,
    jobAnalysis: any,
    outputPath: string
  ): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });

      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Header with personal info
      this.addHeader(doc, cvAnalysis.personalInfo);
      
      // Optimized Professional Summary
      const optimizedSummary = this.generateOptimizedSummary(cvAnalysis, jobAnalysis);
      this.addSection(doc, 'Professional Summary', optimizedSummary);
      
      // Prioritized Skills (matching job requirements)
      const prioritizedSkills = this.prioritizeSkills(cvAnalysis.skills, jobAnalysis);
      this.addSkillsSection(doc, prioritizedSkills);
      
      // Work Experience (highlighting relevant experience)
      this.addWorkExperienceSection(doc, cvAnalysis.workExperience);
      
      // Education
      this.addEducationSection(doc, cvAnalysis.education);
      
      // Certifications
      if (cvAnalysis.certifications && cvAnalysis.certifications.length > 0) {
        this.addSection(doc, 'Certifications', cvAnalysis.certifications.join(', '));
      }

      // Job Requirements Match
      this.addJobRequirementsMatch(doc, cvAnalysis, jobAnalysis);

      doc.end();

      return new Promise((resolve, reject) => {
        stream.on('finish', () => {
          this.logger.log(`Optimized PDF generated successfully: ${outputPath}`);
          resolve({ success: true, filePath: outputPath });
        });
        
        stream.on('error', (error) => {
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
    const relevantSkills = jobAnalysis.requiredSkills?.slice(0, 3).join(', ') || '';
    const experienceLevel = jobAnalysis.experienceLevel || 'professional';
    
    return `Experienced ${experienceLevel} professional with expertise in ${relevantSkills}. 
    Demonstrated success in ${cvAnalysis.workExperience?.length || 0} positions with strong focus on 
    ${jobAnalysis.industry || 'technology'} industry. Proven track record of delivering high-quality 
    solutions and collaborating effectively with cross-functional teams.`;
  }

  /**
   * Prioritize skills based on job requirements
   */
  private prioritizeSkills(cvSkills: Array<{ name: string; rating: number }>, jobAnalysis: any): Array<{ name: string; rating: number }> {
    if (!cvSkills) return [];

    const requiredSkills = jobAnalysis.requiredSkills || [];
    const technologies = jobAnalysis.technologies || [];

    return cvSkills.sort((a, b) => {
      const aIsRequired = requiredSkills.some(skill => 
        a.name.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(a.name.toLowerCase())
      );
      const bIsRequired = requiredSkills.some(skill => 
        b.name.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(b.name.toLowerCase())
      );

      if (aIsRequired && !bIsRequired) return -1;
      if (!aIsRequired && bIsRequired) return 1;
      return b.rating - a.rating;
    });
  }

  /**
   * Add job requirements match section
   */
  private addJobRequirementsMatch(doc: PDFKit.PDFDocument, cvAnalysis: any, jobAnalysis: any) {
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('Job Requirements Match');
    
    doc.moveDown(0.5);

    const requiredSkills = jobAnalysis.requiredSkills || [];
    const cvSkillNames = cvAnalysis.skills?.map(s => s.name.toLowerCase()) || [];
    
    const matchedSkills = requiredSkills.filter(skill => 
      cvSkillNames.some(cvSkill => 
        cvSkill.includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(cvSkill)
      )
    );

    const missingSkills = requiredSkills.filter(skill => 
      !cvSkillNames.some(cvSkill => 
        cvSkill.includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(cvSkill)
      )
    );

    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Matched Skills:');
    
    doc.fontSize(12)
       .font('Helvetica')
       .text(matchedSkills.length > 0 ? matchedSkills.join(', ') : 'None');

    doc.moveDown(0.5);

    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Missing Skills:');
    
    doc.fontSize(12)
       .font('Helvetica')
       .text(missingSkills.length > 0 ? missingSkills.join(', ') : 'None');
  }
} 