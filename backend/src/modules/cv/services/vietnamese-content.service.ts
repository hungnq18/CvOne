import { Injectable, Logger } from "@nestjs/common";
import { AiUsageLogService } from "src/modules/ai-usage-log/ai-usage-log.service";
import { OpenaiApiService } from "./openai-api.service";

@Injectable()
export class VietnameseContentService {
  private readonly logger = new Logger(VietnameseContentService.name);

  constructor(
    private openaiApiService: OpenaiApiService,
    private readonly logService: AiUsageLogService
  ) {}

  /**
   * Auto-detect language from text or job analysis
   */
  private detectLanguage(text?: string, jobAnalysis?: any): "vi" | "en" {
    // Check text first if provided
    if (text && text.trim().length > 0) {
      const vietnameseChars = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/i;
      const vietnameseWords = /\b(và|với|trong|cho|của|được|là|một|các|này|đó|nào|khi|nếu|để|về|theo|từ|sẽ|đã|đang|việc|dự án|hệ thống|ứng dụng|phần mềm|phát triển|thiết kế|quản lý|kinh nghiệm|kỹ năng|công ty|chức vụ)\b/i;
      if (vietnameseChars.test(text) || vietnameseWords.test(text)) {
        return "vi";
      }
    }

    // Check job analysis fields
    if (jobAnalysis) {
      const checkText = [
        ...(jobAnalysis.keyResponsibilities || []),
        ...(jobAnalysis.cvSuggestions || []),
        jobAnalysis.additionalRequirements || "",
      ].join(" ");

      if (checkText) {
        const vietnameseChars = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/i;
        const vietnameseWords = /\b(và|với|trong|cho|của|được|là|một|các|này|đó|nào|khi|nếu|để|về|theo|từ|sẽ|đã|đang|việc|dự án|hệ thống|ứng dụng|phần mềm|phát triển|thiết kế|quản lý|kinh nghiệm|kỹ năng|công ty|chức vụ)\b/i;
        if (vietnameseChars.test(checkText) || vietnameseWords.test(checkText)) {
          return "vi";
        }
      }
    }

    return "en";
  }

  /**
   * Generate professional summary with auto-detected language using OpenAI
   */
  async generateProfessionalSummaryVi(
    jobAnalysis: any,
    additionalRequirements?: string
  ): Promise<{ summary: string; total_tokens: number }> {
    try {
      // Auto-detect language from job analysis
      const detectedLanguage = this.detectLanguage(additionalRequirements, jobAnalysis);
      
      // Extract structured data from job analysis
      const requiredSkills = (jobAnalysis?.requiredSkills || []).join(", ");
      const technologies = (jobAnalysis?.technologies || []).join(", ");
      const experienceLevel = jobAnalysis?.experienceLevel || "mid-level";
      const industry = jobAnalysis?.industry || "technology";
      const keyResponsibilities = (jobAnalysis?.keyResponsibilities || []).slice(0, 3).join("; ");
      const softSkills = (jobAnalysis?.softSkills || []).join(", ");
      const cvSuggestions = (jobAnalysis?.cvSuggestions || []).slice(0, 3).join("\n");

      // Build prompt based on detected language
      const isVietnamese = detectedLanguage === "vi";
      
      const prompt = isVietnamese ? `
      Viết Professional Summary bằng tiếng Việt cho CV dựa trên phân tích JD chi tiết sau:
      
      === THÔNG TIN JD ===
      - Cấp độ kinh nghiệm: ${experienceLevel}
      - Ngành: ${industry}
      - Kỹ năng yêu cầu: ${requiredSkills || "Không xác định"}
      - Công nghệ & Tools: ${technologies || "Không xác định"}
      - Trách nhiệm chính: ${keyResponsibilities || "Không xác định"}
      - Kỹ năng mềm: ${softSkills || "Không xác định"}
      
      ${cvSuggestions ? `=== GỢI Ý CV TỪ JD ===\n${cvSuggestions}\n` : ""}
      
      ${additionalRequirements ? `Yêu cầu bổ sung: ${additionalRequirements}\n` : ""}
      
      === QUY TẮC BẮT BUỘC ===
      1. ĐÚNG 2-3 câu (không được 4 câu)
      2. Bắt đầu bằng job title cụ thể dựa trên experience level và industry:
         - Junior: "Lập trình viên", "Nhà phát triển"
         - Mid-level: "Kỹ sư phần mềm", "Lập trình viên"
         - Senior: "Kỹ sư phần mềm cao cấp", "Chuyên gia phát triển"
      3. Ngôi thứ ba ẩn, không có "tôi/mình/em"
      4. Liệt kê ĐẦY ĐỦ và CHÍNH XÁC các technologies từ danh sách trên, ưu tiên ngôn ngữ lập trình đầu tiên
      5. Experience level phù hợp:
         - Junior: "với kinh nghiệm trong", "có kinh nghiệm"
         - Mid-level: "với kinh nghiệm", "có nền tảng vững chắc"
         - Senior: "với nhiều năm kinh nghiệm", "chuyên gia trong"
      6. Soft skills dùng active voice: "có kỹ năng...", "thể hiện khả năng..."
      7. Động từ: phát triển, triển khai, xây dựng, tối ưu, thiết kế, quản lý
      8. Sử dụng thông tin từ "GỢI Ý CV TỪ JD" nếu có để làm summary cụ thể hơn
      9. KHÔNG dùng từ chung chung như "công nghệ hiện đại", "các công cụ" - phải liệt kê TÊN CỤ THỂ
      
      Chỉ trả về đoạn summary, không markdown, không giải thích.
      ` : `
      Write a Professional Summary in English for a CV based on the following detailed job analysis:
      
      === JOB ANALYSIS ===
      - Experience Level: ${experienceLevel}
      - Industry: ${industry}
      - Required Skills: ${requiredSkills || "Not specified"}
      - Technologies & Tools: ${technologies || "Not specified"}
      - Key Responsibilities: ${keyResponsibilities || "Not specified"}
      - Soft Skills: ${softSkills || "Not specified"}
      
      ${cvSuggestions ? `=== CV SUGGESTIONS FROM JD ===\n${cvSuggestions}\n` : ""}
      
      ${additionalRequirements ? `Additional Requirements: ${additionalRequirements}\n` : ""}
      
      === MANDATORY RULES ===
      1. EXACTLY 2-3 sentences (not 4)
      2. Start with specific job title based on experience level and industry:
         - Junior: "Developer", "Software Developer"
         - Mid-level: "Software Engineer", "Developer"
         - Senior: "Senior Software Engineer", "Expert Developer"
      3. Third person, no "I/me/my"
      4. List ALL and EXACT technologies from the list above, prioritize programming languages first
      5. Experience level appropriate:
         - Junior: "with experience in", "experienced in"
         - Mid-level: "with experience", "solid foundation in"
         - Senior: "with years of experience", "expert in"
      6. Soft skills use active voice: "demonstrates...", "shows ability to..."
      7. Action verbs: developed, implemented, built, optimized, designed, managed
      8. Use information from "CV SUGGESTIONS FROM JD" if available to make summary more specific
      9. DO NOT use generic terms like "modern technologies", "various tools" - must list SPECIFIC NAMES
      
      Return only the summary, no markdown, no explanation.
      `;

      const systemMessage = isVietnamese
        ? "Bạn là chuyên gia viết CV chuyên nghiệp. Bạn PHẢI sử dụng CHÍNH XÁC các tên công nghệ, kỹ năng từ job analysis. KHÔNG dùng từ chung chung. Luôn trả về đoạn Professional Summary bằng tiếng Việt, không markdown, 2-3 câu."
        : "You are a professional CV writer. You MUST use EXACT technology and skill names from the job analysis. DO NOT use generic terms. Always return a Professional Summary in English, no markdown, 2-3 sentences.";

      const openai = this.openaiApiService.getOpenAI();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemMessage,
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
      throw error;
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
      throw new Error("Invalid response format: expected array of summaries");
    } catch (error) {
      this.logger.error(
        `Error generating Vietnamese professional summaries: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }
}
