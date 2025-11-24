import { Injectable, Logger } from "@nestjs/common";
import { OpenaiApiService } from "./openai-api.service";

@Injectable()
export class JobAnalysisService {
  private readonly logger = new Logger(JobAnalysisService.name);

  constructor(private openaiApiService: OpenaiApiService) {}

  /**
   * Analyze job description using OpenAI
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

      this.logger.log("Job description analysis completed successfully");
      return analysis;
    } catch (error) {
      this.logger.error(
        `Error analyzing job description: ${error.message}`,
        error.stack
      );

      // Check if it's a quota exceeded error
      if (error.message.includes("429") || error.message.includes("quota")) {
        this.logger.warn("OpenAI quota exceeded, using fallback analysis");
        return this.fallbackAnalysis(jobDescription);
      }

      // Fallback to basic analysis if OpenAI fails
      return this.fallbackAnalysis(jobDescription);
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
