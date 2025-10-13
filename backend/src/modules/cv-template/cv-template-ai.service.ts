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

  async suggestTagsByAi(
    infoUser: any,
    jobDescription: string,
    tags: any
  ): Promise<string[]> {
    const prompt = `
You are given a list of valid tags:
${tags.join(", ")}

Below are two data sources:

- User profile (in JSON format):
${JSON.stringify(infoUser, null, 2)}

- Job description for the position the user is targeting:
${jobDescription}

Task:
- Analyze BOTH the user's profile and the job description carefully.
- Select ALL relevant tags from the provided list that match:
  • the user's background, skills, and experience, AND
  • the requirements, keywords, or themes present in the job description.
- Focus on identifying tags that describe:
  • the user's professional field,
  • key technical or soft skills,
  • relevant experience levels,
  • and job-related goals or interests.
- You must always return at least one tag from the list.
- If the information is limited or unclear, return the single closest matching tag.
- Output must be a valid JSON array of strings (e.g., ["tag1", "tag2", "tag3"]).
- Do NOT create new tags that are not in the provided list.
- Do NOT include explanations, reasoning, or text outside the JSON array.

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
        You are an intelligent tag recommender that analyzes both a user's profile and a job description to suggest the most relevant tags from a predefined list.
        
        Rules:
        - Carefully analyze BOTH the user's profile (JSON data) and the job description text.
        - Consider factors such as:
          • the user's career, education, and experience,
          • their skills and interests,
          • and the requirements, responsibilities, or keywords from the job description.
        - Select ALL tags from the provided list that accurately reflect both the user's background and the job they are targeting.
        - If multiple tags apply, return ALL of them (not just one).
        - You must always return at least one tag from the list.
        - If the information is limited or unclear, return the single closest matching tag.
        - The output must be a valid JSON array of strings (e.g., ["tag1", "tag2", "tag3"]).
        - Never invent new tags that are not in the list.
        - Never include explanations, reasoning, or any text outside the JSON array.
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
