import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as fs from "fs";
import OpenAI from "openai";
import * as pdfParse from "pdf-parse";
import { CreateGenerateCoverLetterDto } from "../cover-letter/dto/create-generate-cl-ai.dto";

@Injectable()
export class CoverLetterAiService {
  private readonly logger = new Logger(CoverLetterAiService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>("OPENAI_API_KEY");
    if (!apiKey) {
      this.logger.warn("OPENAI_API_KEY not found in environment variables");
    }
    this.openai = new OpenAI({
      apiKey: apiKey
    });
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

Candidate's Strengths:
${strengths.join(", ")}

Candidate's Work Style:
${workStyle}

Generate a JSON object with the following structure:
{
  "subject": "A concise subject line related to the job position",
  "opening": "An engaging opening paragraph introducing the applicant's interest and highlighting relevant strengths",
  "body": "A body paragraph showing how the applicant's skills, strengths, and work style match the job requirements",
  "callToAction": "A polite call to action to express interest in an interview or further discussion"
}

Guidelines:
- Tailor the content based on job description and the candidate's strengths & work style
- Use a professional, confident, and enthusiastic tone
- Do NOT include generic phrases
- Do NOT include greeting, closing, signature, or contact details
- Only return a **valid JSON object** — do not include markdown or any extra explanation
`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
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
      this.logger.error("Cover letter generation failed:", error);
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
You are an expert at analyzing cover letters. Below is the content of a cover letter extracted from a PDF and a job description.

Your task is to extract and enhance the following specific fields from the cover letter to better match the job description. Ensure the extracted content is relevant, professional, and tailored to the job requirements while preserving the applicant's tone and personal details.

---

**Cover Letter Content**:
${coverLetterText}

**Job Description**:
${jobDescriptionText}

---

**Return a valid JSON object with ONLY the following fields**:

{
  "firstName": "",       // First name of the applicant
  "lastName": "",        // Last name of the applicant
  "email": "",           // Email address
  "phone": "",           // Phone number
  "subject": "",         // Subject or position applied for
  "greeting": "",        // e.g. "Dear Hiring Manager"
  "opening": "",         // Opening paragraph showing interest and motivation
  "body": "",            // Main body elaborating on experience and skills
  "callToAction": "",    // A polite request for an interview or next step
  "closing": "",         // e.g. "Sincerely"
  "signature": ""        // Applicant's full name or sign-off
}

**IMPORTANT**:
- Return only this JSON structure.
- Do NOT include any explanation, extra text, or additional fields.
- Ensure all fields are filled if possible; infer when necessary from context.
- Be concise and relevant.
`;

    // 3. Call OpenAI
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o",
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