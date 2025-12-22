import { Injectable, Logger } from "@nestjs/common";
import { OpenaiApiService } from "./openai-api.service";
import { AiUsageLogService } from "src/modules/ai-usage-log/ai-usage-log.service";

@Injectable()
export class VietnameseContentService {
  private readonly logger = new Logger(VietnameseContentService.name);

  constructor(
    private openaiApiService: OpenaiApiService,
    private readonly logService: AiUsageLogService
  ) {}

  /**
   * Generate professional summary in Vietnamese using OpenAI
   */
  async generateProfessionalSummaryVi(
    jobAnalysis: any,
    additionalRequirements?: string
  ): Promise<{ summary: string; total_tokens: number }> {
    try {
      const prompt = `
      Viết Professional Summary bằng tiếng Việt cho CV dựa trên phân tích JD:
      
      ${JSON.stringify(jobAnalysis)}
      
      ${additionalRequirements ? `Yêu cầu bổ sung: ${additionalRequirements}` : ""}
      
      QUY TẮC:
      - ĐÚNG 2-3 câu (không được 4 câu)
      - Bắt đầu bằng job title cụ thể (VD: "Lập trình viên back-end") - KHÔNG dùng "Nhân sự trẻ", "Ứng viên"
      - Ngôi thứ ba ẩn, không có "tôi/mình/em"
      - Liệt kê ĐẦY ĐỦ technologies từ CẢ "requiredSkills" và "technologies", ưu tiên ngôn ngữ lập trình đầu tiên (VD: C#, .NET Core, SQL Server)
      - Experience level: junior="với kinh nghiệm", KHÔNG dùng "thành thạo" cho junior
      - Soft skills dùng active voice: "có kỹ năng..." KHÔNG "kỹ năng được đánh giá cao"
      - Động từ: phát triển, triển khai, xây dựng, tối ưu
      
      Chỉ trả về đoạn summary, không markdown, không giải thích.
      `;

      const openai = this.openaiApiService.getOpenAI();
      const completion = await openai.chat.completions.create({
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
      const usage = completion.usage || {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      };
      const response = completion.choices[0]?.message?.content;
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
      return { summary: cleanResponse, total_tokens: usage.total_tokens };
    } catch (error) {
      this.logger.error(
        `Error generating Vietnamese professional summary: ${error.message}`,
        error.stack
      );
      return {
        summary:
          "Ứng viên có kỹ năng và kinh nghiệm phù hợp với yêu cầu công việc, sẵn sàng đóng góp và phát triển trong môi trường chuyên nghiệp.",
        total_tokens: 0,
      };
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

      const openai = this.openaiApiService.getOpenAI();
      const completion = await openai.chat.completions.create({
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
