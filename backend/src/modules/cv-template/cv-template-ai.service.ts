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
`;

    const completion = await this.openaiApiService
      .getOpenAI()
      .chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `
            You are a tag recommender AI.
Task:
- Given a list of tags and a job description, return all tags from the list that best match the job’s tone, domain, or focus.
- Always choose at least one tag, even if unsure.
- Use only tags from the provided list (no new ones).
- Output strictly a JSON array of strings, e.g. ["creative","professional"].
        `,
          },

          {
            role: "user",
            content: prompt,
          },
        ],
      });

    const suggestion = completion.choices[0].message.content?.trim();

    let tagsResult: string[];

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
