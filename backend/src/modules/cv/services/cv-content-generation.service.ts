import { Injectable, Logger } from "@nestjs/common";
import { AiUsageLogService } from "src/modules/ai-usage-log/ai-usage-log.service";
import { OpenaiApiService } from "./openai-api.service";

@Injectable()
export class CvContentGenerationService {
  private readonly logger = new Logger(CvContentGenerationService.name);

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
   * Generate multiple professional summaries using OpenAI
   */
  async generateProfessionalSummary(
    userProfile: any,
    jobAnalysis: any,
    additionalRequirements?: string
  ): Promise<{ professional: string[]; total_tokens: number }> {
    try {
      // Auto-detect language from job analysis
      const detectedLanguage = this.detectLanguage(additionalRequirements, jobAnalysis);
      const isVietnamese = detectedLanguage === "vi";
      
      const keyResponsibilities = (jobAnalysis?.keyResponsibilities || []).slice(0, 5).join("; ") || "Not specified";
      const softSkills = (jobAnalysis?.softSkills || []).join(", ") || "Not specified";
      
      const prompt = isVietnamese ? `
Viết 3 đoạn Professional Summary khác nhau bằng tiếng Việt cho CV dựa trên thông tin chi tiết sau:

Thông tin người dùng:
- Tên: ${userProfile.first_name} ${userProfile.last_name}
- Địa điểm: ${userProfile.city || "Không xác định"}, ${userProfile.country || "Không xác định"}

Chi tiết phân tích JD:
- Kỹ năng kỹ thuật yêu cầu: ${(jobAnalysis?.requiredSkills || []).join(", ") || "Không xác định"}
- Công nghệ & Tools: ${(jobAnalysis?.technologies || []).join(", ") || "Không xác định"}
- Cấp độ kinh nghiệm yêu cầu: ${jobAnalysis?.experienceLevel || "Không xác định"}
- Ngành: ${jobAnalysis?.industry || "Không xác định"}
- Trách nhiệm chính: ${keyResponsibilities}
- Kỹ năng mềm: ${softSkills}

Yêu cầu bổ sung: ${additionalRequirements || "Không có"}

YÊU CẦU CHI TIẾT cho mỗi summary:
1. Câu đầu: Bắt đầu bằng job title/role cụ thể (VD: "Kỹ sư phần mềm Backend" không phải "chuyên gia") và đề cập 2-3 công nghệ cốt lõi từ job analysis
2. Câu thứ hai: Nhấn mạnh trách nhiệm cụ thể từ keyResponsibilities phù hợp với công việc, đề cập kỹ năng mềm nếu có
3. Câu thứ ba (tùy chọn): Thể hiện giá trị với thành tựu cụ thể hoặc lĩnh vực chuyên môn phù hợp với yêu cầu công việc
4. Sử dụng động từ: phát triển, triển khai, tối ưu, thiết kế, xây dựng, tạo, quản lý
5. Bao gồm công nghệ cụ thể: Đề cập công nghệ thực tế từ job analysis (VD: "Node.js, PostgreSQL, Docker" không phải "công nghệ hiện đại")
6. Phù hợp cấp độ kinh nghiệm: Cho ${jobAnalysis?.experienceLevel || "mid-level"}, sử dụng ngôn ngữ phù hợp (junior = "với kinh nghiệm trong", senior = "chuyên gia trong", "nhiều năm kinh nghiệm")
7. Độ dài: Đúng 2-3 câu, tổng 40-60 từ
8. Cụ thể: Tránh cụm từ chung chung như "đam mê công nghệ" hoặc "làm việc nhóm" trừ khi kỹ năng mềm được đề cập trong job analysis

Cấu trúc ví dụ:
- Tùy chọn 1: Tập trung vào chuyên môn kỹ thuật và công nghệ cụ thể
- Tùy chọn 2: Tập trung vào trách nhiệm và thành tựu
- Tùy chọn 3: Tập trung vào kỹ năng mềm và hợp tác (chỉ nếu được đề cập trong job analysis)

Chỉ trả về mảng JSON gồm 3 summaries, ví dụ:
[
  "Summary 1 với công nghệ và trách nhiệm cụ thể...",
  "Summary 2 với trọng tâm khác...",
  "Summary 3 với cách tiếp cận thay thế..."
]
Không bao gồm giải thích hoặc markdown, chỉ JSON hợp lệ.
` : `
Generate 3 different compelling professional summaries for a CV based on the following detailed information:

User Profile:
- Name: ${userProfile.first_name} ${userProfile.last_name}
- Location: ${userProfile.city || "Not specified"}, ${userProfile.country || "Not specified"}

Job Analysis Details:
- Required Technical Skills: ${(jobAnalysis?.requiredSkills || []).join(", ") || "Not specified"}
- Technologies & Tools: ${(jobAnalysis?.technologies || []).join(", ") || "Not specified"}
- Experience Level Required: ${jobAnalysis?.experienceLevel || "Not specified"}
- Industry: ${jobAnalysis?.industry || "Not specified"}
- Key Responsibilities: ${keyResponsibilities}
- Soft Skills: ${softSkills}

Additional Requirements: ${additionalRequirements || "None"}

DETAILED Requirements for each summary:
1. First sentence: Start with specific job title/role (e.g., "Senior Backend Developer" not "professional") and mention 2-3 core technologies from the job analysis
2. Second sentence: Highlight specific responsibilities from keyResponsibilities that match the job, mention relevant soft skills if applicable
3. Third sentence (optional): Show value proposition with specific achievements or expertise areas that align with the job requirements
4. Use action verbs: developed, implemented, optimized, designed, built, created, managed
5. Include specific technologies: Mention actual technologies from the job analysis (e.g., "Node.js, PostgreSQL, Docker" not "modern technologies")
6. Match experience level: For ${jobAnalysis?.experienceLevel || "mid-level"} level, use appropriate language (junior = "with experience in", senior = "expert in", "extensive experience")
7. Length: Exactly 2-3 sentences, 40-60 words total
8. Be specific: Avoid generic phrases like "passionate about technology" or "team player" unless soft skills are mentioned in job analysis

Example structure:
- Option 1: Focus on technical expertise and specific technologies
- Option 2: Focus on responsibilities and achievements
- Option 3: Focus on soft skills and collaboration (only if mentioned in job analysis)

Return only a JSON array of 3 summaries, e.g.:
[
  "Summary 1 with specific technologies and responsibilities...",
  "Summary 2 with different focus...",
  "Summary 3 with alternative approach..."
]
Do not include any explanation or markdown, only valid JSON.
`;

      const systemMessage = isVietnamese
        ? "Bạn là chuyên gia viết CV chuyên nghiệp. Mỗi summary phải bao gồm công nghệ, trách nhiệm và thành tựu cụ thể từ job analysis. Tránh cụm từ chung chung. Luôn trả về mảng JSON gồm đúng 3 summaries khác nhau với các trọng tâm đa dạng."
        : "You are a professional CV writer specializing in creating specific, detailed professional summaries. Each summary must include specific technologies, responsibilities, and achievements from the job analysis. Avoid generic phrases. Always return a JSON array of exactly 3 different summaries with varied focus areas.";

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

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error("No response from OpenAI");
      }
      const usage = completion.usage || {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      };
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
        return { professional: summaries, total_tokens: usage.total_tokens };
      }

      throw new Error("Invalid response format: expected array of 3 summaries");
    } catch (error) {
      this.logger.error(
        `Error generating professional summary: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Generate work experience descriptions using OpenAI
   */
  async generateWorkExperience(
    jobAnalysis: any,
    experienceLevel: string
  ): Promise<{
    experience: Array<{
      title: string;
      company: string;
      startDate: string;
      endDate: string;
      description: string;
    }>;
    total_tokens: number;
  }> {
    try {
      // Auto-detect language from job analysis
      const detectedLanguage = this.detectLanguage(undefined, jobAnalysis);
      const isVietnamese = detectedLanguage === "vi";
      
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

      const keyResponsibilities = (jobAnalysis.keyResponsibilities || []).slice(0, 5).join("; ") || "Not specified";
      const softSkills = (jobAnalysis.softSkills || []).join(", ") || "Not specified";
      
      const prompt = isVietnamese ? `
Tạo một mục kinh nghiệm làm việc thực tế và chính xác ở định dạng JSON dựa CHẶT CHẼ trên phân tích JD chi tiết được cung cấp.

Chi tiết phân tích JD:
- Kỹ năng kỹ thuật yêu cầu: ${jobAnalysis.requiredSkills?.join(", ") || "Không xác định"}
- Công nghệ & Tools: ${jobAnalysis.technologies?.join(", ") || "Không xác định"}
- Cấp độ kinh nghiệm: ${experienceLevel}
- Ngành: ${jobAnalysis.industry || "công nghệ"}
- Trách nhiệm chính từ JD: ${keyResponsibilities}
- Kỹ năng mềm: ${softSkills}

Thời gian kinh nghiệm: ${years} năm (cấp độ ${experienceLevel})

Cấu trúc JSON đầu ra:
{
  "title": "Chức danh cụ thể phù hợp với cấp độ kinh nghiệm",
  "company": "Tên công ty thực tế (không chung chung như 'Công ty Công nghệ')",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "description": "2-3 câu với trách nhiệm cụ thể, công nghệ sử dụng, và thành tựu có thể đo lường"
}

YÊU CẦU CHI TIẾT:
1. Chức danh: Phải cụ thể và phù hợp với cấp độ kinh nghiệm:
   - Junior: "Lập trình viên", "Nhà phát triển"
   - Mid-level: "Kỹ sư phần mềm", "Lập trình viên"
   - Senior: "Kỹ sư phần mềm cao cấp", "Trưởng nhóm"
   Bao gồm công nghệ chính nếu liên quan (VD: "Kỹ sư Backend cao cấp (Node.js)")

2. Tên công ty: Tạo tên công ty thực tế dựa trên ngành:
   - Công nghệ: Sử dụng tên như "TechCorp Solutions", "Digital Innovations", "Cloud Systems"
   - Tài chính: "Nhóm Dịch vụ Tài chính", "Công ty Giải pháp Đầu tư"
   - Y tế: "HealthTech Solutions", "Hệ thống Y tế"
   - Tránh: "Công ty", "Công ty Công nghệ", "ABC Corp"

3. Mô tả (2-3 câu, 50-70 từ):
   - Câu 1: Liệt kê 2-3 trách nhiệm cụ thể từ keyResponsibilities, đề cập công nghệ chính từ job analysis
   - Câu 2: Mô tả thành tựu cụ thể với số liệu/tác động (VD: "cải thiện hiệu suất 30%", "giảm lỗi 25%", "xử lý 10,000+ yêu cầu/ngày")
   - Câu 3 (tùy chọn): Đề cập hợp tác hoặc kỹ năng mềm nếu liên quan đến job analysis
   
4. Phải bao gồm:
   - Ít nhất 3 công nghệ cụ thể từ job analysis (không phải thuật ngữ chung chung)
   - Ít nhất 2 trách nhiệm từ keyResponsibilities
   - Ít nhất 1 thành tựu có thể đo lường với số/phần trăm
   - Động từ: phát triển, triển khai, tối ưu, thiết kế, xây dựng, tạo, quản lý, cải thiện, giảm, tăng

5. KHÔNG bao gồm:
   - Trách nhiệm chung chung không có trong job analysis
   - Công nghệ không được đề cập trong job analysis
   - Thành tựu mơ hồ không có số liệu

Chỉ trả về JSON hợp lệ, không có văn bản hoặc markdown bổ sung.
` : `
Generate a realistic and accurate work experience entry in JSON format based STRICTLY on the provided detailed job analysis.

Job Analysis Details:
- Required Technical Skills: ${jobAnalysis.requiredSkills?.join(", ") || "Not specified"}
- Technologies & Tools: ${jobAnalysis.technologies?.join(", ") || "Not specified"}
- Experience Level: ${experienceLevel}
- Industry: ${jobAnalysis.industry || "technology"}
- Key Responsibilities from JD: ${keyResponsibilities}
- Soft Skills: ${softSkills}

Experience Duration: ${years} year(s) (${experienceLevel} level)

Output JSON structure:
{
  "title": "Specific Job Title matching experience level",
  "company": "Realistic Company Name (not generic like 'Tech Company')",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "description": "2-3 sentences with specific responsibilities, technologies used, and measurable achievements"
}

DETAILED Requirements:
1. Job Title: Must be specific and match experience level:
   - Junior: "Junior [Role]" or "[Role]"
   - Mid-level: "[Role]" or "Mid-level [Role]"
   - Senior: "Senior [Role]" or "Lead [Role]"
   Include primary technology if relevant (e.g., "Senior Backend Developer (Node.js)")

2. Company Name: Create a realistic company name based on industry:
   - Technology: Use names like "TechCorp Solutions", "Digital Innovations Ltd", "Cloud Systems Inc"
   - Finance: "Financial Services Group", "Investment Solutions Co"
   - Healthcare: "HealthTech Solutions", "Medical Systems Inc"
   - Avoid: "Company", "Tech Company", "ABC Corp"

3. Description (2-3 sentences, 50-70 words):
   - Sentence 1: List 2-3 specific responsibilities from keyResponsibilities, mention primary technologies from job analysis
   - Sentence 2: Describe specific achievements with metrics/impact (e.g., "improved performance by 30%", "reduced errors by 25%", "handled 10,000+ requests/day")
   - Sentence 3 (optional): Mention collaboration or soft skills if relevant to job analysis
   
4. Must include:
   - At least 3 specific technologies from the job analysis (not generic terms)
   - At least 2 responsibilities from keyResponsibilities
   - At least 1 measurable achievement with numbers/percentages
   - Action verbs: developed, implemented, optimized, designed, built, created, managed, improved, reduced, increased

5. Do NOT include:
   - Generic responsibilities not in job analysis
   - Technologies not mentioned in job analysis
   - Vague achievements without metrics

Return only valid JSON with no additional text or markdown.
`;

      const systemMessage = isVietnamese
        ? "Bạn là chuyên gia viết CV chuyên nghiệp. Mỗi mục kinh nghiệm phải bao gồm công nghệ chính xác, trách nhiệm cụ thể từ job analysis, và thành tựu có thể đo lường với số liệu. Tránh mô tả chung chung. Luôn trả về JSON hợp lệ."
        : "You are a professional CV writer specializing in creating detailed, specific work experience entries. Each entry must include exact technologies, specific responsibilities from the job analysis, and measurable achievements with numbers. Avoid generic descriptions. Always return valid JSON only.";

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

      const workExperience = JSON.parse(response);

      // Ensure dates are in correct format
      workExperience.startDate = startDate.toISOString().split("T")[0];
      workExperience.endDate = endDate.toISOString().split("T")[0];

      return { experience: [workExperience], total_tokens: usage.total_tokens };
    } catch (error) {
      this.logger.error(
        `Error generating work experience: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Generate multiple skills section options with ratings using OpenAI
   */
  async generateSkillsSection(
    jobAnalysis: any = {},
    userSkills?: Array<{ name: string; rating: number }>
  ): Promise<{
    skillsOptions: Array<Array<{ name: string; rating: number }>>;
    total_tokens: number;
  }> {
    try {
      const safeAnalysis = jobAnalysis || {};
      const requiredSkills: string[] = Array.isArray(
        safeAnalysis.requiredSkills
      )
        ? safeAnalysis.requiredSkills
        : [];
      const technologies: string[] = Array.isArray(safeAnalysis.technologies)
        ? safeAnalysis.technologies
        : [];
      const softSkills: string[] = Array.isArray(safeAnalysis.softSkills)
        ? safeAnalysis.softSkills
        : [];
      const experienceLevel: string =
        safeAnalysis.experienceLevel || "Not specified";

      const existingSkills =
        userSkills?.map((s) => s.name).join(", ") || "None";

      const prompt = `
Generate 3 different skills section options for a CV based STRICTLY on the job analysis and existing user skills.

Job Analysis Details:
- Required Technical Skills: ${requiredSkills.join(", ") || "Not specified"}
- Technologies & Tools: ${technologies.join(", ") || "Not specified"}
- Soft Skills: ${softSkills.join(", ") || "Not specified"}
- Experience Level: ${experienceLevel}

Existing User Skills: ${existingSkills || "None"}

Each option should be a skills list in JSON format with ratings (1-5):
[
  {
    "name": "Skill Name",
    "rating": 4
  }
]

DETAILED STRICT Requirements:
1. Skills Selection:
   - ONLY include skills EXACTLY as mentioned in job analysis (requiredSkills, technologies, softSkills)
   - DO NOT add any skills NOT in the job analysis
   - DO NOT add generic soft skills (communication, teamwork) unless explicitly mentioned in job analysis
   - Include 6-12 skills per option (prioritize required skills first, then technologies, then soft skills if available)

2. Skill Names:
   - Use exact names from job analysis (case-sensitive)
   - Maintain proper capitalization (e.g., "JavaScript" not "javascript", "Node.js" not "nodejs")
   - For technologies, use standard names (e.g., "React" not "ReactJS", "PostgreSQL" not "Postgres")

3. Rating Guidelines (based on ${experienceLevel} level):
   - Junior (0-2 years):
     * Core required skills: 3-4 (Intermediate to Advanced)
     * Technologies: 2-3 (Elementary to Intermediate)
     * Soft skills: 3-4 (if mentioned)
   
   - Mid-level (3-5 years):
     * Core required skills: 4-5 (Advanced to Expert)
     * Technologies: 3-4 (Intermediate to Advanced)
     * Soft skills: 4 (if mentioned)
   
   - Senior (5+ years):
     * Core required skills: 4-5 (Advanced to Expert)
     * Technologies: 4-5 (Advanced to Expert)
     * Soft skills: 4-5 (if mentioned)

4. Rating Scale:
   - 1 = Beginner: Basic understanding, minimal experience
   - 2 = Elementary: Some experience, can work with guidance
   - 3 = Intermediate: Comfortable, can work independently
   - 4 = Advanced: Strong expertise, can mentor others
   - 5 = Expert: Deep knowledge, industry leader level

5. Option Variations:
   - Option 1: Focus on core required skills + primary technologies (8-10 skills)
   - Option 2: Include all required skills + technologies + soft skills if available (10-12 skills)
   - Option 3: Balanced mix with emphasis on most important skills (8-10 skills)

6. If user has existing skills, prioritize those skills but still only from job analysis

Return only a JSON array of 3 skills lists, e.g.:
[
  [ { "name": "JavaScript", "rating": 4 }, { "name": "Node.js", "rating": 4 }, ... ],
  [ { "name": "JavaScript", "rating": 5 }, { "name": "React", "rating": 4 }, ... ],
  [ { "name": "TypeScript", "rating": 4 }, { "name": "PostgreSQL", "rating": 4 }, ... ]
]
Do not include any explanation or markdown, only valid JSON.
`;

      const openai = this.openaiApiService.getOpenAI();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a professional CV writer specializing in creating precise skills sections. You must ONLY include skills exactly as mentioned in the job analysis. Rate skills appropriately based on experience level (junior=2-3, mid=3-4, senior=4-5). Use exact skill names with proper capitalization. Never add skills outside the job analysis. Always return a JSON array of exactly 3 different skills lists with varied focus.",
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

      // Danh sách skill hợp lệ rút ra từ JD
      const validSkills = [...requiredSkills, ...technologies, ...softSkills]
        .filter(Boolean)
        .map((s) => s.toLowerCase());

      function filterSkills(list: Array<{ name: string; rating: number }>) {
        if (!Array.isArray(list)) return [];

        // Nếu không có validSkills từ JD, trả về mảng rỗng
        if (validSkills.length === 0) {
          return [];
        }

        // Lọc theo JD - chỉ giữ lại skills khớp với JD
        const filtered = list.filter((skillObj) =>
          validSkills.includes((skillObj.name || "").toLowerCase())
        );

        // Gán lại rating nếu user có sẵn kỹ năng
        return filtered.map((skillObj) => {
          if (userSkills) {
            const found = userSkills.find(
              (s) =>
                s.name.toLowerCase() === (skillObj.name || "").toLowerCase()
            );
            if (found) {
              return { ...skillObj, rating: found.rating };
            }
          }
          return skillObj;
        });
      }
      if (Array.isArray(skillsLists) && skillsLists.length === 3) {
        return {
          skillsOptions: skillsLists.map(filterSkills),
          total_tokens: usage.total_tokens,
        };
      }

      throw new Error("Invalid response format: expected array of 3 skills lists");
    } catch (error) {
      this.logger.error(
        `Error generating skills section: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }
  /**
   * Generate CV content based on user profile and job analysis
   */
  async generateCvContent(
    user: any,
    jobAnalysis: any,
    additionalRequirements?: string
  ): Promise<any> {
      // Generate professional summary using OpenAI
    const summary = await this.generateProfessionalSummary(
      user,
      jobAnalysis,
      additionalRequirements
    );

    // Generate skills section using OpenAI
    const skills = await this.generateSkillsSection(jobAnalysis);

    // Generate work experience using OpenAI
    const workHistory = await this.generateWorkExperience(
      jobAnalysis,
      jobAnalysis.experienceLevel
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
        careerObjective: normalizedSummary,
        Project: [],
        certification: [],
        achievement: [],
        hobby: [],
        sectionPositions: {},
      },
      total_tokens:
        summary.total_tokens + skills.total_tokens + workHistory.total_tokens,
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
    targetLanguage: string
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
      const openai = this.openaiApiService.getOpenAI();
      const [contentResponse, uiTextResponse] = await Promise.all([
        openai.chat.completions.create({
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
        openai.chat.completions.create({
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
      const contentTokens = contentResponse.usage?.total_tokens ?? 0;
      const uiTextTokens = uiTextResponse.usage?.total_tokens ?? 0;

      const totalTokens = contentTokens + uiTextTokens;

      // ======= Xử lý phần uiTexts =======
      let uiTranslated = uiTextResponse.choices[0]?.message?.content?.trim();
      if (!uiTranslated)
        throw new Error("Empty response for uiTexts translation");

      uiTranslated = uiTranslated
        .replace(/^```json/, "")
        .replace(/^```/, "")
        .replace(/```$/, "")
        .trim();

      // Parse UI texts translation
      let translatedUiTexts: Record<string, string> = {};
      const parsed = JSON.parse(uiTranslated);
      if (typeof parsed === "object" && !Array.isArray(parsed)) {
        translatedUiTexts = parsed;
      } else {
        throw new Error("UI Texts translation is not a valid object");
      }

      return {
        success: true,
        data: {
          content: translatedContent,
          uiTexts: translatedUiTexts,
        },
        total_tokens: totalTokens,
      };
    } catch (error) {
      this.logger.error(
        `Error translating CV content: ${error.message}`,
        error.stack
      );
      throw new Error(`Translate failed: ${error.message}`);
    }
  }
}
