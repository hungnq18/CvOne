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

  async suggestTagsByAi(infoUser: any, tags: any): Promise<string[]> {
    const prompt = `
    You are given a list of valid tags:
    ${tags.join(", ")}
    
    Below is the user's profile information (in JSON format):
    ${JSON.stringify(infoUser, null, 2)}
    
    Task:
    - Analyze the user's profile and select ALL relevant tags from the provided list.
    - Consider factors such as career, skills, experience level, and interests.
    - If multiple tags apply, return ALL that are relevant.
    - You must always return at least one tag from the list.
    - If the user's information is limited or unclear, return the single closest matching tag.
    - Only return a valid JSON array of strings containing tag names from the list.
    - Never invent new tags that are not in the list.
    - Never include explanations, reasoning, or text outside the JSON array.
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
          You are an intelligent tag recommender that analyzes a user's profile (JSON data) and suggests the most relevant tags from a predefined list.

          Rules:
          - Carefully analyze the user's profile, including details such as career, skills, experience, goals, and interests.
          - Select ALL tags from the provided list that accurately describe or relate to the user.
          - If multiple tags apply, return ALL of them (not just one).
          - You must always return at least one tag from the list.
          - If the user's profile is incomplete or unclear, return the single closest matching tag.
          - The output must be a valid JSON array of strings (e.g., ["tag1", "tag2"]).
          - Never invent new tags that are not in the list.
          - Never include explanations, reasoning, formatting, or any text outside the JSON array.
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
