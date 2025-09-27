import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import OpenAI from "openai";
import { User } from "../users/schemas/user.schema";

@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name);
  private openai: OpenAI;
  private readonly cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>
  ) {
    const apiKey = this.configService.get<string>("OPENAI_API_KEY");
    if (!apiKey) {
      this.logger.warn("OPENAI_API_KEY not found in environment variables");
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
      timeout: 30000, // 30 seconds timeout
    });
  }

  /**
   * Get cached result or call OpenAI with retry
   */
  private async getCachedOrCall<T>(
    cacheKey: string,
    apiCall: () => Promise<T>
  ): Promise<T> {
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      this.logger.debug(`Cache hit for ${cacheKey}`);
      return cached.data;
    }

    // Call API with retry
    const result = await this.retryApiCall(apiCall);
    
    // Cache the result
    this.cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  }

  /**
   * Retry API call with exponential backoff
   */
  private async retryApiCall<T>(apiCall: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.logger.debug(`API call attempt ${attempt}`);
        return await apiCall();
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`API call attempt ${attempt} failed: ${error.message}`);
        
        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1);
          this.logger.debug(`Retrying in ${delay}ms`);
          await this.sleep(delay);
        }
      }
    }
    
    this.logger.error(`API call failed after ${this.maxRetries} attempts`);
    throw lastError || new Error(`API call failed after ${this.maxRetries} attempts`);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Hash string for cache key
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Analyze job description using OpenAI with caching
   */
  async analyzeJobDescription(jobDescription: string): Promise<{
    requiredSkills: string[];
    experienceLevel: string;
    keyResponsibilities: string[];
    industry: string;
    technologies: string[];
    softSkills: string[];
    education: string;
    certifications: string[];
  }> {
    const cacheKey = `jd_${this.hashString(jobDescription)}`;
    
    return this.getCachedOrCall(cacheKey, async () => {
      try {
        const prompt = `
Analyze the following job description and extract key information in JSON format:

Job Description:
${jobDescription}

Please provide a detailed analysis in the following JSON structure:
{
  "requiredSkills": ["skill1", "skill2", "skill3"],
  "experienceLevel": "junior|mid-level|senior",
  "keyResponsibilities": ["responsibility1", "responsibility2"],
  "industry": "technology|finance|healthcare|etc",
  "technologies": ["tech1", "tech2", "tech3"],
  "softSkills": ["communication", "leadership", "teamwork"],
  "education": "Bachelor's|Master's|PhD|etc",
  "certifications": ["cert1", "cert2"]
}

Focus on:
- Technical skills and programming languages
- Frameworks and tools mentioned
- Experience level indicators (junior, senior, lead, etc.)
- Industry context
- Required soft skills
- Educational requirements
- Any certifications mentioned

Return only valid JSON without any additional text.
`;

        const completion = await this.openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "You are a professional job description analyzer. Always respond with valid JSON format.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const response = completion.choices[0]?.message?.content;
        if (!response) {
          throw new Error("No response from OpenAI");
        }

        // Clean response
        let cleanResponse = response.trim();
        if (cleanResponse.startsWith("```json")) {
          cleanResponse = cleanResponse
            .replace(/^```json/, "")
            .replace(/```$/, "")
            .trim();
        }

        const analysis = JSON.parse(cleanResponse);
        return analysis;
      } catch (error) {
        this.logger.error(`Error analyzing job description: ${error.message}`);
        
        // Check for quota exceeded
        if (error.message.includes("quota") || error.message.includes("rate limit")) {
          this.logger.warn("OpenAI quota exceeded, using fallback analysis");
          return this.fallbackAnalysis(jobDescription);
        }

        // Fallback to basic analysis if OpenAI fails
        return this.fallbackAnalysis(jobDescription);
      }
    });
  }

  /**
   * Fallback analysis when OpenAI fails
   */
  private fallbackAnalysis(jobDescription: string): {
    requiredSkills: string[];
    experienceLevel: string;
    keyResponsibilities: string[];
    industry: string;
    technologies: string[];
    softSkills: string[];
    education: string;
    certifications: string[];
  } {
    const lowerDesc = jobDescription.toLowerCase();
    
    // Basic keyword extraction
    const skills = this.extractSkills(lowerDesc);
    const experienceLevel = this.determineExperienceLevel(lowerDesc);
    const industry = this.determineIndustry(lowerDesc);
    
    return {
      requiredSkills: skills,
      experienceLevel,
      keyResponsibilities: ["Responsible for development tasks", "Collaborate with team members"],
      industry,
      technologies: this.extractTechnologies(lowerDesc),
      softSkills: ["Communication", "Teamwork", "Problem Solving"],
      education: "Bachelor's degree or equivalent",
      certifications: []
    };
  }

  private extractSkills(text: string): string[] {
    const skillKeywords = [
      'javascript', 'python', 'java', 'react', 'angular', 'vue', 'node.js',
      'sql', 'mongodb', 'postgresql', 'aws', 'docker', 'kubernetes',
      'git', 'agile', 'scrum', 'testing', 'ci/cd'
    ];
    
    return skillKeywords.filter(skill => text.includes(skill));
  }

  private determineExperienceLevel(text: string): string {
    if (text.includes('senior') || text.includes('lead') || text.includes('5+ years')) {
      return 'senior';
    }
    if (text.includes('junior') || text.includes('entry') || text.includes('0-2 years')) {
      return 'junior';
    }
    return 'mid-level';
  }

  private determineIndustry(text: string): string {
    if (text.includes('fintech') || text.includes('banking') || text.includes('finance')) {
      return 'finance';
    }
    if (text.includes('healthcare') || text.includes('medical')) {
      return 'healthcare';
    }
    if (text.includes('ecommerce') || text.includes('retail')) {
      return 'retail';
    }
    return 'technology';
  }

  private extractTechnologies(text: string): string[] {
    const techKeywords = [
      'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask',
      'mongodb', 'postgresql', 'mysql', 'redis', 'aws', 'azure', 'gcp',
      'docker', 'kubernetes', 'jenkins', 'gitlab'
    ];
    
    return techKeywords.filter(tech => text.includes(tech));
  }

  /**
   * Check OpenAI API status
   */
  async checkApiStatus(): Promise<{ status: string; message: string }> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Hello" }],
        max_tokens: 5,
      });

      return {
        status: "healthy",
        message: "OpenAI API is working correctly",
      };
    } catch (error) {
      this.logger.error(`OpenAI API check failed: ${error.message}`);
      return {
        status: "error",
        message: `OpenAI API error: ${error.message}`,
      };
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.logger.debug('OpenAI service cache cleared');
  }
}
