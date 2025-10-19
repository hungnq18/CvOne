import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as fs from "fs";
import OpenAI from "openai";
import * as pdfParse from "pdf-parse";
import { CreateGenerateCoverLetterDto } from "../cover-letter/dto/create-generate-cl-ai.dto";
import { OpenaiApiService } from "../cv/services/openai-api.service";

@Injectable()
export class CoverLetterAiService {
  constructor(private openaiApiService: OpenaiApiService) {}

  async generateCoverLetterByAi(
    createClAi: CreateGenerateCoverLetterDto,
    jobDescription: string
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
    templateId: string
  ) {
    const prompt = `
You are an expert at analyzing cover letters. Your task is to extract key fields from the following cover letter and enhance them to better match the job description.

---

**Cover Letter Content**:
${coverLetter}

**Job Description**:
${jobDescription}

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
