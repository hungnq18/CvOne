import { Injectable, Logger } from "@nestjs/common";
import { OpenaiApiService } from "./openai-api.service";
import { AiUsageLogService } from "src/modules/ai-usage-log/ai-usage-log.service";

@Injectable()
export class CvAnalysisService {
  private readonly logger = new Logger(CvAnalysisService.name);

  constructor(
    private openaiApiService: OpenaiApiService,
    private readonly logService: AiUsageLogService
  ) {}

  /**
   * Analyze CV content using OpenAI
   */
  async analyzeCvContent(cvText: string): Promise<{
    userData: {
      firstName: string;
      lastName: string;
      professional: string;
      city: string;
      country: string;
      province: string;
      phone: string;
      email: string;
      avatar: string;
      summary: string;
      skills: Array<{ name: string; rating: number }>;
      workHistory: Array<{
        title: string;
        company: string;
        startDate: string;
        endDate: string;
        description: string;
      }>;
      education: Array<{
        startDate: string;
        endDate: string;
        major: string;
        degree: string;
        institution: string;
      }>;
    };
    mapping?: Record<
      string,
      { page: number; x: number; y: number; width: number; height: number }
    >;
  }> {
    try {
      const prompt = `
Analyze the following CV content and extract structured information in JSON format:

CV Content:
${cvText}

Please provide a detailed analysis in the following JSON structure:
{
  "userData": {
    "firstName": "First Name",
    "lastName": "Last Name", 
    "professional": "Professional Title",
    "city": "City",
    "country": "Country",
    "province": "Province/State",
    "phone": "Phone Number",
    "email": "email@example.com",
    "avatar": "",
    "summary": "Professional summary extracted from CV",
    "skills": [
      {
        "name": "Skill Name",
        "rating": 4
      }
    ],
    "workHistory": [
      {
        "title": "Job Title",
        "company": "Company Name",
        "startDate": "YYYY-MM-DD",
        "endDate": "YYYY-MM-DD or Present",
        "description": "Job description"
      }
    ],
    "education": [
      {
        "startDate": "YYYY-MM-DD",
        "endDate": "YYYY-MM-DD",
        "major": "Major/Field of Study",
        "degree": "Degree Name",
        "institution": "Institution Name"
      }
    ]
  },
  "mapping": {
    // mapping các trường chính (nếu xác định được):
    // ví dụ: "name": { "page": 0, "x": 100, "y": 200, "width": 150, "height": 20 }
  }
}

Focus on:
- Extract personal information accurately (name, contact, location)
- Identify professional title/role
- Identify all skills mentioned with appropriate ratings (1-5)
- Parse work experience with dates and descriptions
- Extract education details with proper structure
- Ensure all dates are in YYYY-MM-DD format
- Set empty string for avatar if not found
- Nếu có thể, hãy dự đoán vị trí (page, x, y, width, height) của các trường chính trong CV (mapping), nếu không xác định được thì để trống object mapping.

Return only valid JSON without any additional text.
`;

      const openai = this.openaiApiService.getOpenAI();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a professional CV analyzer. Always respond with valid JSON format matching the CV schema structure.",
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
      console.log("Usage:", usage);

      this.logger.log("CV content analysis completed successfully");
      return analysis;
    } catch (error) {
      this.logger.error(
        `Error analyzing CV content: ${error.message}`,
        error.stack
      );

      // Check if it's a quota exceeded error
      if (error.message.includes("429") || error.message.includes("quota")) {
        this.logger.warn("OpenAI quota exceeded, using fallback CV analysis");
        return this.fallbackCvAnalysis(cvText);
      }

      // Fallback to basic analysis if OpenAI fails
      return this.fallbackCvAnalysis(cvText);
    }
  }

  /**
   * Rewrite a work experience description to be more professional and impressive
   */
  async rewriteWorkDescription(
    description: string,
    language?: string,
    userId?: string
  ): Promise<string> {
    try {
      let languageNote = "";
      if (language === "vi") {
        languageNote =
          "\nLưu ý: Viết lại mô tả này bằng tiếng Việt chuyên nghiệp, tự nhiên, súc tích.";
      } else if (language === "en") {
        languageNote =
          "\nNote: Rewrite this description in professional, natural, concise English.";
      }
      const prompt = `
Rewrite the following work experience description to be more professional, impressive, and concise. Use action verbs, highlight achievements, and make it suitable for a CV.${languageNote}

Original description:
"""
${description}
"""

Return only the rewritten description, no explanation, no markdown.
`;
      const openai = this.openaiApiService.getOpenAI();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a professional CV writer. Rewrite work experience descriptions to be impressive and concise.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });
      let response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error("No response from OpenAI");
      }
      const usage = completion.usage || {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      };
      console.log("Usage summary:", usage);
      if (userId) {
        await this.logService.createLog({
          userId: userId,
          feature: "rewriteWorkDescription",
          tokensUsed: usage.total_tokens,
        });
      }
      // Remove markdown if present
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith("```")) {
        cleanResponse = cleanResponse
          .replace(/^```[a-z]*\n?/i, "")
          .replace(/```$/, "")
          .trim();
      }
      return cleanResponse;
    } catch (error) {
      this.logger.error(
        `Error rewriting work description: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Fallback CV analysis when OpenAI is not available
   */
  private fallbackCvAnalysis(cvText: string) {
    const lines = cvText.split("\n").filter((line) => line.trim());

    return {
      userData: {
        firstName: "First",
        lastName: "Name",
        professional: "Software Developer",
        city: "City",
        country: "Country",
        province: "Province",
        phone: "Phone Number",
        email: "email@example.com",
        avatar: "",
        summary: "Professional summary extracted from CV content",
        skills: [
          { name: "Problem Solving", rating: 4 },
          { name: "Communication", rating: 4 },
          { name: "Teamwork", rating: 4 },
        ],
        workHistory: [
          {
            title: "Software Developer",
            company: "Company Name",
            startDate: "2020-01-01",
            endDate: "Present",
            description: "Developed and maintained applications",
          },
        ],
        education: [
          {
            startDate: "2016-09-01",
            endDate: "2020-06-30",
            major: "Computer Science",
            degree: "Bachelor's Degree",
            institution: "University Name",
          },
        ],
      },
    };
  }
}
