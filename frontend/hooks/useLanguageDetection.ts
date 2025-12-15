'use client';

import { useCallback, useEffect, useState } from 'react';

export type LanguageCode = 'vi-VN' | 'en-US' | 'en-GB' | 'ja-JP' | 'ko-KR' | 'zh-CN' | 'fr-FR' | 'de-DE' | 'es-ES';

export interface LanguageDetectionResult {
  detectedLanguage: LanguageCode;
  confidence: 'high' | 'medium' | 'low';
  source: 'browser' | 'text' | 'default';
}

/**
 * Hook để detect ngôn ngữ từ browser và text input
 */
export function useLanguageDetection() {
  const [detectedLanguage, setDetectedLanguage] = useState<LanguageCode>('vi-VN');
  const [detectionInfo, setDetectionInfo] = useState<LanguageDetectionResult>({
    detectedLanguage: 'vi-VN',
    confidence: 'medium',
    source: 'browser',
  });

  // Detect từ browser language
  useEffect(() => {
    const browserLang = navigator.language || (navigator as any).userLanguage || 'vi-VN';
    
    // Map browser language to speech API language codes
    let mappedLang: LanguageCode = 'vi-VN';
    let confidence: 'high' | 'medium' | 'low' = 'high';
    
    if (browserLang.startsWith('vi')) {
      mappedLang = 'vi-VN';
      confidence = 'high';
    } else if (browserLang.startsWith('en')) {
      mappedLang = browserLang.includes('GB') ? 'en-GB' : 'en-US';
      confidence = 'high';
    } else if (browserLang.startsWith('ja')) {
      mappedLang = 'ja-JP';
      confidence = 'high';
    } else if (browserLang.startsWith('ko')) {
      mappedLang = 'ko-KR';
      confidence = 'high';
    } else if (browserLang.startsWith('zh')) {
      mappedLang = 'zh-CN';
      confidence = 'high';
    } else if (browserLang.startsWith('fr')) {
      mappedLang = 'fr-FR';
      confidence = 'high';
    } else if (browserLang.startsWith('de')) {
      mappedLang = 'de-DE';
      confidence = 'high';
    } else if (browserLang.startsWith('es')) {
      mappedLang = 'es-ES';
      confidence = 'high';
    } else {
      // Default to Vietnamese if unknown
      mappedLang = 'vi-VN';
      confidence = 'low';
    }

    setDetectedLanguage(mappedLang);
    setDetectionInfo({
      detectedLanguage: mappedLang,
      confidence,
      source: 'browser',
    });
  }, []);

  // Detect từ text input - improved to handle mixed languages
  const detectFromText = useCallback((text: string): LanguageCode => {
    if (!text || text.trim().length < 3) {
      return detectedLanguage; // Return current if text too short
    }

    // Simple heuristic detection
    const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
    const vietnameseWords = /\b(của|và|với|cho|từ|về|trong|này|đó|được|sẽ|có|không|một|hai|ba|bạn|tôi|chúng|nó|họ|nhưng|nếu|khi|để|vì|nên|mà|đã|sẽ|đang|rất|nhiều|ít|hơn|nhất|tất cả|mỗi|mọi|nào|đâu|sao|thế nào|tại sao)\b/i;
    const chinesePattern = /[\u4e00-\u9fff]/;
    const japanesePattern = /[\u3040-\u309f\u30a0-\u30ff]/;
    const koreanPattern = /[\uac00-\ud7a3]/;
    
    const vietnameseCount = (text.match(vietnamesePattern) || []).length;
    const vietnameseWordCount = (text.match(vietnameseWords) || []).length;
    const chineseCount = (text.match(chinesePattern) || []).length;
    const japaneseCount = (text.match(japanesePattern) || []).length;
    const koreanCount = (text.match(koreanPattern) || []).length;
    
    // Check for English (common words - expanded list)
    const englishWords = /\b(the|is|are|and|or|but|in|on|at|to|for|of|with|by|this|that|these|those|was|were|been|have|has|had|do|does|did|will|would|should|could|can|may|might|what|when|where|why|how|which|who|whom|whose|about|above|across|after|against|along|among|around|before|behind|below|beneath|beside|between|beyond|during|except|inside|into|near|outside|over|through|throughout|under|until|upon|within|without)\b/i;
    const englishCount = (text.match(englishWords) || []).length;
    
    // Calculate total scores for each language
    const vietnameseScore = vietnameseCount * 2 + vietnameseWordCount * 3; // Weight Vietnamese more
    const englishScore = englishCount * 2;
    const chineseScore = chineseCount * 3;
    const japaneseScore = japaneseCount * 3;
    const koreanScore = koreanCount * 3;
    
    // Determine language based on highest score
    // For mixed languages, prefer the one with higher score
    if (vietnameseScore > 0 && vietnameseScore >= englishScore && vietnameseScore >= chineseScore && vietnameseScore >= japaneseScore && vietnameseScore >= koreanScore) {
      return 'vi-VN';
    } else if (chineseScore > 0 && chineseScore >= vietnameseScore && chineseScore >= englishScore && chineseScore >= japaneseScore && chineseScore >= koreanScore) {
      return 'zh-CN';
    } else if (japaneseScore > 0 && japaneseScore >= vietnameseScore && japaneseScore >= englishScore && japaneseScore >= chineseScore && japaneseScore >= koreanScore) {
      return 'ja-JP';
    } else if (koreanScore > 0 && koreanScore >= vietnameseScore && koreanScore >= englishScore && koreanScore >= chineseScore && koreanScore >= japaneseScore) {
      return 'ko-KR';
    } else if (englishScore > 2 || (englishScore > 0 && englishScore >= vietnameseScore)) {
      return 'en-US';
    }
    
    // Default to current detected language
    return detectedLanguage;
  }, [detectedLanguage]);

  // Update language based on text input
  const updateLanguageFromText = useCallback((text: string) => {
    const detected = detectFromText(text);
    if (detected !== detectedLanguage) {
      setDetectedLanguage(detected);
      setDetectionInfo({
        detectedLanguage: detected,
        confidence: 'medium',
        source: 'text',
      });
    }
  }, [detectedLanguage, detectFromText]);

  return {
    detectedLanguage,
    detectionInfo,
    detectFromText,
    updateLanguageFromText,
    setLanguage: (lang: LanguageCode) => {
      setDetectedLanguage(lang);
      setDetectionInfo({
        detectedLanguage: lang,
        confidence: 'high',
        source: 'default',
      });
    },
  };
}

