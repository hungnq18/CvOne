import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PerformanceOptimization {
  private readonly logger = new Logger(PerformanceOptimization.name);

  /**
   * Optimize file processing for large PDFs
   */
  static optimizeFileProcessing(file: any): {
    buffer: Buffer;
    size: number;
    isValid: boolean;
  } {
    const buffer = file.buffer;
    const size = buffer.length;
    const isValid = size > 0 && size <= 10 * 1024 * 1024; // 10MB limit

    return { buffer, size, isValid };
  }

  /**
   * Optimize text extraction with chunking for large PDFs
   */
  static chunkText(text: string, maxChunkSize: number = 4000): string[] {
    if (text.length <= maxChunkSize) {
      return [text];
    }

    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      let end = start + maxChunkSize;
      
      // Try to break at sentence boundary
      if (end < text.length) {
        const lastPeriod = text.lastIndexOf('.', end);
        const lastNewline = text.lastIndexOf('\n', end);
        const breakPoint = Math.max(lastPeriod, lastNewline);
        
        if (breakPoint > start) {
          end = breakPoint + 1;
        }
      }

      chunks.push(text.slice(start, end));
      start = end;
    }

    return chunks;
  }

  /**
   * Memory usage monitoring
   */
  static getMemoryUsage(): {
    used: number;
    total: number;
    percentage: number;
  } {
    const usage = process.memoryUsage();
    const used = usage.heapUsed / 1024 / 1024; // MB
    const total = usage.heapTotal / 1024 / 1024; // MB
    const percentage = (used / total) * 100;

    return { used, total, percentage };
  }

  /**
   * Check if memory usage is high
   */
  static isMemoryUsageHigh(threshold: number = 80): boolean {
    const { percentage } = this.getMemoryUsage();
    return percentage > threshold;
  }

  /**
   * Optimize database queries
   */
  static getOptimizedQueryOptions(limit: number = 20, skip: number = 0) {
    return {
      limit,
      skip,
      sort: { updatedAt: -1 },
      select: '-content' // Exclude large content field for list views
    };
  }

  /**
   * Rate limiting for AI calls
   */
  static createRateLimiter(maxCalls: number = 10, windowMs: number = 60000) {
    const calls = new Map<string, number[]>();
    
    return (key: string): boolean => {
      const now = Date.now();
      const userCalls = calls.get(key) || [];
      
      // Remove old calls outside the window
      const validCalls = userCalls.filter(time => now - time < windowMs);
      
      if (validCalls.length >= maxCalls) {
        return false; // Rate limit exceeded
      }
      
      validCalls.push(now);
      calls.set(key, validCalls);
      return true;
    };
  }
}
