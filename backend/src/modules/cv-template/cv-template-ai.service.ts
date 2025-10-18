import { Injectable, NotFoundException } from "@nestjs/common";
import OpenAI from "openai";
import { OpenaiApiService } from "../cv/services/openai-api.service";

/**
 * Service for handling CV template business logic
 * Handles database operations for CV templates
 */
@Injectable()
export class CvTemplateAiService {
  private openAi: OpenAI;
  constructor(private openaiApiService: OpenaiApiService) {}

  async suggestTagsByAi(
    infoUser: any,
    jobDescription: string,
    tags: any
  ): Promise<{
    tags: string[];
    tokens: { prompt: number; completion: number; total: number };
  }> {
    const prompt = `
Tags: ${tags.join(", ")}

User profile:
${JSON.stringify(infoUser, null, 2)}

Job description:
${jobDescription}
`;

    const completion = await this.openaiApiService
      .getOpenAI()
      .chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `
        You are an AI tag recommender.Analyze a user's profile (JSON) and a job description to suggest tags from a given list.
        Rules:
- Compare user's info and the job description.
- Choose ALL tags that match both the user's skills/field and job requirements.
- Always return at least one tag.
- If unsure, pick the single most relevant tag.
Strict rules:
- Output ONLY a raw JSON array (example: ["tagA","tagB"])
- DO NOT include code blocks, explanations, markdown, or any other text.
        `,
          },

          {
            role: "user",
            content: prompt,
          },
        ],
      });

    const suggestion = completion.choices[0].message.content?.trim();

    let tagsResult: string[] = [];

    try {
      let cleaned = suggestion?.trim() || "";

      cleaned = cleaned
        .replace(/```(json)?/gi, "")
        .replace(/```/g, "")
        .trim();

      cleaned = cleaned.replace(/\n/g, "").trim();

      if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
        tagsResult = JSON.parse(cleaned);
      } else if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
        tagsResult = [JSON.parse(cleaned)];
      } else {
        tagsResult = cleaned ? [cleaned] : [];
      }
    } catch (err) {
      tagsResult = [];
    }

    const usage = completion.usage || {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    };

    return {
      tags: tagsResult,
      tokens: {
        prompt: usage.prompt_tokens,
        completion: usage.completion_tokens,
        total: usage.total_tokens,
      },
    };
  }
}
