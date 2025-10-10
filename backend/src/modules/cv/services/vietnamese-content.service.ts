import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";

@Injectable()
export class VietnameseContentService {
  private readonly logger = new Logger(VietnameseContentService.name);
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
   * Generate professional summary in Vietnamese using OpenAI
   */
  async generateProfessionalSummaryVi(
    jobAnalysis: any,
    additionalRequirements?: string
  ): Promise<string> {
    try {
      const prompt = `
Viết một đoạn Professional Summary bằng tiếng Việt, chuyên nghiệp, phù hợp với phân tích JD sau:

Phân tích JD:
${JSON.stringify(jobAnalysis)}

${additionalRequirements ? `Yêu cầu bổ sung: ${additionalRequirements}` : ""}

Yêu cầu:
- Độ dài 2-3 câu
- Sử dụng ngôn ngữ chuyên nghiệp, tự nhiên
- Không đề cập tên người dùng
- Tập trung vào kỹ năng, kinh nghiệm và giá trị phù hợp với JD

Chỉ trả về đoạn summary, không giải thích, không markdown.
`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "Bạn là chuyên gia viết CV. Luôn trả về đoạn Professional Summary bằng tiếng Việt, không markdown.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      let response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error("No response from OpenAI");
      }
      // Remove markdown if present
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith("```")) {
        cleanResponse = cleanResponse
          .replace(/^```[a-z]*\n?/i, "")
          .replace(/```$/, "")
          .trim();
      }
      return cleanResponse;
    } catch (error) {
      this.logger.error(
        `Error generating Vietnamese professional summary: ${error.message}`,
        error.stack
      );
      return "Ứng viên có kỹ năng và kinh nghiệm phù hợp với yêu cầu công việc, sẵn sàng đóng góp và phát triển trong môi trường chuyên nghiệp.";
    }
  }

  /**
   * Generate multiple professional summaries in Vietnamese using OpenAI
   */
  async generateProfessionalSummariesVi(
    jobAnalysis: any,
    additionalRequirements?: string,
    count: number = 3
  ): Promise<string[]> {
    try {
      const prompt = `
Viết ${count} đoạn Professional Summary bằng tiếng Việt, chuyên nghiệp, phù hợp với phân tích JD sau:

Phân tích JD:
${JSON.stringify(jobAnalysis)}

${additionalRequirements ? `Yêu cầu bổ sung: ${additionalRequirements}` : ""}

Yêu cầu:
- Mỗi đoạn dài 2-3 câu
- Sử dụng ngôn ngữ chuyên nghiệp, tự nhiên
- Không đề cập tên người dùng
- Tập trung vào kỹ năng, kinh nghiệm và giá trị phù hợp với JD

Chỉ trả về một mảng JSON gồm ${count} đoạn summary, ví dụ:
[
  "Summary 1...",
  "Summary 2...",
  "Summary 3..."
]
Không giải thích, không markdown.
`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "Bạn là chuyên gia viết CV. Luôn trả về mảng JSON các đoạn Professional Summary bằng tiếng Việt, không markdown.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      let response = completion.choices[0]?.message?.content;
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
      if (Array.isArray(summaries)) {
        return summaries;
      }
      return [cleanResponse];
    } catch (error) {
      this.logger.error(
        `Error generating Vietnamese professional summaries: ${error.message}`,
        error.stack
      );
      // fallback: return multiple copies of fallback
      const fallback =
        "Ứng viên có kỹ năng và kinh nghiệm phù hợp với yêu cầu công việc, sẵn sàng đóng góp và phát triển trong môi trường chuyên nghiệp.";
      return Array(count).fill(fallback);
    }
  }
}
