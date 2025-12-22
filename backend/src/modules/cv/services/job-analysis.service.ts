import { Injectable, Logger } from "@nestjs/common";
import { OpenaiApiService } from "./openai-api.service";
import { AiUsageLogService } from "src/modules/ai-usage-log/ai-usage-log.service";

@Injectable()
export class JobAnalysisService {
  private readonly logger = new Logger(JobAnalysisService.name);

  constructor(
    private openaiApiService: OpenaiApiService,
    private readonly logService: AiUsageLogService
  ) {}

  /**
   * Analyze job description using OpenAI
   */
  async analyzeJobDescription(jobDescription: string): Promise<{
    analyzedJob: {
      requiredSkills: string[];
      experienceLevel: string;
      keyResponsibilities: string[];
      industry: string;
      technologies: string[];
      softSkills: string[];
      education: string;
      certifications: string[];
    };
    total_tokens: number;
  }> {
    try {
      const prompt = `
      Extract key information from this job description and return ONLY a valid JSON object.
      
      Job Description:
      ${jobDescription}
      
      Required JSON structure:
      {
        "requiredSkills": ["skill1", "skill2"],
        "experienceLevel": "junior|mid-level|senior",
        "keyResponsibilities": ["responsibility1", "responsibility2"],
        "industry": "technology|finance|healthcare|etc",
        "technologies": ["tech1", "tech2"],
        "softSkills": ["skill1", "skill2"],
        "education": "Bachelor's|Master's|PhD|etc",
        "certifications": ["cert1", "cert2"]
      }
      
      EXTRACTION RULES - Be thorough:
      
      - requiredSkills: ALL technical skills from required AND preferred sections (include OOP, SOLID, design patterns, debugging, optimization, etc.)
      - experienceLevel: Based on years (1-2=junior, 3-5=mid-level, 6+=senior)
      - keyResponsibilities: Copy FULL original sentences, do not summarize
      - industry: Infer from job context
      - technologies: ALL tools/frameworks/platforms mentioned - languages, ORMs, cloud services, containers, CI/CD
      - softSkills: Extract explicit mentions AND infer from duties (e.g., "work closely"=collaboration, "team"=teamwork)
      - education: Extract if stated, default "Bachelor's" for tech roles
      - certifications: Check entire description INCLUDING benefits section, use [] if none
      
      Return only the JSON object.
      `;

      const openai = this.openaiApiService.getOpenAI();
      const completion = await openai.chat.completions.create({
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

      // Clean markdown if present
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith("```json")) {
        cleanResponse = cleanResponse
          .replace(/^```json/, "")
          .replace(/```$/, "")
          .trim();
      } else if (cleanResponse.startsWith("```")) {
        cleanResponse = cleanResponse
          .replace(/^```/, "")
          .replace(/```$/, "")
          .trim();
      }

      // Parse JSON response
      const analysis = JSON.parse(cleanResponse);
      const usage = completion.usage || {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      };
      this.logger.log("Job description analysis completed successfully");
      return { analyzedJob: analysis, total_tokens: usage.total_tokens };
    } catch (error) {
      this.logger.error(
        `Error analyzing job description: ${error.message}`,
        error.stack
      );

      // Check if it's a quota exceeded error
      if (error.message.includes("429") || error.message.includes("quota")) {
        this.logger.warn("OpenAI quota exceeded, using fallback analysis");
        return {
          analyzedJob: this.fallbackAnalysis(jobDescription),
          total_tokens: 0,
        };
      }

      // Fallback to basic analysis if OpenAI fails
      return {
        analyzedJob: this.fallbackAnalysis(jobDescription),
        total_tokens: 0,
      };
    }
  }

  /**
   * Fallback analysis when OpenAI is not available
   */
  private fallbackAnalysis(jobDescription: string) {
    const lowerDescription = jobDescription.toLowerCase();

    return {
      requiredSkills: ["Problem Solving", "Communication", "Teamwork"],
      experienceLevel: lowerDescription.includes("senior")
        ? "senior"
        : lowerDescription.includes("junior")
          ? "junior"
          : "mid-level",
      keyResponsibilities: ["Development", "Collaboration"],
      industry: "technology",
      technologies: ["JavaScript", "React", "Node.js"],
      softSkills: ["Communication", "Teamwork"],
      education: "Bachelor's",
      certifications: [],
    };
  }
}
