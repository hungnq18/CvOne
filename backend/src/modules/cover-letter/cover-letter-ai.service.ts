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
      // baseURL: "https://models.github.ai/inference",
      apiKey: apiKey,
    });
  }

  async generateCoverLetterByAi(
    createClAi: CreateGenerateCoverLetterDto,
    jdPath: string
  ) {
    try {
      const {
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
        templateId,
        recipientFirstName,
        recipientLastName,
        recipientCity,
        recipientState,
        recipientPhone,
        recipientEmail,
      } = createClAi;

      const jdBuffer = fs.readFileSync(jdPath);
      const jobDescriptionText = (await pdfParse(jdBuffer)).text;

      const prompt = `
You are a professional assistant specialized in writing job application cover letters.

Your task is to:
1. Analyze the job description below.
2. Detect whether it is written in **Vietnamese** or **English**.
3. Generate a cover letter body using the **same language** as the job description.
4. Use the candidate's information to personalize the response.

---

Job Description:
${jobDescriptionText}

---

Candidate Information:
- First Name: ${firstName}
- Last Name: ${lastName}
- Profession: ${profession}
- City: ${city}
- State: ${state}
- Phone: ${phone}
- Email: ${email}
- Date: ${date}
- Strengths: ${(strengths || []).join(", ")}
- Work Style: ${workStyle}

---

Return a valid JSON object with this structure:

{
  "subject": "",           // A concise subject related to the job
  "opening": "",           // Introduction paragraph showing interest
  "body": "",              // Main paragraph explaining qualifications
  "callToAction": ""       // Polite invitation to interview
}

Rules:
- Always match the language of the job description.
- Do NOT include greeting, recipient information, closing, or signature.
- Do NOT add any explanation, markdown, or extra text — return only valid JSON.
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

      const cleanedResponse = response.replace(/```json/g, "").replace(/```/g, "");

      const { subject, opening, body, callToAction } =
        JSON.parse(cleanedResponse);

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

          subject,
          greeting: `Dear ${recipientFirstName} ${recipientLastName},`,
          opening,
          body,
          callToAction,
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
You are an expert at analyzing cover letters. Your task is to extract key fields from the following cover letter and enhance them to better match the job description.

---

**Cover Letter Content**:
${coverLetterText}

**Job Description**:
${jobDescriptionText}

---

Instructions:
1. Detect the language of the job description (Vietnamese or English).
2. Based on the detected language, return the JSON fields **in the same language** (either Vietnamese or English).
3. Keep the tone professional, concise, and relevant to the job description.
4. If any field is missing, infer the best possible value from the context.

Return a valid JSON object with **only** the following structure:

{
  "firstName": "",       // Applicant's first name
  "lastName": "",        // Applicant's last name
  "email": "",           // Email address
  "phone": "",           // Phone number
  "subject": "",         // Subject or position applied for
  "greeting": "",        // e.g. "Dear Hiring Manager" or "Kính gửi"
  "opening": "",         // Opening paragraph with motivation and interest
  "body": "",            // Main paragraph elaborating experience and skills
  "callToAction": "",    // Request for interview or next step
  "closing": "",         // Closing phrase (e.g. "Sincerely", "Trân trọng")
  "signature": ""        // Applicant's full name or sign-off
}

IMPORTANT:
- Only return the JSON object, no additional explanation or markdown.
- Write all content in the **same language as the job description**.
- Use natural, human-like language appropriate for a formal cover letter.
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
