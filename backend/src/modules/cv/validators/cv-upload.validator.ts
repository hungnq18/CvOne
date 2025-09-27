import { BadRequestException } from '@nestjs/common';
import * as pdf from 'pdf-parse';

export class CvUploadValidator {
  /**
   * Validate uploaded file
   */
  static validateFile(file: any): void {
    if (!file) {
      throw new BadRequestException('No CV file uploaded or invalid file type.');
    }
  }

  /**
   * Validate job description
   */
  static validateJobDescription(jobDescription: string): void {
    if (!jobDescription || jobDescription.trim().length === 0) {
      throw new BadRequestException("Job description is required.");
    }
    
    if (jobDescription.trim().length < 20) {
      throw new BadRequestException("Job description is too short. Please provide more details about the position.");
    }
    
    if (jobDescription.trim().length > 10000) {
      throw new BadRequestException("Job description is too long. Please provide a more concise description.");
    }
  }

  /**
   * Validate PDF structure and extract text
   */
  static async validateAndExtractText(file: any): Promise<string> {
    let pdfData;
    try {
      pdfData = await pdf(file.buffer);
    } catch (error) {
      throw new BadRequestException('Invalid PDF file. Please ensure the file is not corrupted.');
    }
    
    const cvText = pdfData.text;
    if (!cvText || cvText.trim().length === 0) {
      throw new BadRequestException('Could not extract text from PDF. Please ensure the PDF contains readable text.');
    }
    
    if (cvText.trim().length < 50) {
      throw new BadRequestException('PDF appears to contain only images. Please use a PDF with selectable text.');
    }

    return cvText;
  }

  /**
   * Validate mapping format
   */
  static validateMapping(mapping: string): any {
    if (!mapping) return undefined;
    
    try {
      const mappingObj = JSON.parse(mapping);
      return Object.keys(mappingObj).length === 0 ? undefined : mappingObj;
    } catch (e) {
      throw new BadRequestException("Invalid mapping format");
    }
  }
}
