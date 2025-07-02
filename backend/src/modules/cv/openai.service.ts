import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";
import { CreateGenerateCoverLetterDto } from "../cover-letter/dto/create-generate-cl-ai.dto";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "../users/schemas/user.schema";
import { Model } from "mongoose";
import * as fs from "fs";
import * as pdfParse from "pdf-parse";

@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name);
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>
  ) {
    const apiKey = this.configService.get<string>("OPENAI_API_KEY");
    if (!apiKey) {
      this.logger.warn("OPENAI_API_KEY not found in environment variables");
    }

    this.openai = new OpenAI({
      baseURL: "https://models.github.ai/inference",
      apiKey: apiKey,
    });
  }

  /**
   * Analyze job description using OpenAI
   */
  async analyzeJobDescription(jobDescription: string): Promise<{
    requiredSkills: string[];
    experienceLevel: string;
    keyResponsibilities: string[];
    industry: string;
    technologies: string[];
    softSkills: string[];
    education: string;
    certifications: string[];
  }> {
    try {
      const prompt = `
Analyze the following job description and extract key information in JSON format:

Job Description:
${jobDescription}

Please provide a detailed analysis in the following JSON structure:
{
  "requiredSkills": ["skill1", "skill2", "skill3"],
  "experienceLevel": "junior|mid-level|senior",
  "keyResponsibilities": ["responsibility1", "responsibility2"],
  "industry": "technology|finance|healthcare|etc",
  "technologies": ["tech1", "tech2", "tech3"],
  "softSkills": ["communication", "leadership", "teamwork"],
  "education": "Bachelor's|Master's|PhD|etc",
  "certifications": ["cert1", "cert2"]
}

Focus on:
- Technical skills and programming languages
- Frameworks and tools mentioned
- Experience level indicators (junior, senior, lead, etc.)
- Industry context
- Required soft skills
- Educational requirements
- Any certifications mentioned

Return only valid JSON without any additional text.
`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a professional job description analyzer. Always respond with valid JSON format.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error("No response from OpenAI");
      }

      // Parse JSON response
      const analysis = JSON.parse(response);

      this.logger.log("Job description analysis completed successfully");
      return analysis;
    } catch (error) {
      this.logger.error(
        `Error analyzing job description: ${error.message}`,
        error.stack
      );

      // Check if it's a quota exceeded error
      if (error.message.includes("429") || error.message.includes("quota")) {
        this.logger.warn("OpenAI quota exceeded, using fallback analysis");
        return this.fallbackAnalysis(jobDescription);
      }

      // Fallback to basic analysis if OpenAI fails
      return this.fallbackAnalysis(jobDescription);
    }
  }

  /**
   * Generate professional summary using OpenAI
   */
  async generateProfessionalSummary(
    userProfile: any,
    jobAnalysis: any,
    additionalRequirements?: string
  ): Promise<string> {
    try {
      const prompt = `
Generate a compelling professional summary for a CV based on the following information:

User Profile:
- Name: ${userProfile.first_name} ${userProfile.last_name}
- City: ${userProfile.city || "Not specified"}
- Country: ${userProfile.country || "Not specified"}

Job Analysis:
- Required Skills: ${jobAnalysis.requiredSkills?.join(", ") || "Not specified"}
- Experience Level: ${jobAnalysis.experienceLevel || "Not specified"}
- Industry: ${jobAnalysis.industry || "Not specified"}
- Technologies: ${jobAnalysis.technologies?.join(", ") || "Not specified"}

Additional Requirements: ${additionalRequirements || "None"}

Create a professional summary that:
1. Highlights relevant skills and experience
2. Matches the job requirements
3. Shows enthusiasm and potential
4. Is 2-3 sentences long
5. Uses professional language
6. Focuses on value proposition

Write only the summary without any additional text or formatting.
`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a professional CV writer. Create compelling and relevant professional summaries.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      });

      const summary = completion.choices[0]?.message?.content;
      return summary || this.generateFallbackSummary(userProfile, jobAnalysis);
    } catch (error) {
      this.logger.error(
        `Error generating professional summary: ${error.message}`,
        error.stack
      );

      // Check if it's a quota exceeded error
      if (error.message.includes("429") || error.message.includes("quota")) {
        this.logger.warn("OpenAI quota exceeded, using fallback summary");
      }

      return this.generateFallbackSummary(userProfile, jobAnalysis);
    }
  }

  /**
   * Generate work experience descriptions using OpenAI
   */
  async generateWorkExperience(
    jobAnalysis: any,
    experienceLevel: string
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
        Date.now() - years * 365 * 24 * 60 * 60 * 1000
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
        model: "gpt-3.5-turbo",
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
        temperature: 0.6,
        max_tokens: 300,
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
        error.stack
      );

      // Check if it's a quota exceeded error
      if (error.message.includes("429") || error.message.includes("quota")) {
        this.logger.warn(
          "OpenAI quota exceeded, using fallback work experience"
        );
      }

      return this.generateFallbackWorkExperience(jobAnalysis, experienceLevel);
    }
  }

  /**
   * Generate skills section with ratings using OpenAI
   */
  async generateSkillsSection(
    jobAnalysis: any,
    userSkills?: Array<{ name: string; rating: number }>
  ): Promise<Array<{ name: string; rating: number }>> {
    try {
      const existingSkills =
        userSkills?.map((s) => s.name).join(", ") || "None";

      const prompt = `
Generate a skills section for a CV based on the job analysis and existing user skills.

Job Analysis:
- Required Skills: ${jobAnalysis.requiredSkills?.join(", ") || "Not specified"}
- Technologies: ${jobAnalysis.technologies?.join(", ") || "Not specified"}
- Experience Level: ${jobAnalysis.experienceLevel || "Not specified"}

Existing User Skills: ${existingSkills}

Create a skills list in JSON format with ratings (1-5):
[
  {
    "name": "Skill Name",
    "rating": 4
  }
]

Requirements:
- Include both required skills and technologies from job analysis
- Add relevant soft skills (communication, teamwork, leadership, etc.)
- Rate skills appropriately for the experience level
- Include 8-12 skills total
- Use proper capitalization for skill names
- Ratings: 1=Beginner, 2=Elementary, 3=Intermediate, 4=Advanced, 5=Expert

Return only valid JSON array.
`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a professional CV writer. Create relevant skills sections with appropriate ratings.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.4,
        max_tokens: 400,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error("No response from OpenAI");
      }

      const skills = JSON.parse(response);
      return skills;
    } catch (error) {
      this.logger.error(
        `Error generating skills section: ${error.message}`,
        error.stack
      );

      // Check if it's a quota exceeded error
      if (error.message.includes("429") || error.message.includes("quota")) {
        this.logger.warn("OpenAI quota exceeded, using fallback skills");
      }

      return this.generateFallbackSkills(jobAnalysis);
    }
  }

  /**
   * Check OpenAI API status
   */
  async checkApiStatus(): Promise<{
    success: boolean;
    status: string;
    message: string;
    error?: string;
  }> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Hello" }],
        max_tokens: 10,
      });

      return {
        success: true,
        status: "available",
        message: "OpenAI API is working correctly",
      };
    } catch (error) {
      if (error.message.includes("429") || error.message.includes("quota")) {
        return {
          success: false,
          status: "quota_exceeded",
          message:
            "OpenAI quota exceeded. Please check your billing and add credits to your account.",
          error: error.message,
        };
      } else if (
        error.message.includes("401") ||
        error.message.includes("invalid")
      ) {
        return {
          success: false,
          status: "invalid_key",
          message: "Invalid OpenAI API key. Please check your configuration.",
          error: error.message,
        };
      } else {
        return {
          success: false,
          status: "error",
          message: "OpenAI API is not available",
          error: error.message,
        };
      }
    }
  }

  // Fallback methods for when OpenAI is not available
  private fallbackAnalysis(jobDescription: string) {
    const lowerDescription = jobDescription.toLowerCase();

    return {
      requiredSkills: ["Problem Solving", "Communication", "Teamwork"],
      experienceLevel: lowerDescription.includes("senior")
        ? "senior"
        : lowerDescription.includes("junior")
          ? "junior"
          : "mid-level",
      keyResponsibilities: ["Development", "Collaboration"],
      industry: "technology",
      technologies: ["JavaScript", "React", "Node.js"],
      softSkills: ["Communication", "Teamwork"],
      education: "Bachelor's",
      certifications: [],
    };
  }

  private generateFallbackSummary(userProfile: any, jobAnalysis: any): string {
    return `Experienced ${jobAnalysis.experienceLevel} professional with expertise in ${jobAnalysis.requiredSkills?.slice(0, 3).join(", ") || "software development"}.
    Passionate about delivering high-quality solutions and collaborating with cross-functional teams.
    Strong problem-solving skills and commitment to continuous learning and professional development.`;
  }

  private generateFallbackWorkExperience(
    jobAnalysis: any,
    experienceLevel: string
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
    jobAnalysis: any
  ): Array<{ name: string; rating: number }> {
    const allSkills = [
      ...(jobAnalysis.requiredSkills || []),
      ...(jobAnalysis.technologies || []),
    ];
    const uniqueSkills = [...new Set(allSkills)];

    return uniqueSkills.slice(0, 8).map((skill) => ({
      name: skill.charAt(0).toUpperCase() + skill.slice(1),
      rating: Math.floor(Math.random() * 3) + 3,
    }));
  }

  async generateCoverLetterByAi(createClAi: CreateGenerateCoverLetterDto) {
    try {
      const {
        jobDescription,
        strengths,
        workStyle,
        firstName,
        lastName,
        profession,
        city,
        state,
        phone,
        email,
        date,
        recipientFirstName,
        recipientLastName,
        recipientCity,
        recipientState,
        recipientPhone,
        recipientEmail,
        templateId,
      } = createClAi;
      const prompt = `
You are a career writing assistant. Based on the following information, generate a personalized cover letter section.

Job Description:
${jobDescription}

Candidate’s Strengths:
${strengths.join(", ")}

Candidate’s Work Style:
${workStyle}

Generate a JSON object with the following structure:
{
  "subject": "A concise subject line related to the job position",
  "opening": "An engaging opening paragraph introducing the applicant’s interest and highlighting relevant strengths",
  "body": "A body paragraph showing how the applicant’s skills, strengths, and work style match the job requirements",
  "callToAction": "A polite call to action to express interest in an interview or further discussion"
}

Guidelines:
- Tailor the content based on job description and the candidate’s strengths & work style
- Use a professional, confident, and enthusiastic tone
- Do NOT include generic phrases
- Do NOT include greeting, closing, signature, or contact details
- Only return a **valid JSON object** — do not include markdown or any extra explanation
`;

      const completion = await this.openai.chat.completions.create({
        model: "openai/gpt-4.1",
        messages: [
          {
            role: "system",
            content:
              "You are a professional cover letter writer. Generate only the requested fields in JSON format.",
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
      const parsed = JSON.parse(response);

      const coverLetter = {
        templateId: templateId,
        title: "Generated Cover Letter",
        data: {
          firstName,
          lastName,
          profession,
          city,
          state,
          phone,
          email,
          date,
          recipientFirstName,
          recipientLastName,
          recipientCity,
          recipientState,
          recipientPhone,
          recipientEmail,

          subject: parsed.subject,
          greeting: `Dear ${recipientFirstName} ${recipientLastName},`,
          opening: parsed.opening,
          body: parsed.body,
          callToAction: parsed.callToAction,
          closing: "Sincerely,",
          signature: `${firstName} ${lastName}`,
        },
      };

      return coverLetter;
    } catch (error) {
      console.error("Cover letter generation failed:", error);
      throw new Error("Failed to generate cover letter: " + error.message);
    }
  }

  async extractCoverLetterFromPdf(
    coverLetterPath: string,
    jdPath: string,
    templateId: string
  ) {
    // 1. Validate file existence
    if (!fs.existsSync(coverLetterPath)) {
      throw new Error("Cover letter PDF file does not exist");
    }
    if (!fs.existsSync(jdPath)) {
      throw new Error("Job description PDF file does not exist");
    }

    // 2. Read and extract text from both PDFs
    const coverLetterBuffer = fs.readFileSync(coverLetterPath);
    const jdBuffer = fs.readFileSync(jdPath);

    const coverLetterText = (await pdfParse(coverLetterBuffer)).text;
    const jobDescriptionText = (await pdfParse(jdBuffer)).text;

    const prompt = `
  You are an expert at analyzing cover letters. Below is the content of a cover letter and a job description. Your task is to extract the following fields from the cover letter, tailoring the content to highlight skills, experiences, or qualifications that align with the job description.

  *Cover Letter Content*:
  ${coverLetterText}

  *Job Description*:
  ${jobDescriptionText}

  *Fields to Extract*:
  {
    "firstName": "",
    "lastName": "",
    "email": "",
    "phone": "",
    "subject": "",
    "greeting": "",
    "opening": "",
    "relevantSkills": "",
    "relevantExperience": "",
    "callToAction": "",
    "closing": "",
    "signature": ""
  }

  Return *valid JSON only* with the extracted fields.
  `;

    // 3. Call OpenAI
    const completion = await this.openai.chat.completions.create({
      model: "openai/gpt-4.1",
      messages: [
        {
          role: "system",
          content:
            "You are a professional cover letter writer. Respond only with valid JSON.",
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

    let parsed;
    try {
      parsed = JSON.parse(response);
    } catch (err) {
      throw new Error("Invalid JSON returned from OpenAI: " + err.message);
    }

    return {
      templateId,
      title: "Extracted from PDF",
      data: parsed,
    };
  }
}
