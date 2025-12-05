import { Injectable, Logger, HttpException, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as fs from "fs";
import OpenAI from "openai";
import * as pdfParse from "pdf-parse";
import { CreateGenerateCoverLetterDto } from "../cover-letter/dto/create-generate-cl-ai.dto";
import { OpenaiApiService } from "../cv/services/openai-api.service";
import { AiUsageLogService } from "../ai-usage-log/ai-usage-log.service";

@Injectable()
export class CoverLetterAiService {
  constructor(
    private openaiApiService: OpenaiApiService,
    private readonly logService: AiUsageLogService
  ) {}

  async generateCoverLetterByAi(
    createClAi: CreateGenerateCoverLetterDto,
    jobDescription: string,
    userId: string
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

      const prompt = `
You are a professional assistant specialized in writing job application cover letters.

Your task is to:
1. Analyze the job description below.
2. Detect whether it is written in **Vietnamese** or **English**.
3. Generate a cover letter body using the **same language** as the job description.
4. Use the candidate's information to personalize the response.

---

Job Description:
${jobDescription}

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

      const completion = await this.openaiApiService
        .getOpenAI()
        .chat.completions.create({
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

      const usage = completion.usage || {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      };
      console.log("Usage:", usage);
      if (userId) {
        await this.logService.createLog({
          userId: userId,
          feature: "coverLetterAI",
          tokensUsed: usage.total_tokens,
        });
      }

      const cleanedResponse = response
        .replace(/```json/g, "")
        .replace(/```/g, "");

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
      throw new Error("Failed to generate cover letter: " + error.message);
    }
  }

  async extractCoverLetter(
    coverLetter: string,
    jobDescription: string,
    templateId: string,
    userId: string
  ) {
    try {
      const promptSystem = `You are a precise and reliable AI that extracts structured data from cover letters.

    Your job:
    - Read the provided Cover Letter and Job Description.
    - Detect language (Vietnamese or English).
    - Output a complete JSON object in the same language as the Job Description.
    - Always fill all fields, inferring when missing.
    - Maintain a formal, professional tone.

    Output strictly this JSON structure:
    {
      "firstName": "",
      "lastName": "",
      "email": "",
      "phone": "",
      "subject": "",
      "greeting": "",
      "opening": "",
      "body": "",
      "callToAction": "",
      "closing": "",
      "signature": ""
    }

    Rules:
    - Output **only** a valid JSON object (no markdown, no backticks, no comments).
    - Do **not** include explanations or formatting.`;
      const prompt = `
    Cover Letter:
    ${coverLetter}

    Job Description:
    ${jobDescription}
`;

      // 3. Call OpenAI
      const completion = await this.openaiApiService
        .getOpenAI()
        .chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: promptSystem,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

      let response = completion.choices[0]?.message?.content?.trim();

      if (!response) throw new Error("No response from OpenAI");

      response = response
        .replace(/```json/i, "")
        .replace(/```/g, "")
        .trim();

      let parsed;
      try {
        parsed = JSON.parse(response);
      } catch (err) {
        console.error("Raw response from OpenAI:", response);
        throw new Error("Invalid JSON returned from OpenAI: " + err.message);
      }

      const usage = completion.usage || {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      };
      console.log("Usage cover letter:", usage);
      if (userId) {
        await this.logService.createLog({
          userId: userId,
          feature: "coverLetterAI",
          tokensUsed: usage.total_tokens,
        });
      }
      return {
        templateId,
        title: "Extracted from PDF",
        data: parsed,
      };
    } catch (error) {
      Logger.error("Error extracting cover letter", error);
      throw new HttpException(
        `AI Processing Failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async generateCLByCVAndJD(
    cv: string,
    jobDescription: string,
    templateId: string
  ) {
    const prompt = `
You are a professional career assistant specializing in writing tailored cover letters.

---

**CV Content**:
${cv}

**Job Description**:
${jobDescription}

---
Your task:
1. Detect the language of the job description (Vietnamese or English).
2. Write a full, professional cover letter in the **same language** as the job description.
3. The tone must be natural, formal, and personalized — not robotic.
4. The letter must reflect the applicant’s experience, skills, and achievements from the CV, emphasizing their fit for the job.
5. Keep the structure clear and concise with these sections:
   - Greeting (e.g., “Dear Hiring Manager” or “Kính gửi …”)
   - Opening (brief introduction and motivation)
   - Body (highlight relevant experience, skills, and achievements)
   - Call to Action (express interest in interview or next steps)
   - Closing (thank you and sign-off)
---

Output:
Return only the **final cover letter text** — no JSON, no markdown, no explanations.
`;

    // 3. Call OpenAI
    const completion = await this.openaiApiService
      .getOpenAI()
      .chat.completions.create({
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

    const usage = completion.usage || {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    };
    console.log("Usage:", usage);

    return {
      templateId,
      title: "Extracted from PDF",
      data: parsed,
    };
  }
}
