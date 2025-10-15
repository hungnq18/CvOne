import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";

@Injectable()
export class CvContentGenerationService {
  private readonly logger = new Logger(CvContentGenerationService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>("OPENAI_API_KEY");
    if (!apiKey) {
      this.logger.warn("OPENAI_API_KEY not found in environment variables");
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  /**
   * Generate multiple professional summaries using OpenAI
   */
  async generateProfessionalSummary(
    userProfile: any,
    jobAnalysis: any,
    additionalRequirements?: string,
  ): Promise<string[]> {
    try {
      const prompt = `
Generate 3 different compelling professional summaries for a CV based on the following information:

User Profile:
- Name: ${userProfile.first_name} ${userProfile.last_name}
- City: ${userProfile.city || "Not specified"}
- Country: ${userProfile.country || "Not specified"}

Job Analysis:
- Required Skills: ${(jobAnalysis?.requiredSkills || []).join(", ") || "Not specified"}
- Experience Level: ${jobAnalysis?.experienceLevel || "Not specified"}
- Industry: ${jobAnalysis?.industry || "Not specified"}
- Technologies: ${(jobAnalysis?.technologies || []).join(", ") || "Not specified"}

Additional Requirements: ${additionalRequirements || "None"}

Create 3 professional summaries that:
1. Highlight relevant skills and experience
2. Match the job requirements
3. Show enthusiasm and potential
4. Are 2-3 sentences long
5. Use professional language
6. Focus on value proposition

Return only a JSON array of 3 summaries, e.g.:
[
  "Summary 1...",
  "Summary 2...",
  "Summary 3..."
]
Do not include any explanation or markdown, only valid JSON.
`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a professional CV writer. Create compelling and relevant professional summaries. Always return a JSON array of 3 summaries.",
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
      // Remove markdown if present
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
      const summaries = JSON.parse(cleanResponse);
      if (Array.isArray(summaries) && summaries.length === 3) {
        return summaries;
      }
      // fallback: wrap single summary in array
      return [cleanResponse];
    } catch (error) {
      this.logger.error(
        `Error generating professional summary: ${error.message}`,
        error.stack,
      );
      // fallback: return 3 copies of fallback summary
      const fallback = this.generateFallbackSummary(
        userProfile,
        jobAnalysis || {},
      );
      return [fallback, fallback, fallback];
    }
  }

  /**
   * Generate work experience descriptions using OpenAI
   */
  async generateWorkExperience(
    jobAnalysis: any,
    experienceLevel: string,
  ): Promise<
    Array<{
      title: string;
      company: string;
      startDate: string;
      endDate: string;
      description: string;
    }>
  > {
    try {
      const years =
        experienceLevel === "senior"
          ? 5
          : experienceLevel === "mid-level"
            ? 3
            : 1;
      const startDate = new Date(
        Date.now() - years * 365 * 24 * 60 * 60 * 1000,
      );
      const endDate = new Date();

      const prompt = `
Generate a realistic work experience entry for a CV based on the following job analysis:

Job Analysis:
- Required Skills: ${jobAnalysis.requiredSkills?.join(", ") || "Not specified"}
- Experience Level: ${experienceLevel}
- Technologies: ${jobAnalysis.technologies?.join(", ") || "Not specified"}
- Industry: ${jobAnalysis.industry || "technology"}

Experience Duration: ${years} year(s)

Create a work experience entry in JSON format:
{
  "title": "Job Title",
  "company": "Company Name",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "description": "Detailed description of responsibilities and achievements"
}

Requirements:
- Job title should match the experience level
- Company name should be realistic
- Description should highlight relevant skills and technologies
- Include specific achievements and responsibilities
- Use action verbs and quantifiable results when possible
- Keep description to 2-3 sentences

Return only valid JSON.
`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a professional CV writer. Create realistic and compelling work experience entries.",
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

      const workExperience = JSON.parse(response);

      // Ensure dates are in correct format
      workExperience.startDate = startDate.toISOString().split("T")[0];
      workExperience.endDate = endDate.toISOString().split("T")[0];

      return [workExperience];
    } catch (error) {
      this.logger.error(
        `Error generating work experience: ${error.message}`,
        error.stack,
      );

      // Check if it's a quota exceeded error
      if (error.message.includes("429") || error.message.includes("quota")) {
        this.logger.warn(
          "OpenAI quota exceeded, using fallback work experience",
        );
      }

      return this.generateFallbackWorkExperience(
        jobAnalysis || {},
        experienceLevel,
      );
    }
  }

  /**
   * Generate multiple skills section options with ratings using OpenAI
   */
  async generateSkillsSection(
    jobAnalysis: any,
    userSkills?: Array<{ name: string; rating: number }>,
  ): Promise<Array<Array<{ name: string; rating: number }>>> {
    try {
      const existingSkills =
        userSkills?.map((s) => s.name).join(", ") || "None";

      const prompt = `
Generate 3 different skills section options for a CV based on the job analysis and existing user skills.

Job Analysis:
- Required Skills: ${jobAnalysis.requiredSkills?.join(", ") || "Not specified"}
- Technologies: ${jobAnalysis.technologies?.join(", ") || "Not specified"}
- Experience Level: ${jobAnalysis.experienceLevel || "Not specified"}

Existing User Skills: ${existingSkills}

Each option should be a skills list in JSON format with ratings (1-5):
[
  {
    "name": "Skill Name",
    "rating": 4
  }
]

Requirements:
- Each option should include both required skills and technologies from job analysis
- Add relevant soft skills (communication, teamwork, leadership, etc.)
- Rate skills appropriately for the experience level
- Include 8-12 skills per option
- Use proper capitalization for skill names
- Ratings: 1=Beginner, 2=Elementary, 3=Intermediate, 4=Advanced, 5=Expert

Return only a JSON array of 3 skills lists, e.g.:
[
  [ { "name": "Skill 1", "rating": 4 }, ... ],
  [ { "name": "Skill 1", "rating": 4 }, ... ],
  [ { "name": "Skill 1", "rating": 4 }, ... ]
]
Do not include any explanation or markdown, only valid JSON.
`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a professional CV writer. Create relevant skills sections with appropriate ratings. Always return a JSON array of 3 skills lists.",
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
      // Remove markdown if present
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
      const skillsLists = JSON.parse(cleanResponse);
      // Filter to only include skills from job description
      const validSkills = [
        ...(jobAnalysis.requiredSkills || []),
        ...(jobAnalysis.technologies || []),
        ...(jobAnalysis.softSkills || []),
      ].map((s) => s.toLowerCase());
      function filterSkills(list) {
        // Filter and reassign rating if found in userSkills
        return list
          .filter((skillObj) =>
            validSkills.includes(skillObj.name.toLowerCase()),
          )
          .map((skillObj) => {
            if (userSkills) {
              const found = userSkills.find(
                (s) => s.name.toLowerCase() === skillObj.name.toLowerCase(),
              );
              if (found) {
                return { ...skillObj, rating: found.rating };
              }
            }
            return skillObj;
          });
      }
      if (Array.isArray(skillsLists) && skillsLists.length === 3) {
        return skillsLists.map(filterSkills);
      }
      // fallback: wrap single list in array
      return [filterSkills(skillsLists)];
    } catch (error) {
      this.logger.error(
        `Error generating skills section: ${error.message}`,
        error.stack,
      );
      // fallback: return 3 copies of fallback skills
      const fallback = this.generateFallbackSkills(jobAnalysis || {});
      return [fallback, fallback, fallback];
    }
  }

  // Fallback methods for when OpenAI is not available
  private generateFallbackSummary(userProfile: any, jobAnalysis: any): string {
    const experienceLevel = jobAnalysis?.experienceLevel || "professional";
    const skills =
      jobAnalysis?.requiredSkills?.slice(0, 3).join(", ") ||
      "software development";

    return `Experienced ${experienceLevel} professional with expertise in ${skills}.
    Passionate about delivering high-quality solutions and collaborating with cross-functional teams.
    Strong problem-solving skills and commitment to continuous learning and professional development.`;
  }

  private generateFallbackWorkExperience(
    jobAnalysis: any,
    experienceLevel: string,
  ): Array<any> {
    const years =
      experienceLevel === "senior"
        ? 5
        : experienceLevel === "mid-level"
          ? 3
          : 1;
    const startDate = new Date(Date.now() - years * 365 * 24 * 60 * 60 * 1000);
    const endDate = new Date();

    return [
      {
        title: `${experienceLevel.charAt(0).toUpperCase() + experienceLevel.slice(1)} Developer`,
        company: "Previous Company",
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        description: `Developed and maintained applications using ${jobAnalysis.technologies?.slice(0, 3).join(", ") || "modern technologies"}.
      Collaborated with cross-functional teams to deliver high-quality software solutions.`,
      },
    ];
  }

  private generateFallbackSkills(
    jobAnalysis: any,
  ): Array<{ name: string; rating: number }> {
    const allSkills = [
      ...(jobAnalysis?.requiredSkills || []),
      ...(jobAnalysis?.technologies || []),
    ];
    const uniqueSkills = [...new Set(allSkills)];

    return uniqueSkills.slice(0, 8).map((skill) => ({
      name: skill.charAt(0).toUpperCase() + skill.slice(1),
      rating: Math.floor(Math.random() * 3) + 3,
    }));
  }
  /**
   * Generate CV content based on user profile and job analysis
   */
  async generateCvContent(
    user: any,
    jobAnalysis: any,
    additionalRequirements?: string,
  ): Promise<any> {
    // Generate professional summary using OpenAI
    const summary = await this.generateProfessionalSummary(
      user,
      jobAnalysis,
      additionalRequirements,
    );

    // Generate skills section using OpenAI
    const skills = await this.generateSkillsSection(jobAnalysis);

    // Generate work experience using OpenAI
    const workHistory = await this.generateWorkExperience(
      jobAnalysis,
      jobAnalysis.experienceLevel,
    );

    // Generate education
    const education = this.generateEducation(user);

    return {
      userData: {
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        professional: this.generateProfessionalTitle(jobAnalysis),
        city: user.city || "",
        country: user.country || "",
        province: user.city || "",
        phone: user.phone?.toString() || "",
        email: "", // Will be filled from account
        avatar: "",
        summary: summary[0] || summary, // Take first summary if array
        skills: skills[0] || skills, // Take first skills list if array
        workHistory: workHistory[0] || workHistory, // Take first work experience if array
        education: [education],
      },
    };
  }

  private generateEducation(user: any): any {
    return {
      startDate: "2016-09-01",
      endDate: "2020-06-30",
      major: "Computer Science",
      degree: "Bachelor",
      institution: "University",
    };
  }

  private generateProfessionalTitle(jobAnalysis: any): string {
    const titles = {
      senior: "Senior Software Developer",
      "mid-level": "Software Developer",
      junior: "Junior Software Developer",
    };
    return titles[jobAnalysis.experienceLevel] || "Software Developer";
  }

  /**
   * Translate CV JSON content to a target language while preserving structure
   * but also translate field (key) names intelligently using AI mapping.
   */
  async translateCvContent(content: any, targetLanguage: string): Promise<any> {
    try {
      // Input validation
      if (!content || typeof content !== "object") {
        throw new Error("Invalid content: must be a valid object");
      }

      if (!targetLanguage || typeof targetLanguage !== "string") {
        throw new Error("Invalid target language: must be a non-empty string");
      }

      // Check if content is too large for single request
      const contentSize = JSON.stringify(content).length;
      if (contentSize > 50000) {
        // ~50KB limit
        this.logger.warn(
          "Large content detected, may need chunking for better results",
        );
      }

      // Step 1: Generate key name mapping (AI translation for field names)
      // Collect all keys that need translation (both container and leaf keys)
      const getAllKeys = (obj: any): string[] => {
        const keys: string[] = [];
        if (obj && typeof obj === "object") {
          if (Array.isArray(obj)) {
            // For arrays, get keys from the first element
            if (obj.length > 0 && obj[0] && typeof obj[0] === "object") {
              keys.push(...getAllKeys(obj[0]));
            }
          } else {
            // For objects, get all keys
            Object.keys(obj).forEach((key) => {
              // Add the key itself
              keys.push(key);

              if (obj[key] && typeof obj[key] === "object") {
                if (Array.isArray(obj[key])) {
                  // For arrays, get keys from first element
                  if (
                    obj[key].length > 0 &&
                    obj[key][0] &&
                    typeof obj[key][0] === "object"
                  ) {
                    keys.push(...getAllKeys(obj[key][0]));
                  }
                } else {
                  // For nested objects, recurse
                  keys.push(...getAllKeys(obj[key]));
                }
              }
            });
          }
        }
        return keys;
      };

      const allKeys = getAllKeys(content);
      const keyPrompt = `
      You are an expert technical translator.
      Translate these JSON field names to ${targetLanguage}, preserving meaning but keeping them short and professional.

      Field names:
      ${allKeys.join(", ")}

      Return ONLY valid JSON of format:
      { "originalKey": "translatedKey", ... }
    `;

      const keyCompletion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: keyPrompt }],
        temperature: 0.2,
        max_tokens: 500,
      });

      let keyResponse =
        keyCompletion.choices[0]?.message?.content?.trim() || "{}";
      if (keyResponse.startsWith("```")) {
        keyResponse = keyResponse.replace(/```(json)?/g, "").trim();
      }

      let keyMap: Record<string, string> = {};
      try {
        keyMap = JSON.parse(keyResponse);
        // Validate key map structure
        if (typeof keyMap !== "object" || keyMap === null) {
          throw new Error("Invalid key map structure");
        }
      } catch (parseError) {
        this.logger.warn(
          "Invalid key map format, skipping key translation.",
          parseError,
        );
        keyMap = {};
      }

      // Step 2: Translate all values with improved error handling
      const prompt = `
      You are a professional CV translator. Understand CV tone, structure, and terminology.
      
      Translate all human-readable text values to ${targetLanguage}. Keep keys, structure, and non-text values unchanged.
      
      TRANSLATE: Natural language text (descriptions, titles, summaries).
      DO NOT TRANSLATE: Keys, dates, numbers, emails, URLs, tech names, brand/company names, personal names, null.
      
      RULES:
      - Translate accurately, preserving full meaning and CV tone
      - Correct grammar: past tense for work history, present for skills
      - Professional CV style: formal, polished, strong action verbs
      - Verify ALL text is in ${targetLanguage}
      - Return ONLY valid JSON, Preserve structure and order

      Input JSON:
      ${JSON.stringify(content, null, 2)}
      
      Output: Translated JSON in ${targetLanguage}.
    `;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a precise JSON translator. You translate only string values and preserve JSON structure and keys.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        max_tokens: Math.min(4000, Math.max(2000, contentSize / 10)), // Dynamic token limit
      });

      let response = completion.choices[0]?.message?.content?.trim();
      if (!response) {
        throw new Error("No response from OpenAI");
      }

      if (response.startsWith("```")) {
        response = response.replace(/```(json)?/g, "").trim();
      }

      let translated: any;
      try {
        translated = JSON.parse(response);
      } catch (parseError) {
        this.logger.error(
          "Failed to parse translated JSON response",
          parseError,
        );
        throw new Error("Invalid JSON response from translation service");
      }

      // Step 3: Apply key name mapping with improved logic
      const remapKeys = (obj: any, currentPath = ""): any => {
        if (Array.isArray(obj)) {
          return obj.map((item) => {
            // For array elements, use the same path as the array itself
            return remapKeys(item, currentPath);
          });
        }
        if (obj && typeof obj === "object") {
          const remapped: Record<string, any> = {};
          Object.entries(obj).forEach(([k, v]) => {
            // Look for translation in keyMap using just the key name
            const newKey = keyMap[k] || k;

            // Recursively process nested objects and arrays
            const processedValue = remapKeys(v, currentPath);

            // Handle key conflicts more intelligently
            if (remapped[newKey] !== undefined && newKey !== k) {
              // If there's a conflict, append a suffix to make it unique
              let uniqueKey = newKey;
              let counter = 1;
              while (remapped[uniqueKey] !== undefined) {
                uniqueKey = `${newKey}_${counter}`;
                counter++;
              }
              this.logger.warn(
                `Key conflict detected: ${newKey} already exists, using ${uniqueKey} instead`,
              );
              remapped[uniqueKey] = processedValue;
            } else {
              remapped[newKey] = processedValue;
            }
          });
          return remapped;
        }
        return obj;
      };

      const finalTranslated = remapKeys(translated);

      // Validate final result
      if (!finalTranslated || typeof finalTranslated !== "object") {
        throw new Error("Translation resulted in invalid object structure");
      }

      return finalTranslated;
    } catch (error: any) {
      this.logger.error(
        `Error translating CV content: ${error.message}`,
        error.stack,
      );

      // Provide more specific error messages
      if (error.message.includes("quota") || error.message.includes("429")) {
        throw new Error(
          "Translation service quota exceeded. Please try again later.",
        );
      } else if (error.message.includes("timeout")) {
        throw new Error("Translation request timed out. Please try again.");
      } else if (error.message.includes("Invalid")) {
        throw new Error(
          `Translation failed due to invalid input: ${error.message}`,
        );
      }

      throw new Error(`Translation failed: ${error.message}`);
    }
  }
}
