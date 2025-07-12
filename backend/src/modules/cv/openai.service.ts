import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import OpenAI from "openai";
import { User } from "../users/schemas/user.schema";

@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name);
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>
  ) {
    const apiKey = this.configService.get<string>("OPENAI_API_KEY");
    console.log('DEBUG OPENAI_API_KEY (ConfigService):', apiKey);
    console.log('DEBUG OPENAI_API_KEY (process.env):', process.env.OPENAI_API_KEY);
    if (!apiKey) {
      this.logger.warn("OPENAI_API_KEY not found in environment variables");
    }

    this.openai = new OpenAI({
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
        model: "gpt-4o",
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

      // Loại bỏ markdown nếu có
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```/, '').replace(/```$/, '').trim();
      }

      // Parse JSON response
      const analysis = JSON.parse(cleanResponse);

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
   * Generate multiple professional summaries using OpenAI
   */
  async generateProfessionalSummary(
    userProfile: any,
    jobAnalysis: any,
    additionalRequirements?: string
  ): Promise<string[]> {
    try {
      const prompt = `
Generate 3 different compelling professional summaries for a CV based on the following information:

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
        temperature: 0.7,
        max_tokens: 400,
      });

      let response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error("No response from OpenAI");
      }
      // Remove markdown if present
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```/, '').replace(/```$/, '').trim();
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
        error.stack
      );
      // fallback: return 3 copies of fallback summary
      const fallback = this.generateFallbackSummary(userProfile, jobAnalysis);
      return [fallback, fallback, fallback];
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
   * Generate multiple skills section options with ratings using OpenAI
   */
  async generateSkillsSection(
    jobAnalysis: any,
    userSkills?: Array<{ name: string; rating: number }>
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
        temperature: 0.4,
        max_tokens: 1000,
      });

      let response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error("No response from OpenAI");
      }
      // Remove markdown if present
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```/, '').replace(/```$/, '').trim();
      }
      const skillsLists = JSON.parse(cleanResponse);
      if (Array.isArray(skillsLists) && skillsLists.length === 3) {
        return skillsLists;
      }
      // fallback: wrap single list in array
      return [skillsLists];
    } catch (error) {
      this.logger.error(
        `Error generating skills section: ${error.message}`,
        error.stack
      );
      // fallback: return 3 copies of fallback skills
      const fallback = this.generateFallbackSkills(jobAnalysis);
      return [fallback, fallback, fallback];
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
        model: "gpt-4o",
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

  public getOpenAI() {
    return this.openai;
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

  /**
   * Analyze CV content using OpenAI
   */
  async analyzeCvContent(cvText: string): Promise<{
    userData: {
      firstName: string;
      lastName: string;
      professional: string;
      city: string;
      country: string;
      province: string;
      phone: string;
      email: string;
      avatar: string;
      summary: string;
      skills: Array<{ name: string; rating: number }>;
      workHistory: Array<{
        title: string;
        company: string;
        startDate: string;
        endDate: string;
        description: string;
      }>;
      education: Array<{
        startDate: string;
        endDate: string;
        major: string;
        degree: string;
        institution: string;
      }>;
    };
  }> {
    try {
      const prompt = `
Analyze the following CV content and extract structured information in JSON format:

CV Content:
${cvText}

Please provide a detailed analysis in the following JSON structure:
{
  "userData": {
    "firstName": "First Name",
    "lastName": "Last Name", 
    "professional": "Professional Title",
    "city": "City",
    "country": "Country",
    "province": "Province/State",
    "phone": "Phone Number",
    "email": "email@example.com",
    "avatar": "",
    "summary": "Professional summary extracted from CV",
    "skills": [
      {
        "name": "Skill Name",
        "rating": 4
      }
    ],
    "workHistory": [
      {
        "title": "Job Title",
        "company": "Company Name",
        "startDate": "YYYY-MM-DD",
        "endDate": "YYYY-MM-DD or Present",
        "description": "Job description"
      }
    ],
    "education": [
      {
        "startDate": "YYYY-MM-DD",
        "endDate": "YYYY-MM-DD",
        "major": "Major/Field of Study",
        "degree": "Degree Name",
        "institution": "Institution Name"
      }
    ]
  }
}

Focus on:
- Extract personal information accurately (name, contact, location)
- Identify professional title/role
- Identify all skills mentioned with appropriate ratings (1-5)
- Parse work experience with dates and descriptions
- Extract education details with proper structure
- Ensure all dates are in YYYY-MM-DD format
- Set empty string for avatar if not found

Return only valid JSON without any additional text.
`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a professional CV analyzer. Always respond with valid JSON format matching the CV schema structure.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error("No response from OpenAI");
      }

      // Loại bỏ markdown nếu có
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```/, '').replace(/```$/, '').trim();
      }

      // Parse JSON response
      const analysis = JSON.parse(cleanResponse);

      this.logger.log("CV content analysis completed successfully");
      return analysis;
    } catch (error) {
      this.logger.error(
        `Error analyzing CV content: ${error.message}`,
        error.stack
      );

      // Check if it's a quota exceeded error
      if (error.message.includes("429") || error.message.includes("quota")) {
        this.logger.warn("OpenAI quota exceeded, using fallback CV analysis");
        return this.fallbackCvAnalysis(cvText);
      }

      // Fallback to basic analysis if OpenAI fails
      return this.fallbackCvAnalysis(cvText);
    }
  }

  /**
   * Fallback CV analysis when OpenAI is not available
   */
  private fallbackCvAnalysis(cvText: string) {
    const lines = cvText.split('\n').filter(line => line.trim());
    
    return {
      userData: {
        firstName: "First",
        lastName: "Name",
        professional: "Software Developer",
        city: "City",
        country: "Country",
        province: "Province",
        phone: "Phone Number",
        email: "email@example.com",
        avatar: "",
        summary: "Professional summary extracted from CV content",
        skills: [
          { name: "Problem Solving", rating: 4 },
          { name: "Communication", rating: 4 },
          { name: "Teamwork", rating: 4 }
        ],
        workHistory: [
          {
            title: "Software Developer",
            company: "Company Name",
            startDate: "2020-01-01",
            endDate: "Present",
            description: "Developed and maintained applications"
          }
        ],
        education: [
          {
            startDate: "2016-09-01",
            endDate: "2020-06-30",
            major: "Computer Science",
            degree: "Bachelor's Degree",
            institution: "University Name"
          }
        ]
      }
    };
  }
}
