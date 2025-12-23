import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto';
import { Model, Types } from 'mongoose';
import { JobAnalysisService } from '../../cv/services/job-analysis.service';
import { OpenaiApiService } from '../../cv/services/openai-api.service';
import { AiInterviewSession } from '../schemas/ai-interview.schema';
import { InterviewQuestionPool } from '../schemas/interview-question-pool.schema';
// @ts-ignore: install @google-cloud/text-to-speech in runtime environment
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { detectLanguageSmart } from '../../cv/utils/language-detector';

export interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  expectedAnswer?: string;
  tips?: string[];
}

export interface InterviewFeedback {
  questionId: string;
  userAnswer: string;
  score: number; // 1-10
  feedback: string;
  suggestions: string[];
  strengths: string[];
  improvements: string[];
}

@Injectable()
export class AiInterviewService {
  private readonly logger = new Logger(AiInterviewService.name);
  private readonly ttsClient: TextToSpeechClient;

  constructor(
    @InjectModel(AiInterviewSession.name)
    private aiInterviewSessionModel: Model<AiInterviewSession>,
    @InjectModel(InterviewQuestionPool.name)
    private interviewQuestionPoolModel: Model<InterviewQuestionPool>,
    private readonly openaiApiService: OpenaiApiService,
    private readonly jobAnalysisService: JobAnalysisService
  ) {
    this.ttsClient = new TextToSpeechClient();
  }

  /**
   * Google Cloud Text-to-Speech
   */
  async synthesizeSpeech(params: {
    text: string;
    language?: string;
    voice?: string;
    speakingRate?: number;
    pitch?: number;
    audioEncoding?: 'MP3' | 'OGG_OPUS' | 'LINEAR16';
  }): Promise<string> {
    const {
      text,
      language = 'vi-VN',
      voice = 'vi-VN-Wavenet-A',
      speakingRate = 0.95,
      pitch = 0,
      audioEncoding = 'MP3',
    } = params;

    if (!text || !text.trim()) {
      throw new Error('Text is required for TTS');
    }

    try {
      const [response] = await this.ttsClient.synthesizeSpeech({
        input: { text },
        voice: {
          languageCode: language,
          name: voice,
        },
        audioConfig: {
          audioEncoding,
          speakingRate,
          pitch,
        },
      });

      if (!response.audioContent) {
        throw new Error('No audio content returned from Google TTS');
      }

      // Return base64 string
      const audioBase64 =
        typeof response.audioContent === 'string'
          ? response.audioContent
          : Buffer.from(response.audioContent).toString('base64');

      return audioBase64;
    } catch (error) {
      this.logger.error(`Google TTS failed: ${error.message}`, error.stack);
      throw new Error('Failed to synthesize speech');
    }
  }

  /**
   * Helper method to parse JSON response from OpenAI
   */
  private parseJsonResponse(response: string): any {
    if (!response || !response.trim()) {
      throw new Error('Empty response from OpenAI');
    }

    let cleanResponse = response.trim();
    
    // Remove markdown code blocks
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\s*/i, '').replace(/\s*```$/g, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/g, '');
    }
    
    // Try to extract JSON if response contains text before/after JSON
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanResponse = jsonMatch[0];
    }
    
    // Try to extract array JSON if object JSON not found
    if (!jsonMatch) {
      const arrayMatch = cleanResponse.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        cleanResponse = arrayMatch[0];
      }
    }
    
    try {
      return JSON.parse(cleanResponse);
    } catch (error) {
      this.logger.error(`Failed to parse JSON response. Raw response: ${response.substring(0, 500)}`);
      throw new Error(`Invalid JSON response from OpenAI: ${error.message}`);
    }
  }


  /**
   * Get language name for prompts
   */
  private getLanguageName(languageCode: string): string {
    const languageMap: { [key: string]: string } = {
      'vi-VN': 'Vietnamese (Tiếng Việt)',
      'en-US': 'English',
      'en-GB': 'English',
      'ja-JP': 'Japanese (日本語)',
      'ko-KR': 'Korean (한국어)',
      'zh-CN': 'Chinese (中文)',
      'fr-FR': 'French (Français)',
      'de-DE': 'German (Deutsch)',
      'es-ES': 'Spanish (Español)',
    };
    return languageMap[languageCode] || 'Vietnamese';
  }

  /**
   * Generate hash from job description for pool lookup (without difficulty)
   */
  private generateJobDescriptionHash(jobDescription: string): string {
    const normalized = jobDescription.toLowerCase().trim().replace(/\s+/g, ' ');
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  /**
   * Generate hash with difficulty for pool lookup
   */
  private generatePoolHash(jobDescription: string, difficulty: 'easy' | 'medium' | 'hard'): string {
    const baseHash = this.generateJobDescriptionHash(jobDescription);
    return crypto.createHash('sha256').update(`${baseHash}_${difficulty}`).digest('hex');
  }

  /**
   * Check pool for existing questions (check all difficulty levels)
   * Returns pool and difficulty if found, null otherwise
   */
  async findExistingPool(
    jobDescription: string,
    numberOfQuestions: number
  ): Promise<{ pool: InterviewQuestionPool; difficulty: 'easy' | 'medium' | 'hard' } | null> {
    // Try to find existing pool with any difficulty level
    const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
    
    for (const difficulty of difficulties) {
      const hash = this.generatePoolHash(jobDescription, difficulty);
      const pool = await this.interviewQuestionPoolModel.findOne({ 
        jobDescriptionHash: hash,
        difficulty 
      });

      if (pool && pool.questions.length >= numberOfQuestions) {
        this.logger.log(`Found existing pool with ${pool.questions.length} questions (difficulty: ${difficulty})`);
        return { pool, difficulty };
      }
    }

    return null;
  }

  /**
   * Get questions from pool or generate new ones and save to pool
   * Tối ưu: Check pool trước, chỉ determine difficulty khi không có pool
   */
  async getOrGenerateQuestions(
    jobDescription: string,
    numberOfQuestions: number,
    jobTitle?: string,
    companyName?: string,
    language: string = 'vi-VN'
  ): Promise<{
    questions: InterviewQuestion[];
    difficulty: 'easy' | 'medium' | 'hard';
    total_tokens: number;
  }> {
    // Bước 1: Check pool trước (không tốn token)
    const existingPool = await this.findExistingPool(jobDescription, numberOfQuestions);
    
    if (existingPool) {
      // Có pool rồi - dùng luôn, không cần gọi AI
      const { pool, difficulty } = existingPool;
      
      // Update usage stats
      pool.usageCount += 1;
      pool.lastUsedAt = new Date();
      await pool.save();

      // Return requested number of questions
      const questions = pool.questions.slice(0, numberOfQuestions).map(q => ({
        id: q.id,
        question: q.question,
        category: q.category,
        difficulty: q.difficulty,
        tips: q.tips || [],
        expectedAnswer: q.expectedAnswer
      }));

      this.logger.log(`✅ Using cached questions from pool (difficulty: ${difficulty}, saved ${pool.usageCount} tokens)`);
      return { questions, difficulty, total_tokens: 0 };
    }

    // Bước 2: Không có pool - phải generate mới (tốn token)
    this.logger.log(`⚠️ No pool found, generating new questions (will cost tokens)`);
    
    // Determine difficulty (tốn token lần đầu)
    const difficulty = await this.determineDifficulty(jobDescription);
    
    // Double-check pool sau khi determine difficulty (có thể request khác đã tạo)
    const doubleCheckPool = await this.findExistingPool(jobDescription, numberOfQuestions);
    if (doubleCheckPool) {
      this.logger.log(`✅ Pool found after difficulty determination (race condition handled)`);
      const { pool, difficulty: foundDifficulty } = doubleCheckPool;
      pool.usageCount += 1;
      pool.lastUsedAt = new Date();
      await pool.save();
      
      const questions = pool.questions.slice(0, numberOfQuestions).map(q => ({
        id: q.id,
        question: q.question,
        category: q.category,
        difficulty: q.difficulty,
        tips: q.tips || [],
        expectedAnswer: q.expectedAnswer
      }));
      
      return { questions, difficulty: foundDifficulty, total_tokens: 0 };
    }
    
    // Generate questions (tốn token)
    const questions = await this.generateInterviewQuestions(
      jobDescription,
      numberOfQuestions,
      difficulty,
      language
    );

    // Save to pool với upsert để tránh duplicate key error (race condition)
    const hash = this.generatePoolHash(jobDescription, difficulty);
    
    try {
      // Sử dụng findOneAndUpdate với upsert để tránh duplicate key
      // Note: $inc will set usageCount to 1 if document is new, or increment if existing
      const pool = await this.interviewQuestionPoolModel.findOneAndUpdate(
        { jobDescriptionHash: hash, difficulty },
        {
          $setOnInsert: {
            jobDescriptionHash: hash,
            jobDescription,
            jobTitle,
            companyName,
            difficulty,
            questions: questions.questions.map(q => ({
              id: q.id,
              question: q.question,
              category: q.category,
              difficulty: q.difficulty,
              tips: q.tips || [],
              expectedAnswer: q.expectedAnswer
            }))
          },
          $inc: { usageCount: 1 },
          $set: { lastUsedAt: new Date() }
        },
        { 
          upsert: true, 
          new: true,
          setDefaultsOnInsert: true
        }
      );

      this.logger.log(`💾 Saved ${questions.questions.length} questions to pool (difficulty: ${difficulty})`);
      return { questions: questions.questions, difficulty, total_tokens: questions.total_tokens };
    } catch (error) {
      // Nếu vẫn bị duplicate (race condition), load pool đã có
      if (error.code === 11000) {
        this.logger.warn(`Duplicate key detected, loading existing pool`);
        const existingPool = await this.interviewQuestionPoolModel.findOne({ 
          jobDescriptionHash: hash,
          difficulty 
        });
        
        if (existingPool) {
          existingPool.usageCount += 1;
          existingPool.lastUsedAt = new Date();
          await existingPool.save();
          
          const existingQuestions = existingPool.questions.slice(0, numberOfQuestions).map(q => ({
            id: q.id,
            question: q.question,
            category: q.category,
            difficulty: q.difficulty,
            tips: q.tips || [],
            expectedAnswer: q.expectedAnswer
          }));
          
          return { questions: existingQuestions, difficulty, total_tokens: 0 };
        }
      }
      throw error;
    }
  }

  /**
   * Tự động xác định độ khó của interview dựa trên job description
   */
  async determineDifficulty(jobDescription: string): Promise<'easy' | 'medium' | 'hard'> {
    try {
      const prompt = `Phân tích job description sau và xác định độ khó phỏng vấn phù hợp. BẮT BUỘC phải trả về JSON hợp lệ, không có text thêm trước hoặc sau JSON.

Job Description:
${jobDescription}

Xác định độ khó dựa trên:
1. Yêu cầu kinh nghiệm:
   - 0-2 năm hoặc Intern/Junior → easy
   - 3-5 năm hoặc Mid/Senior → medium
   - 5+ năm hoặc Lead/Manager → hard

2. Độ phức tạp kỹ năng:
   - Kỹ năng cơ bản, công nghệ phổ biến → easy
   - Kỹ năng trung bình, nhiều công nghệ → medium
   - Kỹ năng cao cấp, kiến trúc, leadership → hard

3. Trách nhiệm:
   - Thực hiện task đơn giản → easy
   - Phát triển tính năng, làm việc nhóm → medium
   - Thiết kế hệ thống, quản lý team → hard

QUAN TRỌNG: Chỉ trả về JSON, không có text giải thích thêm. Format bắt buộc:
{
  "difficulty": "easy" | "medium" | "hard",
  "reason": "Lý do ngắn gọn"
}`;

      const openai = this.openaiApiService.getOpenAI();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        response_format: { type: "json_object" }, // Force JSON output
      });
      const response = completion.choices[0]?.message?.content || '';
      
      if (!response) {
        throw new Error('Empty response from OpenAI');
      }
      
      const analysis = this.parseJsonResponse(response);
      
      // Validate the response structure
      if (!analysis.difficulty || !['easy', 'medium', 'hard'].includes(analysis.difficulty)) {
        throw new Error(`Invalid difficulty value: ${analysis.difficulty}`);
      }
      
      this.logger.log(`Determined difficulty: ${analysis.difficulty} - ${analysis.reason || 'N/A'}`);
      return analysis.difficulty;

    } catch (error) {
      this.logger.error(`Error determining difficulty: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Tạo session phỏng vấn mới
   * Tối ưu: Check pool trước, chỉ gọi AI khi không có pool
   */
  async createInterviewSession(
    userId: string,
    jobDescription: string,
    numberOfQuestions: number = 10,
    jobTitle?: string,
    companyName?: string
  ): Promise<{ session: AiInterviewSession; total_tokens: number }> {
    try {
      // Detect language from job description using AI
      const detectedLanguageResult = await detectLanguageSmart(jobDescription, this.openaiApiService, this.logger);
      const detectedLanguage =
        typeof detectedLanguageResult === 'string'
          ? detectedLanguageResult
          : detectedLanguageResult.language || 'vi-VN';
      const languageTokens =
        typeof detectedLanguageResult === 'string'
          ? 0
          : detectedLanguageResult.total_tokens || 0;
      this.logger.log(`Detected language: ${detectedLanguage} from job description`);

      // Lấy câu hỏi từ pool hoặc generate mới (tự động check pool trước)
      const { questions, difficulty, total_tokens } = await this.getOrGenerateQuestions(
        jobDescription,
        numberOfQuestions,
        jobTitle,
        companyName,
        detectedLanguage
      );

      // Tạo session mới
      const session = new this.aiInterviewSessionModel({
        userId: new Types.ObjectId(userId),
        jobDescription,
        jobTitle,
        companyName,
        questions,
        numberOfQuestions,
        difficulty,
        language: detectedLanguage,
        status: 'in-progress',
        currentQuestionIndex: 0,
        userAnswers: new Map(),
        feedbacks: [],
      });

      await session.save();
      this.logger.log(`Created interview session ${session._id} for user ${userId} with difficulty: ${difficulty}, language: ${detectedLanguage} (${questions.length} questions)`);
      
      return { session, total_tokens: total_tokens + languageTokens };
    } catch (error) {
      this.logger.error(`Error creating interview session: ${error.message}`, error.stack);
      throw new Error('Failed to create interview session');
    }
  }

  /**
   * Pre-generate questions cho job description (dùng để tạo trước, không tốn token khi user dùng)
   * Có thể gọi từ admin panel hoặc batch job
   */
  async preGenerateQuestions(
    jobDescription: string,
    numberOfQuestions: number = 10,
    jobTitle?: string,
    companyName?: string,
    difficulty?: 'easy' | 'medium' | 'hard'
  ): Promise<InterviewQuestionPool> {
    try {
      // Detect language from job description using AI
      const detectedLanguageResult = await detectLanguageSmart(jobDescription, this.openaiApiService, this.logger);
      const detectedLanguage =
        typeof detectedLanguageResult === 'string'
          ? detectedLanguageResult
          : detectedLanguageResult.language || 'vi-VN';
      this.logger.log(`Pre-generating questions with detected language: ${detectedLanguage}`);
      
      // Check xem đã có pool chưa
      const existingPool = await this.findExistingPool(jobDescription, numberOfQuestions);
      if (existingPool) {
        this.logger.log(`Pool already exists for this job description`);
        return existingPool.pool;
      }

      // Determine difficulty nếu chưa có
      const finalDifficulty = difficulty || await this.determineDifficulty(jobDescription);
      
      // Generate questions with detected language
      const questions = await this.generateInterviewQuestions(
        jobDescription,
        numberOfQuestions,
        finalDifficulty,
        detectedLanguage
      );

      // Save to pool với upsert để tránh duplicate key error
      const hash = this.generatePoolHash(jobDescription, finalDifficulty);

      const pool = await this.interviewQuestionPoolModel.findOneAndUpdate(
        { jobDescriptionHash: hash, difficulty: finalDifficulty },
        {
          $setOnInsert: {
            jobDescriptionHash: hash,
            jobDescription,
            jobTitle,
            companyName,
            difficulty: finalDifficulty,
            questions: questions.questions.map(q => ({
              id: q.id,
              question: q.question,
              category: q.category,
              difficulty: q.difficulty,
              tips: q.tips || [],
              expectedAnswer: q.expectedAnswer
            })),
            usageCount: 0,
            lastUsedAt: undefined
          }
        },
        { 
          upsert: true, 
          new: true,
          setDefaultsOnInsert: true
        }
      );

      this.logger.log(`Pre-generated ${questions.questions.length} questions for pool (difficulty: ${finalDifficulty})`);
      return pool;
    } catch (error) {
      this.logger.error(`Error pre-generating questions: ${error.message}`, error.stack);
      throw new Error('Failed to pre-generate questions');
    }
  }

  /**
   * Tạo câu hỏi phỏng vấn dựa trên job description
   */
  async generateInterviewQuestions(
    jobDescription: string,
    numberOfQuestions: number = 10,
    difficulty: 'easy' | 'medium' | 'hard',
    language: string = 'vi-VN'
  ): Promise<{ questions: InterviewQuestion[], total_tokens: number }> {
    try {
      // Phân tích job description để hiểu yêu cầu
      const jobAnalysis = await this.jobAnalysisService.analyzeJobDescription(jobDescription);
      
      const languageName = this.getLanguageName(language);
      
      // Create language-specific prompts
      const languagePrompts: { [key: string]: string } = {
        'vi-VN': `
Dựa trên job description sau, tạo ${numberOfQuestions} câu hỏi phỏng vấn phù hợp với mức độ ${difficulty}.

Job Description:
${jobDescription}

Phân tích job:
${JSON.stringify(jobAnalysis, null, 2)}

Yêu cầu:
1. Tạo câu hỏi đa dạng về: technical skills, behavioral, situational, company knowledge
2. Mức độ khó: ${difficulty}
3. Câu hỏi phải phù hợp với vị trí và yêu cầu công việc
4. Bao gồm cả câu hỏi mở và câu hỏi cụ thể
5. Mỗi câu hỏi cần có category và tips
6. TẤT CẢ câu hỏi phải được viết bằng tiếng Việt

QUAN TRỌNG: Chỉ trả về JSON, không có text giải thích thêm. Trả về JSON object với format:
{
  "questions": [
    {
      "question": "Câu hỏi phỏng vấn bằng tiếng Việt",
      "category": "technical|behavioral|situational|company",
      "difficulty": "${difficulty}",
      "tips": ["tip1", "tip2"]
    }
  ]
}
`,
        'en-US': `
Based on the following job description, create ${numberOfQuestions} interview questions appropriate for ${difficulty} level.

Job Description:
${jobDescription}

Job Analysis:
${JSON.stringify(jobAnalysis, null, 2)}

Requirements:
1. Create diverse questions about: technical skills, behavioral, situational, company knowledge
2. Difficulty level: ${difficulty}
3. Questions must be relevant to the position and job requirements
4. Include both open-ended and specific questions
5. Each question needs a category and tips
6. ALL questions must be written in English

IMPORTANT: Return only JSON, no additional explanatory text. Return JSON object with format:
{
  "questions": [
    {
      "question": "Interview question in English",
      "category": "technical|behavioral|situational|company",
      "difficulty": "${difficulty}",
      "tips": ["tip1", "tip2"]
    }
  ]
}
`,
        'ja-JP': `
以下の求人説明に基づいて、${difficulty}レベルの面接質問を${numberOfQuestions}個作成してください。

求人説明:
${jobDescription}

求人分析:
${JSON.stringify(jobAnalysis, null, 2)}

要件:
1. 技術スキル、行動、状況、会社知識について多様な質問を作成
2. 難易度レベル: ${difficulty}
3. 質問は職位と職務要件に関連している必要があります
4. オープンエンドの質問と具体的な質問の両方を含める
5. 各質問にはカテゴリとヒントが必要です
6. すべての質問は日本語で書く必要があります

重要: JSONのみを返し、追加の説明テキストは含めないでください。形式:
{
  "questions": [
    {
      "question": "日本語での面接質問",
      "category": "technical|behavioral|situational|company",
      "difficulty": "${difficulty}",
      "tips": ["tip1", "tip2"]
    }
  ]
}
`,
        'ko-KR': `
다음 채용 설명을 기반으로 ${difficulty} 수준에 적합한 면접 질문 ${numberOfQuestions}개를 작성하세요.

채용 설명:
${jobDescription}

채용 분석:
${JSON.stringify(jobAnalysis, null, 2)}

요구사항:
1. 기술 스킬, 행동, 상황, 회사 지식에 대한 다양한 질문 작성
2. 난이도: ${difficulty}
3. 질문은 직위 및 직무 요구사항과 관련되어야 함
4. 개방형 질문과 구체적인 질문 모두 포함
5. 각 질문에는 카테고리와 팁이 필요함
6. 모든 질문은 한국어로 작성해야 함

중요: JSON만 반환하고 추가 설명 텍스트는 포함하지 마세요. 형식:
{
  "questions": [
    {
      "question": "한국어로 된 면접 질문",
      "category": "technical|behavioral|situational|company",
      "difficulty": "${difficulty}",
      "tips": ["tip1", "tip2"]
    }
  ]
}
`,
        'zh-CN': `
根据以下职位描述，创建${numberOfQuestions}个适合${difficulty}级别的面试问题。

职位描述:
${jobDescription}

职位分析:
${JSON.stringify(jobAnalysis, null, 2)}

要求:
1. 创建关于技术技能、行为、情境、公司知识的多样化问题
2. 难度级别: ${difficulty}
3. 问题必须与职位和工作要求相关
4. 包括开放式问题和具体问题
5. 每个问题需要类别和提示
6. 所有问题必须用中文编写

重要: 仅返回JSON，不包含额外的解释文本。格式:
{
  "questions": [
    {
      "question": "中文面试问题",
      "category": "technical|behavioral|situational|company",
      "difficulty": "${difficulty}",
      "tips": ["tip1", "tip2"]
    }
  ]
}
`,
        'fr-FR': `
Basé sur la description de poste suivante, créez ${numberOfQuestions} questions d'entretien appropriées pour le niveau ${difficulty}.

Description du poste:
${jobDescription}

Analyse du poste:
${JSON.stringify(jobAnalysis, null, 2)}

Exigences:
1. Créer des questions diverses sur: compétences techniques, comportement, situation, connaissances de l'entreprise
2. Niveau de difficulté: ${difficulty}
3. Les questions doivent être pertinentes pour le poste et les exigences du travail
4. Inclure des questions ouvertes et spécifiques
5. Chaque question nécessite une catégorie et des conseils
6. TOUTES les questions doivent être écrites en français

IMPORTANT: Retournez uniquement JSON, sans texte explicatif supplémentaire. Format:
{
  "questions": [
    {
      "question": "Question d'entretien en français",
      "category": "technical|behavioral|situational|company",
      "difficulty": "${difficulty}",
      "tips": ["tip1", "tip2"]
    }
  ]
}
`,
        'de-DE': `
Basierend auf der folgenden Stellenbeschreibung erstellen Sie ${numberOfQuestions} Interview-Fragen für das Niveau ${difficulty}.

Stellenbeschreibung:
${jobDescription}

Stellenanalyse:
${JSON.stringify(jobAnalysis, null, 2)}

Anforderungen:
1. Erstellen Sie vielfältige Fragen zu: technischen Fähigkeiten, Verhalten, Situation, Unternehmenswissen
2. Schwierigkeitsgrad: ${difficulty}
3. Fragen müssen relevant für die Position und Arbeitsanforderungen sein
4. Sowohl offene als auch spezifische Fragen einschließen
5. Jede Frage benötigt eine Kategorie und Tipps
6. ALLE Fragen müssen auf Deutsch geschrieben werden

WICHTIG: Geben Sie nur JSON zurück, ohne zusätzlichen erklärenden Text. Format:
{
  "questions": [
    {
      "question": "Interview-Frage auf Deutsch",
      "category": "technical|behavioral|situational|company",
      "difficulty": "${difficulty}",
      "tips": ["tip1", "tip2"]
    }
  ]
}
`,
        'es-ES': `
Basado en la siguiente descripción del trabajo, cree ${numberOfQuestions} preguntas de entrevista apropiadas para el nivel ${difficulty}.

Descripción del trabajo:
${jobDescription}

Análisis del trabajo:
${JSON.stringify(jobAnalysis, null, 2)}

Requisitos:
1. Crear preguntas diversas sobre: habilidades técnicas, comportamiento, situacional, conocimiento de la empresa
2. Nivel de dificultad: ${difficulty}
3. Las preguntas deben ser relevantes para el puesto y los requisitos del trabajo
4. Incluir preguntas abiertas y específicas
5. Cada pregunta necesita una categoría y consejos
6. TODAS las preguntas deben estar escritas en español

IMPORTANTE: Devuelva solo JSON, sin texto explicativo adicional. Formato:
{
  "questions": [
    {
      "question": "Pregunta de entrevista en español",
      "category": "technical|behavioral|situational|company",
      "difficulty": "${difficulty}",
      "tips": ["tip1", "tip2"]
    }
  ]
}
`,
      };
      
      const prompt = languagePrompts[language] || languagePrompts['vi-VN'];

      const openai = this.openaiApiService.getOpenAI();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
        response_format: { type: "json_object" }, // Force JSON output
      });
      const response = completion.choices[0]?.message?.content || '';
      
      if (!response) {
        throw new Error('Empty response from OpenAI');
      }
      
      // Parse JSON response
      const parsedResponse = this.parseJsonResponse(response);
      // Handle both direct array and object with questions property
      const questionsData = Array.isArray(parsedResponse) 
        ? parsedResponse 
        : parsedResponse.questions || parsedResponse;
      
      // Tạo InterviewQuestion objects
      const questions: InterviewQuestion[] = questionsData.map((q: any, index: number) => ({
        id: `q_${Date.now()}_${index}`,
        question: q.question,
        category: q.category,
        difficulty: q.difficulty,
        tips: q.tips || []
      }));

      this.logger.log(`Generated ${questions.length} interview questions with difficulty: ${difficulty}`);
      return { questions: questions, total_tokens: completion.usage?.total_tokens || 0 };

    } catch (error) {
      this.logger.error(`Error generating interview questions: ${error.message}`, error.stack);
      throw new Error('Failed to generate interview questions');
    }
  }

  /**
   * Đánh giá câu trả lời của người dùng
   */
  async evaluateAnswer(
    question: InterviewQuestion,
    userAnswer: string,
    jobDescription: string,
    language: string = 'vi-VN'
  ): Promise<InterviewFeedback> {
    try {
      // Create language-specific evaluation prompts
      const languagePrompts: { [key: string]: string } = {
        'vi-VN': `
Đánh giá câu trả lời phỏng vấn của ứng viên:

Câu hỏi: ${question.question}
Câu trả lời của ứng viên: ${userAnswer}
Job Description: ${jobDescription}
Category: ${question.category}
Difficulty: ${question.difficulty}

QUAN TRỌNG: Chỉ trả về JSON, không có text giải thích thêm. TẤT CẢ nội dung phải bằng tiếng Việt. Trả về JSON với format:
{
  "score": 8,
  "feedback": "Đánh giá tổng quan về câu trả lời bằng tiếng Việt",
  "suggestions": ["Gợi ý cải thiện 1", "Gợi ý cải thiện 2"],
  "strengths": ["Điểm mạnh 1", "Điểm mạnh 2"],
  "improvements": ["Cần cải thiện 1", "Cần cải thiện 2"]
}

Tiêu chí đánh giá:
- Độ chính xác và phù hợp với câu hỏi
- Mức độ chi tiết và cụ thể
- Thể hiện kinh nghiệm và kỹ năng
- Cách trình bày logic và rõ ràng
- Phù hợp với yêu cầu công việc
`,
        'en-US': `
Evaluate the candidate's interview answer:

Question: ${question.question}
Candidate's Answer: ${userAnswer}
Job Description: ${jobDescription}
Category: ${question.category}
Difficulty: ${question.difficulty}

IMPORTANT: Return only JSON, no additional explanatory text. ALL content must be in English. Return JSON with format:
{
  "score": 8,
  "feedback": "Overall evaluation of the answer in English",
  "suggestions": ["Improvement suggestion 1", "Improvement suggestion 2"],
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Area to improve 1", "Area to improve 2"]
}

Evaluation criteria:
- Accuracy and relevance to the question
- Level of detail and specificity
- Demonstration of experience and skills
- Logical and clear presentation
- Alignment with job requirements
`,
        'ja-JP': `
候補者の面接回答を評価してください:

質問: ${question.question}
候補者の回答: ${userAnswer}
求人説明: ${jobDescription}
カテゴリ: ${question.category}
難易度: ${question.difficulty}

重要: JSONのみを返し、追加の説明テキストは含めないでください。すべてのコンテンツは日本語で記述する必要があります。形式:
{
  "score": 8,
  "feedback": "日本語での回答の全体的な評価",
  "suggestions": ["改善提案1", "改善提案2"],
  "strengths": ["強み1", "強み2"],
  "improvements": ["改善が必要な領域1", "改善が必要な領域2"]
}

評価基準:
- 質問に対する正確性と関連性
- 詳細度と具体性
- 経験とスキルの実証
- 論理的で明確な提示
- 職務要件との整合性
`,
        'ko-KR': `
후보자의 면접 답변을 평가하세요:

질문: ${question.question}
후보자의 답변: ${userAnswer}
채용 설명: ${jobDescription}
카테고리: ${question.category}
난이도: ${question.difficulty}

중요: JSON만 반환하고 추가 설명 텍스트는 포함하지 마세요. 모든 내용은 한국어로 작성해야 합니다. 형식:
{
  "score": 8,
  "feedback": "한국어로 된 답변에 대한 전반적인 평가",
  "suggestions": ["개선 제안 1", "개선 제안 2"],
  "strengths": ["강점 1", "강점 2"],
  "improvements": ["개선이 필요한 영역 1", "개선이 필요한 영역 2"]
}

평가 기준:
- 질문에 대한 정확성과 관련성
- 세부 수준과 구체성
- 경험과 기술의 입증
- 논리적이고 명확한 제시
- 직무 요구사항과의 일치
`,
        'zh-CN': `
评估候选人的面试回答:

问题: ${question.question}
候选人的回答: ${userAnswer}
职位描述: ${jobDescription}
类别: ${question.category}
难度: ${question.difficulty}

重要: 仅返回JSON，不包含额外的解释文本。所有内容必须用中文编写。格式:
{
  "score": 8,
  "feedback": "用中文对回答的总体评估",
  "suggestions": ["改进建议1", "改进建议2"],
  "strengths": ["优势1", "优势2"],
  "improvements": ["需要改进的领域1", "需要改进的领域2"]
}

评估标准:
- 对问题的准确性和相关性
- 详细程度和具体性
- 经验和技能的展示
- 逻辑清晰 presentation
- 与工作要求的匹配
`,
        'fr-FR': `
Évaluez la réponse d'entretien du candidat:

Question: ${question.question}
Réponse du candidat: ${userAnswer}
Description du poste: ${jobDescription}
Catégorie: ${question.category}
Difficulté: ${question.difficulty}

IMPORTANT: Retournez uniquement JSON, sans texte explicatif supplémentaire. TOUT le contenu doit être en français. Format:
{
  "score": 8,
  "feedback": "Évaluation globale de la réponse en français",
  "suggestions": ["Suggestion d'amélioration 1", "Suggestion d'amélioration 2"],
  "strengths": ["Point fort 1", "Point fort 2"],
  "improvements": ["Domaine à améliorer 1", "Domaine à améliorer 2"]
}

Critères d'évaluation:
- Exactitude et pertinence par rapport à la question
- Niveau de détail et spécificité
- Démonstration d'expérience et de compétences
- Présentation logique et claire
- Alignement avec les exigences du poste
`,
        'de-DE': `
Bewerten Sie die Interview-Antwort des Kandidaten:

Frage: ${question.question}
Antwort des Kandidaten: ${userAnswer}
Stellenbeschreibung: ${jobDescription}
Kategorie: ${question.category}
Schwierigkeit: ${question.difficulty}

WICHTIG: Geben Sie nur JSON zurück, ohne zusätzlichen erklärenden Text. ALLE Inhalte müssen auf Deutsch sein. Format:
{
  "score": 8,
  "feedback": "Gesamtbewertung der Antwort auf Deutsch",
  "suggestions": ["Verbesserungsvorschlag 1", "Verbesserungsvorschlag 2"],
  "strengths": ["Stärke 1", "Stärke 2"],
  "improvements": ["Verbesserungsbereich 1", "Verbesserungsbereich 2"]
}

Bewertungskriterien:
- Genauigkeit und Relevanz zur Frage
- Detaillierungsgrad und Spezifität
- Demonstration von Erfahrung und Fähigkeiten
- Logische und klare Präsentation
- Übereinstimmung mit den Arbeitsanforderungen
`,
        'es-ES': `
Evalúe la respuesta de la entrevista del candidato:

Pregunta: ${question.question}
Respuesta del candidato: ${userAnswer}
Descripción del trabajo: ${jobDescription}
Categoría: ${question.category}
Dificultad: ${question.difficulty}

IMPORTANTE: Devuelva solo JSON, sin texto explicativo adicional. TODO el contenido debe estar en español. Formato:
{
  "score": 8,
  "feedback": "Evaluación general de la respuesta en español",
  "suggestions": ["Sugerencia de mejora 1", "Sugerencia de mejora 2"],
  "strengths": ["Fortaleza 1", "Fortaleza 2"],
  "improvements": ["Área a mejorar 1", "Área a mejorar 2"]
}

Criterios de evaluación:
- Precisión y relevancia a la pregunta
- Nivel de detalle y especificidad
- Demostración de experiencia y habilidades
- Presentación lógica y clara
- Alineación con los requisitos del trabajo
`,
      };
      
      const prompt = languagePrompts[language] || languagePrompts['vi-VN'];

      const openai = this.openaiApiService.getOpenAI();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
        response_format: { type: "json_object" }, // Force JSON output
      });
      const response = completion.choices[0]?.message?.content || '';
      
      if (!response) {
        throw new Error('Empty response from OpenAI');
      }
      
      const evaluation = this.parseJsonResponse(response);

      return {
        questionId: question.id,
        userAnswer,
        score: evaluation.score,
        feedback: evaluation.feedback,
        suggestions: evaluation.suggestions,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements
      };

    } catch (error) {
      this.logger.error(`Error evaluating answer: ${error.message}`, error.stack);
      throw new Error('Failed to evaluate answer');
    }
  }

  /**
   * Lấy session theo ID
   */
  async getSessionById(sessionId: string, userId: string): Promise<AiInterviewSession> {
    const session = await this.aiInterviewSessionModel.findOne({
      _id: sessionId,
      userId: new Types.ObjectId(userId)
    });

    if (!session) {
      throw new NotFoundException('Interview session not found');
    }

    return session;
  }

  /**
   * Tạo lại session với cùng questions từ session cũ (Retake)
   */
  async retakeInterviewSession(
    userId: string,
    originalSessionId: string
  ): Promise<AiInterviewSession> {
    try {
      // Lấy session gốc
      const originalSession = await this.getSessionById(originalSessionId, userId);

      // Tạo session mới với cùng questions, job description, etc.
      const newSession = new this.aiInterviewSessionModel({
        userId: new Types.ObjectId(userId),
        jobDescription: originalSession.jobDescription,
        jobTitle: originalSession.jobTitle,
        companyName: originalSession.companyName,
        questions: originalSession.questions, // Sử dụng lại questions cũ
        numberOfQuestions: originalSession.numberOfQuestions,
        difficulty: originalSession.difficulty,
        language: originalSession.language,
        status: 'in-progress',
        currentQuestionIndex: 0,
        userAnswers: new Map(),
        feedbacks: [], // Reset feedbacks
      });

      await newSession.save();
      this.logger.log(`Retake interview session ${newSession._id} from original session ${originalSessionId} for user ${userId}`);
      
      return newSession;
    } catch (error) {
      this.logger.error(`Error retaking interview session: ${error.message}`, error.stack);
      throw new Error('Failed to retake interview session');
    }
  }

  /**
   * Submit câu trả lời và lưu feedback
   */
  async submitAnswer(
    sessionId: string,
    userId: string,
    questionId: string,
    answer: string
  ): Promise<InterviewFeedback> {
    const session = await this.getSessionById(sessionId, userId);
    
    // Tìm câu hỏi
    const question = session.questions.find(q => q.id === questionId);
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // Kiểm tra xem câu hỏi này đã được trả lời chưa
    const existingFeedback = session.feedbacks.find(f => f.questionId === questionId);
    if (existingFeedback) {
      this.logger.warn(`Question ${questionId} already answered, updating answer`);
      // Có thể cho phép update hoặc throw error, tùy business logic
    }

    // Đánh giá câu trả lời (sử dụng ngôn ngữ từ session)
    const language = session.language || 'vi-VN';
    const feedback = await this.evaluateAnswer(question, answer, session.jobDescription, language);

    // Lưu vào session
    session.userAnswers.set(questionId, answer);
    
    // Nếu đã có feedback cho câu này, update; nếu chưa thì push mới
    if (existingFeedback) {
      const feedbackIndex = session.feedbacks.findIndex(f => f.questionId === questionId);
      session.feedbacks[feedbackIndex] = {
        questionId: feedback.questionId,
        userAnswer: feedback.userAnswer,
        score: feedback.score,
        feedback: feedback.feedback,
        suggestions: feedback.suggestions,
        strengths: feedback.strengths,
        improvements: feedback.improvements,
        evaluatedAt: new Date()
      } as any;
    } else {
      session.feedbacks.push({
        questionId: feedback.questionId,
        userAnswer: feedback.userAnswer,
        score: feedback.score,
        feedback: feedback.feedback,
        suggestions: feedback.suggestions,
        strengths: feedback.strengths,
        improvements: feedback.improvements,
        evaluatedAt: new Date()
      } as any);
    }

    // Cập nhật currentQuestionIndex để track tiến độ
    const currentQuestionIndex = session.questions.findIndex(q => q.id === questionId);
    if (currentQuestionIndex !== -1 && currentQuestionIndex >= session.currentQuestionIndex) {
      // Chỉ update nếu đang trả lời câu hỏi hiện tại hoặc câu tiếp theo
      session.currentQuestionIndex = currentQuestionIndex + 1;
    }

    await session.save();
    
    return feedback;
  }

  /**
   * Hoàn thành session
   */
  async completeSession(sessionId: string, userId: string): Promise<AiInterviewSession> {
    const session = await this.getSessionById(sessionId, userId);

    // Tính điểm trung bình
    const scores = session.feedbacks.map(f => f.score);
    const averageScore = scores.length > 0 
      ? scores.reduce((a, b) => a + b, 0) / scores.length 
      : 0;

    // Tạo overall feedback
    const overallFeedback = await this.generateOverallFeedback(session);

    // Cập nhật session
    session.status = 'completed';
    session.completedAt = new Date();
    session.averageScore = averageScore;
    session.overallFeedback = overallFeedback;

    await session.save();

    return session;
  }

  /**
   * Lấy tất cả sessions của user
   */
  async getUserSessions(
    userId: string,
    status?: 'in-progress' | 'completed' | 'abandoned'
  ): Promise<AiInterviewSession[]> {
    const query: any = { userId: new Types.ObjectId(userId) };
    if (status) {
      query.status = status;
    }

    return this.aiInterviewSessionModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Lấy thống kê interview của user
   */
  async getUserStats(userId: string) {
    const sessions = await this.getUserSessions(userId);
    const completedSessions = sessions.filter(s => s.status === 'completed');
    
    const totalSessions = sessions.length;
    const completedCount = completedSessions.length;
    const averageScore = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + (s.averageScore || 0), 0) / completedSessions.length
      : 0;

    return {
      totalSessions,
      completedSessions: completedCount,
      inProgressSessions: sessions.filter(s => s.status === 'in-progress').length,
      averageScore: Math.round(averageScore * 10) / 10,
      recentSessions: sessions.slice(0, 5)
    };
  }

  /**
   * Tạo feedback tổng quan cho toàn bộ buổi phỏng vấn
   */
  async generateOverallFeedback(session: AiInterviewSession): Promise<string> {
    try {
      const language = session.language || 'vi-VN';
      const feedbackDetails = session.feedbacks.map(f => {
        const question = session.questions.find(q => q.id === f.questionId);
        return `
Question: ${question?.question || 'N/A'}
Category: ${question?.category || 'N/A'}
Score: ${f.score}/10
Feedback: ${f.feedback}
Strengths: ${f.strengths.join(', ')}
Improvements: ${f.improvements.join(', ')}
`;
      }).join('\n---\n');

      // Create language-specific prompts
      const languagePrompts: { [key: string]: string } = {
        'vi-VN': `
Tạo feedback tổng quan cho buổi phỏng vấn:

Job Description: ${session.jobDescription}
${session.jobTitle ? `Position: ${session.jobTitle}` : ''}
${session.companyName ? `Company: ${session.companyName}` : ''}
Difficulty Level: ${session.difficulty}
Số câu hỏi: ${session.questions.length}
Số câu đã trả lời: ${session.userAnswers.size}
Điểm trung bình: ${session.averageScore || 0}/10

Chi tiết feedback từng câu hỏi:
${feedbackDetails}

Hãy tạo feedback tổng quan chi tiết bằng tiếng Việt bao gồm:
1. Đánh giá tổng thể về hiệu suất phỏng vấn
2. Top 3 điểm mạnh nổi bật
3. Top 3 điểm cần cải thiện
4. Khuyến nghị cụ thể cho lần phỏng vấn thực tế
5. Lời khuyên về cách chuẩn bị tốt hơn
6. Đánh giá khả năng phù hợp với vị trí

Trả về feedback bằng tiếng Việt, chi tiết và mang tính xây dựng.
`,
        'en-US': `
Create overall feedback for the interview:

Job Description: ${session.jobDescription}
${session.jobTitle ? `Position: ${session.jobTitle}` : ''}
${session.companyName ? `Company: ${session.companyName}` : ''}
Difficulty Level: ${session.difficulty}
Number of questions: ${session.questions.length}
Questions answered: ${session.userAnswers.size}
Average score: ${session.averageScore || 0}/10

Feedback details for each question:
${feedbackDetails}

Create detailed overall feedback in English including:
1. Overall assessment of interview performance
2. Top 3 outstanding strengths
3. Top 3 areas for improvement
4. Specific recommendations for the actual interview
5. Advice on how to prepare better
6. Assessment of fit for the position

Return feedback in English, detailed and constructive.
`,
        'ja-JP': `
面接の全体的なフィードバックを作成してください:

求人説明: ${session.jobDescription}
${session.jobTitle ? `職位: ${session.jobTitle}` : ''}
${session.companyName ? `会社: ${session.companyName}` : ''}
難易度レベル: ${session.difficulty}
質問数: ${session.questions.length}
回答済み質問数: ${session.userAnswers.size}
平均スコア: ${session.averageScore || 0}/10

各質問のフィードバック詳細:
${feedbackDetails}

日本語で詳細な全体的なフィードバックを作成してください:
1. 面接パフォーマンスの全体的な評価
2. トップ3の優れた強み
3. トップ3の改善領域
4. 実際の面接のための具体的な推奨事項
5. より良い準備方法に関するアドバイス
6. 職位への適合性の評価

日本語で詳細で建設的なフィードバックを返してください。
`,
        'ko-KR': `
면접에 대한 전반적인 피드백을 작성하세요:

채용 설명: ${session.jobDescription}
${session.jobTitle ? `직위: ${session.jobTitle}` : ''}
${session.companyName ? `회사: ${session.companyName}` : ''}
난이도: ${session.difficulty}
질문 수: ${session.questions.length}
답변한 질문 수: ${session.userAnswers.size}
평균 점수: ${session.averageScore || 0}/10

각 질문에 대한 피드백 세부사항:
${feedbackDetails}

한국어로 상세한 전반적인 피드백을 작성하세요:
1. 면접 성과에 대한 전반적인 평가
2. 상위 3개의 뛰어난 강점
3. 상위 3개의 개선 영역
4. 실제 면접을 위한 구체적인 권장사항
5. 더 나은 준비 방법에 대한 조언
6. 직위에 대한 적합성 평가

한국어로 상세하고 건설적인 피드백을 반환하세요.
`,
        'zh-CN': `
创建面试的整体反馈:

职位描述: ${session.jobDescription}
${session.jobTitle ? `职位: ${session.jobTitle}` : ''}
${session.companyName ? `公司: ${session.companyName}` : ''}
难度级别: ${session.difficulty}
问题数量: ${session.questions.length}
已回答问题数: ${session.userAnswers.size}
平均分数: ${session.averageScore || 0}/10

每个问题的反馈详情:
${feedbackDetails}

用中文创建详细的整体反馈，包括:
1. 面试表现的整体评估
2. 前3个突出优势
3. 前3个需要改进的领域
4. 实际面试的具体建议
5. 如何更好地准备的建议
6. 对职位适合性的评估

用中文返回详细且建设性的反馈。
`,
        'fr-FR': `
Créez un retour global pour l'entretien:

Description du poste: ${session.jobDescription}
${session.jobTitle ? `Poste: ${session.jobTitle}` : ''}
${session.companyName ? `Entreprise: ${session.companyName}` : ''}
Niveau de difficulté: ${session.difficulty}
Nombre de questions: ${session.questions.length}
Questions répondues: ${session.userAnswers.size}
Score moyen: ${session.averageScore || 0}/10

Détails du retour pour chaque question:
${feedbackDetails}

Créez un retour global détaillé en français incluant:
1. Évaluation globale de la performance à l'entretien
2. Top 3 forces exceptionnelles
3. Top 3 domaines à améliorer
4. Recommandations spécifiques pour l'entretien réel
5. Conseils sur la meilleure façon de se préparer
6. Évaluation de l'adéquation au poste

Retournez un retour en français, détaillé et constructif.
`,
        'de-DE': `
Erstellen Sie ein Gesamt-Feedback für das Interview:

Stellenbeschreibung: ${session.jobDescription}
${session.jobTitle ? `Position: ${session.jobTitle}` : ''}
${session.companyName ? `Unternehmen: ${session.companyName}` : ''}
Schwierigkeitsgrad: ${session.difficulty}
Anzahl der Fragen: ${session.questions.length}
Beantwortete Fragen: ${session.userAnswers.size}
Durchschnittspunktzahl: ${session.averageScore || 0}/10

Feedback-Details für jede Frage:
${feedbackDetails}

Erstellen Sie ein detailliertes Gesamt-Feedback auf Deutsch, einschließlich:
1. Gesamtbewertung der Interview-Leistung
2. Top 3 herausragende Stärken
3. Top 3 Verbesserungsbereiche
4. Spezifische Empfehlungen für das tatsächliche Interview
5. Ratschläge zur besseren Vorbereitung
6. Bewertung der Eignung für die Position

Geben Sie ein detailliertes und konstruktives Feedback auf Deutsch zurück.
`,
        'es-ES': `
Cree una retroalimentación general para la entrevista:

Descripción del trabajo: ${session.jobDescription}
${session.jobTitle ? `Posición: ${session.jobTitle}` : ''}
${session.companyName ? `Empresa: ${session.companyName}` : ''}
Nivel de dificultad: ${session.difficulty}
Número de preguntas: ${session.questions.length}
Preguntas respondidas: ${session.userAnswers.size}
Puntuación promedio: ${session.averageScore || 0}/10

Detalles de retroalimentación para cada pregunta:
${feedbackDetails}

Cree una retroalimentación general detallada en español que incluya:
1. Evaluación general del rendimiento en la entrevista
2. Top 3 fortalezas destacadas
3. Top 3 áreas de mejora
4. Recomendaciones específicas para la entrevista real
5. Consejos sobre cómo prepararse mejor
6. Evaluación de la idoneidad para el puesto

Devuelva una retroalimentación en español, detallada y constructiva.
`,
      };
      
      const prompt = languagePrompts[language] || languagePrompts['vi-VN'];

      const openai = this.openaiApiService.getOpenAI();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
      });
      const response = completion.choices[0]?.message?.content || '';
      return response;

    } catch (error) {
      this.logger.error(`Error generating overall feedback: ${error.message}`, error.stack);
      throw new Error('Failed to generate overall feedback');
    }
  }

  /**
   * Tạo câu hỏi follow-up dựa trên câu trả lời
   */
  async generateFollowUpQuestion(
    originalQuestion: InterviewQuestion,
    userAnswer: string,
    jobDescription: string,
    language: string = 'vi-VN'
  ): Promise<string> {
    try {
      // Create language-specific prompts
      const languagePrompts: { [key: string]: string } = {
        'vi-VN': `
Dựa trên câu trả lời của ứng viên, tạo câu hỏi follow-up phù hợp:

Câu hỏi gốc: ${originalQuestion.question}
Câu trả lời: ${userAnswer}
Job Description: ${jobDescription}

Tạo 1 câu hỏi follow-up bằng tiếng Việt để:
- Làm sâu sắc thêm câu trả lời
- Kiểm tra hiểu biết chi tiết
- Đánh giá kinh nghiệm thực tế
- Phù hợp với category: ${originalQuestion.category}

Chỉ trả về câu hỏi bằng tiếng Việt, không cần giải thích.
`,
        'en-US': `
Based on the candidate's answer, create an appropriate follow-up question:

Original Question: ${originalQuestion.question}
Answer: ${userAnswer}
Job Description: ${jobDescription}

Create 1 follow-up question in English to:
- Deepen the answer
- Test detailed understanding
- Assess practical experience
- Match category: ${originalQuestion.category}

Return only the question in English, no explanation needed.
`,
        'ja-JP': `
候補者の回答に基づいて、適切なフォローアップ質問を作成してください:

元の質問: ${originalQuestion.question}
回答: ${userAnswer}
求人説明: ${jobDescription}

日本語で1つのフォローアップ質問を作成して:
- 回答を深める
- 詳細な理解をテストする
- 実践的な経験を評価する
- カテゴリに一致: ${originalQuestion.category}

日本語で質問のみを返してください。説明は不要です。
`,
        'ko-KR': `
후보자의 답변을 기반으로 적절한 후속 질문을 작성하세요:

원래 질문: ${originalQuestion.question}
답변: ${userAnswer}
채용 설명: ${jobDescription}

한국어로 1개의 후속 질문을 작성하여:
- 답변을 심화
- 상세한 이해 테스트
- 실무 경험 평가
- 카테고리 일치: ${originalQuestion.category}

한국어로 질문만 반환하세요. 설명은 필요 없습니다.
`,
        'zh-CN': `
根据候选人的回答，创建一个合适的后续问题:

原始问题: ${originalQuestion.question}
回答: ${userAnswer}
职位描述: ${jobDescription}

用中文创建1个后续问题以:
- 深化回答
- 测试详细理解
- 评估实践经验
- 匹配类别: ${originalQuestion.category}

仅返回中文问题，无需解释。
`,
        'fr-FR': `
Basé sur la réponse du candidat, créez une question de suivi appropriée:

Question originale: ${originalQuestion.question}
Réponse: ${userAnswer}
Description du poste: ${jobDescription}

Créez 1 question de suivi en français pour:
- Approfondir la réponse
- Tester la compréhension détaillée
- Évaluer l'expérience pratique
- Correspondre à la catégorie: ${originalQuestion.category}

Retournez uniquement la question en français, aucune explication nécessaire.
`,
        'de-DE': `
Basierend auf der Antwort des Kandidaten erstellen Sie eine passende Nachfrage:

Ursprüngliche Frage: ${originalQuestion.question}
Antwort: ${userAnswer}
Stellenbeschreibung: ${jobDescription}

Erstellen Sie 1 Nachfrage auf Deutsch, um:
- Die Antwort zu vertiefen
- Detailliertes Verständnis zu testen
- Praktische Erfahrung zu bewerten
- Zur Kategorie zu passen: ${originalQuestion.category}

Geben Sie nur die Frage auf Deutsch zurück, keine Erklärung erforderlich.
`,
        'es-ES': `
Basado en la respuesta del candidato, cree una pregunta de seguimiento apropiada:

Pregunta original: ${originalQuestion.question}
Respuesta: ${userAnswer}
Descripción del trabajo: ${jobDescription}

Cree 1 pregunta de seguimiento en español para:
- Profundizar la respuesta
- Probar la comprensión detallada
- Evaluar la experiencia práctica
- Coincidir con la categoría: ${originalQuestion.category}

Devuelva solo la pregunta en español, no se necesita explicación.
`,
      };
      
      const prompt = languagePrompts[language] || languagePrompts['vi-VN'];

      const openai = this.openaiApiService.getOpenAI();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
      });
      const response = completion.choices[0]?.message?.content || '';
      return response.trim();

    } catch (error) {
      this.logger.error(`Error generating follow-up question: ${error.message}`, error.stack);
      throw new Error('Failed to generate follow-up question');
    }
  }

  /**
   * Tạo gợi ý câu trả lời mẫu
   */
  async generateSampleAnswer(
    question: InterviewQuestion,
    jobDescription: string,
    language: string = 'vi-VN'
  ): Promise<string> {
    try {
      // Create language-specific prompts
      const languagePrompts: { [key: string]: string } = {
        'vi-VN': `
Tạo câu trả lời mẫu cho câu hỏi phỏng vấn:

Câu hỏi: ${question.question}
Category: ${question.category}
Job Description: ${jobDescription}

Tạo câu trả lời mẫu bằng tiếng Việt:
- Chuyên nghiệp và phù hợp
- Thể hiện kinh nghiệm và kỹ năng
- Cấu trúc rõ ràng (STAR method nếu phù hợp)
- Phù hợp với yêu cầu công việc
- Độ dài vừa phải (2-3 đoạn văn)

Chỉ trả về câu trả lời mẫu bằng tiếng Việt, không cần giải thích.
`,
        'en-US': `
Create a sample answer for the interview question:

Question: ${question.question}
Category: ${question.category}
Job Description: ${jobDescription}

Create a sample answer in English:
- Professional and appropriate
- Demonstrates experience and skills
- Clear structure (STAR method if applicable)
- Aligned with job requirements
- Appropriate length (2-3 paragraphs)

Return only the sample answer in English, no explanation needed.
`,
        'ja-JP': `
面接質問のサンプル回答を作成してください:

質問: ${question.question}
カテゴリ: ${question.category}
求人説明: ${jobDescription}

日本語でサンプル回答を作成:
- 専門的で適切
- 経験とスキルを示す
- 明確な構造（該当する場合はSTARメソッド）
- 職務要件に一致
- 適切な長さ（2-3段落）

日本語でサンプル回答のみを返してください。説明は不要です。
`,
        'ko-KR': `
면접 질문에 대한 샘플 답변을 작성하세요:

질문: ${question.question}
카테고리: ${question.category}
채용 설명: ${jobDescription}

한국어로 샘플 답변 작성:
- 전문적이고 적절함
- 경험과 기술 입증
- 명확한 구조 (해당되는 경우 STAR 방법)
- 직무 요구사항과 일치
- 적절한 길이 (2-3단락)

한국어로 샘플 답변만 반환하세요. 설명은 필요 없습니다.
`,
        'zh-CN': `
为面试问题创建示例答案:

问题: ${question.question}
类别: ${question.category}
职位描述: ${jobDescription}

用中文创建示例答案:
- 专业且合适
- 展示经验和技能
- 清晰的结构（如适用，使用STAR方法）
- 符合工作要求
- 适当长度（2-3段）

仅返回中文示例答案，无需解释。
`,
        'fr-FR': `
Créez une réponse d'exemple pour la question d'entretien:

Question: ${question.question}
Catégorie: ${question.category}
Description du poste: ${jobDescription}

Créez une réponse d'exemple en français:
- Professionnelle et appropriée
- Démontre l'expérience et les compétences
- Structure claire (méthode STAR si applicable)
- Alignée avec les exigences du poste
- Longueur appropriée (2-3 paragraphes)

Retournez uniquement la réponse d'exemple en français, aucune explication nécessaire.
`,
        'de-DE': `
Erstellen Sie eine Beispielantwort für die Interview-Frage:

Frage: ${question.question}
Kategorie: ${question.category}
Stellenbeschreibung: ${jobDescription}

Erstellen Sie eine Beispielantwort auf Deutsch:
- Professionell und angemessen
- Zeigt Erfahrung und Fähigkeiten
- Klare Struktur (STAR-Methode falls zutreffend)
- Ausgerichtet auf die Arbeitsanforderungen
- Angemessene Länge (2-3 Absätze)

Geben Sie nur die Beispielantwort auf Deutsch zurück, keine Erklärung erforderlich.
`,
        'es-ES': `
Cree una respuesta de ejemplo para la pregunta de la entrevista:

Pregunta: ${question.question}
Categoría: ${question.category}
Descripción del trabajo: ${jobDescription}

Cree una respuesta de ejemplo en español:
- Profesional y apropiada
- Demuestra experiencia y habilidades
- Estructura clara (método STAR si es aplicable)
- Alineada con los requisitos del trabajo
- Longitud apropiada (2-3 párrafos)

Devuelva solo la respuesta de ejemplo en español, no se necesita explicación.
`,
      };
      
      const prompt = languagePrompts[language] || languagePrompts['vi-VN'];

      const openai = this.openaiApiService.getOpenAI();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
      });
      const response = completion.choices[0]?.message?.content || '';
      return response.trim();

    } catch (error) {
      this.logger.error(`Error generating sample answer: ${error.message}`, error.stack);
      throw new Error('Failed to generate sample answer');
    }
  }
}
