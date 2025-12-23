import { BadRequestException, Logger } from '@nestjs/common';
import * as pdf from 'pdf-parse';
import { pdfBufferToDecodedJson } from '../../../utils/pdf-to-json.utils';

export class CvUploadValidator {
  private static readonly logger = new Logger(CvUploadValidator.name);

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
   * Extract text from PDF using pdf-parse (for text-based PDFs)
   */
  private static async extractTextWithPdfParse(buffer: Buffer): Promise<string | null> {
    try {
      const pdfData = await pdf(buffer);
      const text = pdfData.text?.trim() || '';
      return text.length > 0 ? text : null;
    } catch (error) {
      this.logger.warn('pdf-parse extraction failed, trying alternative methods');
      return null;
    }
  }

  /**
   * Extract text from PDF using pdf2json (alternative method)
   */
  private static async extractTextWithPdf2Json(buffer: Buffer): Promise<string | null> {
    try {
      const pdfData = await pdfBufferToDecodedJson(buffer);
      if (!pdfData || !pdfData.Pages) {
        return null;
      }

      let fullText = '';
      for (const page of pdfData.Pages) {
        if (page.Texts && Array.isArray(page.Texts)) {
          for (const textObj of page.Texts) {
            if (textObj.R && Array.isArray(textObj.R)) {
              for (const r of textObj.R) {
                if (r.T) {
                  fullText += r.T + ' ';
                }
              }
            }
          }
        }
      }
      
      return fullText.trim().length > 0 ? fullText.trim() : null;
    } catch (error) {
      this.logger.warn('pdf2json extraction failed', error.message);
      return null;
    }
  }

  /**
   * Validate PDF structure and extract text using multiple methods with OCR fallback
   */
  static async validateAndExtractText(file: any, ocrService?: any): Promise<string> {
    const buffer = file.buffer;
    
    if (!buffer || buffer.length === 0) {
      throw new BadRequestException('Invalid PDF file. File is empty.');
    }

    // Method 1: Try pdf-parse first (fastest, works for text-based PDFs)
    let cvText = await this.extractTextWithPdfParse(buffer);
    
    // Method 2: If pdf-parse fails or returns little text, try pdf2json
    if (!cvText || cvText.length < 50) {
      this.logger.log('Trying pdf2json as fallback for text extraction');
      const pdf2JsonText = await this.extractTextWithPdf2Json(buffer);
      if (pdf2JsonText && pdf2JsonText.length >= 50) {
        cvText = pdf2JsonText;
      }
    }

    // Method 3: If still no text and OCR service is available, try OCR
    if ((!cvText || cvText.trim().length === 0 || cvText.length < 50) && ocrService) {
      this.logger.log('Trying OCR as fallback for image-based PDF');
      try {
        const ocrText = await ocrService.extractTextWithOcr(buffer);
        if (ocrText && ocrText.trim().length >= 30) { // Lower threshold for OCR (30 instead of 50)
          cvText = ocrText;
          this.logger.log(`Successfully extracted text using OCR (${ocrText.length} characters)`);
        } else if (ocrText) {
          this.logger.warn(`OCR extracted text but it's too short (${ocrText.length} characters, minimum 30)`);
        } else {
          this.logger.warn('OCR returned no text');
        }
      } catch (error) {
        this.logger.error(`OCR failed with error: ${error.message}`, error.stack);
        // Don't throw here, let it fall through to the final check
      }
    }

    // If still no text, check if it's a valid PDF but just image-based
    if (!cvText || cvText.trim().length === 0) {
      // Try to verify it's a valid PDF first
      try {
        await pdf(buffer);
        // PDF is valid but no text extracted - likely image-based PDF
        if (ocrService) {
          throw new BadRequestException(
            'Could not extract text from PDF even with OCR. ' +
            'The PDF may be corrupted, have very poor image quality, or contain only images without readable text.'
          );
        } else {
          throw new BadRequestException(
            'PDF appears to be image-based (scanned document). ' +
            'Please use a PDF with selectable text, or convert the scanned PDF to text using OCR software first.'
          );
        }
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw error;
        }
        throw new BadRequestException('Invalid PDF file. Please ensure the file is not corrupted.');
      }
    }
    
    // Lower threshold for OCR-extracted text (30 vs 50 for regular extraction)
    const minLength = ocrService && cvText.length > 0 ? 30 : 50;
    
    if (cvText.trim().length < minLength) {
      if (ocrService) {
        throw new BadRequestException(
          `Extracted text is too short (${cvText.trim().length} characters, minimum ${minLength}). ` +
          'The PDF may have poor image quality, be corrupted, or contain insufficient readable content. ' +
          'Please try a different PDF file or ensure the PDF has clear, readable text.'
        );
      } else {
        throw new BadRequestException(
          'Extracted text is too short. PDF may be image-based. ' +
          'Please use a PDF with selectable text, or ensure the PDF contains sufficient readable content.'
        );
      }
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
