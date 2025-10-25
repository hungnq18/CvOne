import { Injectable, NotFoundException } from "@nestjs/common";
import OpenAI from "openai";
import { OpenaiApiService } from "../cv/services/openai-api.service";

/**
 * Service for handling CV template business logic
 * Handles database operations for CV templates
 */
@Injectable()
export class CvTemplateAiService {
  constructor(private openaiApiService: OpenaiApiService) {}

  async suggestTagsByAi(
    jobDescription: string,
    tags: any
  ): Promise<{
    tags: string[];
    tokens: { prompt: number; completion: number; total: number };
  }> {
    const prompt = `
Tags: ${tags.join(", ")}

Job description:
${jobDescription}

Task:
- Analyze the job description.
- Suggest ALL relevant tags that best describe the job's domain, skills, and focus.
- If unsure, return the single closest tag.
Output only a JSON array, e.g. ["tagA","tagB"].
`;

    const completion = await this.openaiApiService
      .getOpenAI()
      .chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `
            You are an AI tag recommender.
            Read a job description and select the most relevant tags from a given list.
            Strict rules:
            - Output ONLY a pure JSON array (e.g. ["tagA","tagB"])
            - DO NOT include code blocks, markdown, or explanations.
       
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
