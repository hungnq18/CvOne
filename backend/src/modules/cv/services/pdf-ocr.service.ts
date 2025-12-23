import { Injectable, Logger } from '@nestjs/common';
import { createCanvas } from 'canvas';
import { OpenaiApiService } from './openai-api.service';

@Injectable()
export class PdfOcrService {
  private readonly logger = new Logger(PdfOcrService.name);

  constructor(private readonly openaiApiService: OpenaiApiService) {}

  /**
   * Convert PDF page to image using pdfjs-dist and canvas
   */
  private async pdfPageToImage(buffer: Buffer, pageNum: number): Promise<Buffer | null> {
    try {
      const pdfjs = await import('pdfjs-dist');
      
      // In Node.js, we don't need worker - set to empty string to disable
      if (typeof window === 'undefined') {
        // @ts-ignore - workerSrc can be empty string in Node.js
        pdfjs.GlobalWorkerOptions.workerSrc = '';
      }

      // Convert Buffer to Uint8Array as required by pdfjs-dist
      const uint8Array = new Uint8Array(buffer);

      const loadingTask = pdfjs.getDocument({ 
        data: uint8Array,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true
      });
      const pdfDocument = await loadingTask.promise;
      
      if (pageNum > pdfDocument.numPages) {
        return null;
      }

      const page = await pdfDocument.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR

      // Create canvas
      const canvas = createCanvas(viewport.width, viewport.height);
      const context = canvas.getContext('2d');

      // Render PDF page to canvas
      await page.render({
        canvasContext: context as any,
        viewport: viewport,
      }).promise;

      // Convert canvas to image buffer
      const imageBuffer = canvas.toBuffer('image/png');
      return imageBuffer;
    } catch (error) {
      this.logger.error(`Error converting PDF page ${pageNum} to image: ${error.message}`);
      return null;
    }
  }

  /**
   * Extract text from image using OpenAI Vision API
   */
  private async ocrImage(imageBuffer: Buffer): Promise<string | null> {
    try {
      const openai = this.openaiApiService.getOpenAI();
      
      // Convert buffer to base64
      const base64Image = imageBuffer.toString('base64');
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all text from this CV/resume image. Return only the extracted text, preserving the structure and formatting as much as possible. Include all sections: personal information, work experience, education, skills, etc. If the image is unclear or contains no readable text, return "NO_TEXT_FOUND".',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 4000,
      });

      const extractedText = response.choices[0]?.message?.content?.trim();
      
      if (!extractedText || extractedText === 'NO_TEXT_FOUND') {
        this.logger.warn('OpenAI Vision API returned no text or NO_TEXT_FOUND');
        return null;
      }

      return extractedText;
    } catch (error) {
      this.logger.error(`Error in OCR API call: ${error.message}`, error.stack);
      // Don't throw, return null so we can try other pages
      return null;
    }
  }

  /**
   * Extract text from PDF using OCR (for scanned/image-based PDFs)
   */
  async extractTextWithOcr(buffer: Buffer, maxPages: number = 5): Promise<string | null> {
    try {
      // First, get number of pages
      const pdfjs = await import('pdfjs-dist');
      
      // In Node.js, we don't need worker - set to empty string to disable
      if (typeof window === 'undefined') {
        // @ts-ignore - workerSrc can be empty string in Node.js
        pdfjs.GlobalWorkerOptions.workerSrc = '';
      }

      // Convert Buffer to Uint8Array as required by pdfjs-dist
      const uint8Array = new Uint8Array(buffer);

      const loadingTask = pdfjs.getDocument({ 
        data: uint8Array,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true
      });
      const pdfDocument = await loadingTask.promise;
      const numPages = Math.min(pdfDocument.numPages, maxPages);

      this.logger.log(`Starting OCR for ${numPages} page(s) of PDF`);

      if (numPages === 0) {
        this.logger.warn('PDF has no pages');
        return null;
      }

      let fullText = '';
      let successfulPages = 0;
      
      // Process pages sequentially to avoid rate limits
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        try {
          this.logger.log(`Processing page ${pageNum}/${numPages} with OCR`);
          
          // Convert page to image
          const imageBuffer = await this.pdfPageToImage(buffer, pageNum);
          if (!imageBuffer) {
            this.logger.warn(`Failed to convert page ${pageNum} to image, skipping`);
            continue;
          }

          this.logger.log(`Page ${pageNum} converted to image (${imageBuffer.length} bytes)`);

          // OCR the image
          const pageText = await this.ocrImage(imageBuffer);
          if (pageText && pageText.trim().length > 0) {
            fullText += pageText + '\n\n';
            successfulPages++;
            this.logger.log(`Page ${pageNum} OCR successful (${pageText.length} characters extracted)`);
          } else {
            this.logger.warn(`No text extracted from page ${pageNum} via OCR`);
          }

          // Small delay to avoid rate limits
          if (pageNum < numPages) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (pageError) {
          this.logger.error(`Error processing page ${pageNum}: ${pageError.message}`);
          // Continue with next page instead of failing completely
          continue;
        }
      }

      const finalText = fullText.trim();
      this.logger.log(`OCR completed: ${successfulPages}/${numPages} pages successful, ${finalText.length} total characters`);

      if (finalText.length === 0) {
        this.logger.warn('No text extracted from any page via OCR');
        return null;
      }

      return finalText;
    } catch (error) {
      this.logger.error(`Error in extractTextWithOcr: ${error.message}`, error.stack);
      throw error; // Re-throw to let caller handle
    }
  }
}

