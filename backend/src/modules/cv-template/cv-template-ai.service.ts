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
    You are a professional AI system for intelligent tag selection.

    Provided data:
    - List of valid tags: ${tags.join("", "")}
    - User profile (JSON):
    ${JSON.stringify(infoUser, null, 2)}
    - Job description:
    ${jobDescription}
    Your task:
    1. Analyze the user's profile and the job description together.
    2. Identify all tags from the list that:
       - Reflect the user's profession, core skills, or experience.
       - Match important skills, requirements, or key terms found in the job description.
       - Represent relevant career focus, domain expertise, or technical area.
    3. Prefer tags that appear meaningful for BOTH the user’s background and the target job.
    4. Always return **at least one** tag from the provided list.
    5. If information is ambiguous, select the **single most likely tag**.
    6. Output format:
       - A **pure JSON array** of strings (example: [""tagA"", ""tagB"", ""tagC""])
       - No explanation, reasoning, or text outside the array.
       - Do NOT create new tags outside the provided list.
    
    Examples of valid outputs:
    ["tag1"]
    ["tag1", "tag3"]
    ["tag2", "tag4", "tag6"]
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
