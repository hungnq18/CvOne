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

    const normalizedSummary =
      Array.isArray(summary) && summary.length > 0 ? summary[0] : summary;

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
        summary: normalizedSummary,
        skills: skills[0] || skills, // Take first skills list if array
        workHistory: workHistory[0] || workHistory, // Take first work experience if array
        education: [education],
      },
      careerObjective: normalizedSummary,
      Project: [],
      certification: [],
      achievement: [],
      hobby: [],
      sectionPositions: {},
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
   * Translate CV JSON content to a target language while preserving structure and keys
   */
  async translateCvContent(
    content: any,
    uiTexts: any,
    targetLanguage: string,
  ): Promise<any> {
    try {
      const languageNote = targetLanguage
        ? `Target language: ${targetLanguage}`
        : "Target language: same as input";

      // Prompt cho phần content (giữ nguyên phong cách cũ)
      const contentPrompt = `
        You are a professional CV translator. Understand CV tone, structure, and terminology.
        
        Translate all human-readable text values to ${targetLanguage}. Keep keys, structure, and non-text values unchanged.
        
        TRANSLATE: Natural language text (descriptions, titles, summaries),Translate org prefixes to ${targetLanguage}, keep names.
        DO NOT TRANSLATE: Keys, dates, numbers, emails, URLs, tech names, brand/company names, personal names, null.
        
        RULES:
        
        - Translate accurately, preserving full meaning and CV tone
        - Correct grammar: past tense for work history, present for skills. Include all articles/prepositions
        - Professional CV style: formal language, strong action verbs
        - Clear, natural phrasing - no awkward machine translations
        - Verify ALL text is in ${targetLanguage}. No untranslated fragments
        - Return ONLY valid JSON, Preserve JSON structure and order (no comments, markdown, explanations)
        -
        Input JSON:
        ${JSON.stringify(content, null, 2)}
        
        Output: Translated JSON in ${targetLanguage}.
      `;

      // Prompt cho phần uiTexts (dịch đơn giản, dạng object)
      const uiTextPrompt = `
 You are a translator.
      Translate all values of the following object into ${targetLanguage}, but keep the keys unchanged, Professional style: formal language, strong action verbs
Clear, natural phrasing - no awkward machine translations
      Return only valid JSON object with the same structure (no extra text, no markdown).
        Example:
        Input: { "home": "Home", "about": "About Us" }
        Output: { "home": "Startseite", "about": "Über uns" }
        
        Input:
        ${JSON.stringify(uiTexts, null, 2)}
        
        Output:
      `;

      // Gọi OpenAI song song cho cả 2 phần
      const [contentResponse, uiTextResponse] = await Promise.all([
        this.openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "You are a precise JSON translator. You translate only string values and preserve JSON structure and keys.",
            },
            { role: "user", content: contentPrompt },
          ],
          temperature: 0.2,
          max_tokens: 2000,
        }),
        this.openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "You are a JSON key-value translator. Preserve keys, translate only values.",
            },
            { role: "user", content: uiTextPrompt },
          ],
          temperature: 0.2,
          max_tokens: 500,
        }),
      ]);

      // ======= Xử lý phần content =======
      let contentTranslated =
        contentResponse.choices[0]?.message?.content?.trim();
      if (!contentTranslated)
        throw new Error("Empty response for content translation");

      // loại bỏ ```json ``` nếu có
      contentTranslated = contentTranslated
        .replace(/^```json/, "")
        .replace(/^```/, "")
        .replace(/```$/, "")
        .trim();

      const translatedContent = JSON.parse(contentTranslated);

      // ======= Xử lý phần uiTexts =======
      let uiTranslated = uiTextResponse.choices[0]?.message?.content?.trim();
      if (!uiTranslated)
        throw new Error("Empty response for uiTexts translation");

      uiTranslated = uiTranslated
        .replace(/^```json/, "")
        .replace(/^```/, "")
        .replace(/```$/, "")
        .trim();

      // Tránh lỗi nếu OpenAI trả ra string JSON hoặc text
      let translatedUiTexts: Record<string, string> = {};
      try {
        const parsed = JSON.parse(uiTranslated);
        if (typeof parsed === "object" && !Array.isArray(parsed)) {
          translatedUiTexts = parsed;
        } else {
          this.logger.warn(
            "UI Texts translation is not object, fallback to empty object",
          );
        }
      } catch {
        this.logger.warn(
          "Invalid JSON returned for uiTexts, fallback to empty object",
        );
      }

      return {
        success: true,
        data: {
          content: translatedContent,
          uiTexts: translatedUiTexts,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error translating CV content: ${error.message}`,
        error.stack,
      );
      throw new Error(`Translate failed: ${error.message}`);
    }
  }
}
