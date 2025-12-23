import { Injectable, Logger } from "@nestjs/common";
import { AiUsageLogService } from "src/modules/ai-usage-log/ai-usage-log.service";
import { OpenaiApiService } from "./openai-api.service";

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
      cvSuggestions?: string[];
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
      
      // Generate specific CV suggestions based on analysis
      const cvSuggestions = await this.generateCvSuggestions(analysis);
      analysis.cvSuggestions = cvSuggestions;
      
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
      throw error;
    }
  }

  /**
   * Generate specific CV suggestions based on job analysis
   */
  private async generateCvSuggestions(analysis: any): Promise<string[]> {
    try {
      const requiredSkills = analysis.requiredSkills || [];
      const technologies = analysis.technologies || [];
      const keyResponsibilities = analysis.keyResponsibilities || [];
      const softSkills = analysis.softSkills || [];
      const experienceLevel = analysis.experienceLevel || "mid-level";
      const industry = analysis.industry || "technology";
      const education = analysis.education || "";

      // Validate we have enough data
      if (requiredSkills.length === 0 && technologies.length === 0) {
        this.logger.warn("Insufficient data for CV suggestions generation");
        return [];
      }

      // Build concrete examples from actual data
      const skillsList = requiredSkills.slice(0, 10).join(", ");
      const topSkills = requiredSkills.slice(0, 4).join(", ");
      const techList = technologies.slice(0, 8).join(", ");
      const topTechs = technologies.slice(0, 5).join(", ");
      const primaryResp = keyResponsibilities[0] || "";
      const secondaryResp = keyResponsibilities[1] || "";
      const softSkillsText = softSkills.slice(0, 3).join(", ");

      const prompt = `You are a CV expert. Generate 6-7 SPECIFIC, DETAILED CV suggestions based on this job analysis.

JOB ANALYSIS DATA:
- Experience Level: ${experienceLevel}
- Industry: ${industry}
- Required Skills: ${skillsList || "None specified"}
- Technologies: ${techList || "None specified"}
- Key Responsibilities:
${keyResponsibilities.map((r: string, i: number) => `${i + 1}. ${r}`).join("\n")}
- Soft Skills: ${softSkillsText || "None specified"}
- Education: ${education || "Not specified"}

CRITICAL INSTRUCTIONS:
1. You MUST use EXACT skill/technology names from the data above - NO generic terms
2. Each suggestion must be 80-120 words and include 4-6 EXACT skill/technology names
3. Include specific examples with actual technologies and responsibilities from the data
4. NEVER use phrases like "relevant skills", "modern technologies", "various tools"
5. Use the EXACT names provided in the job analysis

Generate suggestions covering:
1. Skills section - list EXACT skills: ${topSkills}
2. Work experience with responsibilities - reference: "${primaryResp.substring(0, 100)}"
3. Technologies in work descriptions - mention: ${topTechs}
4. Professional summary - include: ${topSkills} and ${topTechs}
5. Quantifiable achievements with metrics
${softSkillsText ? `6. Soft skills demonstration - mention: ${softSkillsText}` : "6. Industry-specific experience"}
${education ? `7. Education highlights - mention: ${education}` : "7. Additional relevant experience"}

Return ONLY a JSON array of strings. Each string is one detailed suggestion (80-120 words) with EXACT skill/technology names from the data above.`;

      const openai = this.openaiApiService.getOpenAI();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        temperature: 0.3, // Lower temperature for more consistent, specific output
        messages: [
          {
            role: "system",
            content:
              "You are a professional CV advisor. You MUST use EXACT skill and technology names from the provided job analysis. NEVER use generic terms like 'relevant skills', 'modern technologies', or 'various tools'. Each suggestion must be detailed (80-120 words) and include 4-6 EXACT skill/technology names from the job analysis. Always return valid JSON array only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error("No response from OpenAI for CV suggestions");
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

      const suggestions = JSON.parse(cleanResponse);
      if (Array.isArray(suggestions) && suggestions.length > 0) {
        return suggestions;
      }

      throw new Error("Invalid suggestions format");
    } catch (error) {
      this.logger.error(
        `Error generating CV suggestions: ${error.message}`,
        error.stack
      );
      // Return empty array if suggestions generation fails - no fallback
      return [];
    }
  }
}
