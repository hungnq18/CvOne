import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CvTemplate } from "./schemas/cv-template.schema";
import OpenAI from "openai";
import { ConfigService } from "@nestjs/config";

/**
 * Service for handling CV template business logic
 * Handles database operations for CV templates
 */
@Injectable()
export class CvTemplateAiService {
  private openAi: OpenAI;
  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>("OPENAI_API_KEY");
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not found in environment variables");
    }
    this.openAi = new OpenAI({
      baseURL: "https://models.github.ai/inference",
      apiKey: apiKey,
    });
  }

  async suggestCategoryByAi(
    message: string,
    categories: any
  ): Promise<string | null> {
    const prompt = `
  You are given a list of valid categories:
  ${categories.join(", ")}

  The user message is: "${message}".

  Task:
  - Select exactly ONE category from the list that best matches the user's message.
  - Only return the category name as plain text.
  - Do not return anything else (no explanation, no extra words).
  `;
    const completion = await this.openAi.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `
        You are an intelligent classifier that maps a user's message to one of the predefined CV categories.
        Rules:
        - You must strictly choose exactly ONE category from the provided list.
        - Return only the category name as plain text (no explanations, no JSON, no extra words).
        - If the message is unclear, choose the category that is the closest match.
        - Never create a new category that is not in the list.
        `,
        },

        {
          role: "user",
          content: prompt,
        },
      ],
    });
    const suggestion = completion.choices[0].message.content;
    return suggestion;
  }
  async suggestTagsByAi(message: string, tags: any): Promise<string[]> {
    const prompt = `
You are given a list of valid tags:
${tags.join(", ")}

The user message is: "${message}".

Task:
- Select ALL relevant tags from the list that match the user's message.
- If the message relates to multiple tags, return ALL of them (not just one).
- You must always return at least one tag from the list.
- If the message is unclear, return the single closest matching tag.
- Only return a valid JSON array of strings with tag names from the list.
- Never return an empty array.
- Never invent new tags that are not in the list.
- Never include explanations or any text outside the JSON array.

Examples of valid output:
["tag1"]
["tag1", "tag2"]
["tag2", "tag5", "tag7"]
`;

    const completion = await this.openAi.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `
You are an intelligent tag recommender that suggests relevant tags based on the user's message.

Rules:
- Always select ALL relevant tags from the predefined list.
- If multiple tags apply to the user's message, you MUST return all of them (not just one).
- You must always return at least one tag from the list.
- If the message is unclear, return the single closest matching tag.
- The output must be a valid JSON array of strings (e.g., ["tag1", "tag2"]).
- Never invent new tags that are not in the list.
- Never include explanations, formatting, or any text outside the JSON array.
`,
        },

        {
          role: "user",
          content: prompt,
        },
      ],
    });
    const suggestion = completion.choices[0].message.content?.trim();
    try {
      return JSON.parse(suggestion || "[]"); // <-- parse về array
    } catch {
      return suggestion ? [suggestion] : [];
    }
  }
}
