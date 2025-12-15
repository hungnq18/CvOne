import { Logger } from '@nestjs/common';
import { OpenaiApiService } from '../services/openai-api.service';

const ALLOWED_CODES = ['vi-VN','en-US','en-GB','ja-JP','ko-KR','zh-CN','fr-FR','de-DE','es-ES'];

/**
 * Heuristic language detection (fast, offline, no cost)
 */
export function heuristicDetectLanguage(text: string): string {
  if (!text || text.trim().length < 3) {
    return 'en-US'; // Default to English for short/unknown
  }

  const lowered = text.toLowerCase();

  // Character/word patterns
  const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
  const chinesePattern = /[\u4e00-\u9fff]/;
  const japanesePattern = /[\u3040-\u309f\u30a0-\u30ff]/;
  const koreanPattern = /[\uac00-\ud7a3]/;
  const frenchPattern = /[àâäéèêëïîôùûüÿç]/i;
  const germanPattern = /[äöüßÄÖÜ]/i;
  const spanishPattern = /[áéíóúñüÁÉÍÓÚÑÜ]/i;

  // Word patterns
  const englishWords = /\b(the|is|are|and|or|but|in|on|at|to|for|of|with|by|we|you|they|this|that|these|those|experience|responsibilities|requirements|skills|engineer|developer)\b/i;
  const frenchWords = /\b(le|la|les|de|du|des|et|ou|est|sont|dans|pour|avec|par)\b/i;
  const germanWords = /\b(der|die|das|und|oder|ist|sind|in|für|mit|von)\b/i;
  const spanishWords = /\b(el|la|los|las|y|o|es|son|en|para|con|de)\b/i;

  // Counts
  const vietnameseCount = (text.match(vietnamesePattern) || []).length;
  const chineseCount = (text.match(chinesePattern) || []).length;
  const japaneseCount = (text.match(japanesePattern) || []).length;
  const koreanCount = (text.match(koreanPattern) || []).length;
  const frenchCount = (text.match(frenchPattern) || []).length;
  const germanCount = (text.match(germanPattern) || []).length;
  const spanishCount = (text.match(spanishPattern) || []).length;

  const englishWordCount = (lowered.match(englishWords) || []).length;
  const frenchWordCount = (lowered.match(frenchWords) || []).length;
  const germanWordCount = (lowered.match(germanWords) || []).length;
  const spanishWordCount = (lowered.match(spanishWords) || []).length;

  // ASCII ratio heuristic: if mostly ASCII and no diacritics -> likely English
  const asciiChars = (text.match(/[ -~]/g) || []).length; // printable ASCII
  const asciiRatio = text.length > 0 ? asciiChars / text.length : 1;

  if (vietnameseCount > 0) return 'vi-VN';
  if (chineseCount > 0) return 'zh-CN';
  if (japaneseCount > 0) return 'ja-JP';
  if (koreanCount > 0) return 'ko-KR';
  if (frenchCount > 0 || frenchWordCount > 2) return 'fr-FR';
  if (germanCount > 0 || germanWordCount > 2) return 'de-DE';
  if (spanishCount > 0 || spanishWordCount > 2) return 'es-ES';

  if (asciiRatio > 0.9 || englishWordCount >= 2 || (asciiRatio > 0.8 && englishWordCount >= 1)) {
    return 'en-US';
  }

  return 'en-US';
}

/**
 * AI-powered language detection with OpenAI (fallback to heuristic on error)
 */
export async function detectLanguageSmart(
  text: string,
  openaiApiService: OpenaiApiService,
  logger?: Logger,
): Promise<string> {
  const safeText = (text || '').trim();

  if (safeText.length < 3) {
    return heuristicDetectLanguage(safeText);
  }

  try {
    const openai = openaiApiService.getOpenAI();
    const prompt = `Detect language for this text. Respond ONLY with JSON {"languageCode":"<code>"} using one of: ${ALLOWED_CODES.join(', ')}.
If uncertain, choose the closest. Text: """${safeText.substring(0, 3000)}"""`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 20,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content || '';
    const parsed = JSON.parse(content);
    const code = parsed?.languageCode;
    if (code && ALLOWED_CODES.includes(code)) {
      return code;
    }
  } catch (err: any) {
    logger?.warn?.(`AI language detect failed, fallback heuristic: ${err.message}`);
  }

  return heuristicDetectLanguage(safeText);
}

