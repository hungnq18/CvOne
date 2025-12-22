import { Injectable, NotFoundException } from "@nestjs/common";
import OpenAI from "openai";
import { OpenaiApiService } from "../cv/services/openai-api.service";
import { AiUsageLogService } from "../ai-usage-log/ai-usage-log.service";

/**
 * Service for handling CV template business logic
 * Handles database operations for CV templates
 */
@Injectable()
export class CvTemplateAiService {
  constructor(
    private openaiApiService: OpenaiApiService,
    private readonly logService: AiUsageLogService
  ) {}

  async suggestTemplateByAi(
    jobDescription: string,
    templates: any,
    userUseTemplate: any
  ): Promise<{
    title: string | null;
    total_tokens: number;
  }> {
    const prompt = `
Cover letter templates:
${JSON.stringify(templates, null, 2)}

User is currently using this template (DO NOT select it):
${JSON.stringify(userUseTemplate)}

Job description:
${jobDescription}
`;

    const systemPrompt = `
  You are an AI that selects the BEST cover letter template.
  
  Input:
  - A list of templates (each has title and tags)
  - A job description
  - One template that the user is currently using
  
  Rules:
  - Analyze the job description’s tone, professionalism, and creativity.
  - Evaluate templates using BOTH title and tags.
  - DO NOT select the template that matches the user's current template.
  - Select EXACTLY ONE best-matching template.
  
  Output (STRICT):
  - Return ONLY valid JSON
  - Format: { "title": "<template title>" }
  - No explanations, no extra text, no arrays
  `;

    const completion = await this.openaiApiService
      .getOpenAI()
      .chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0, // 🔥 QUAN TRỌNG: giảm randomness
      });

    const raw = completion.choices[0].message.content?.trim() || "";

    let title: string | null = null;

    try {
      const cleaned = raw
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(cleaned);

      if (parsed && typeof parsed.title === "string") {
        title = parsed.title;
      }
    } catch (error) {
      console.error("❌ AI template parse failed:", raw);
      title = null;
    }

    const usage = completion.usage ?? {
      total_tokens: 0,
    };

    return {
      title,
      total_tokens: usage.total_tokens,
    };
  }
}
