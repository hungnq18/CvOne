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

  // Detect từ text input
  const detectFromText = useCallback((text: string): LanguageCode => {
    if (!text || text.trim().length < 3) {
      return detectedLanguage; // Return current if text too short
    }

    // Simple heuristic detection
    const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
    const chinesePattern = /[\u4e00-\u9fff]/;
    const japanesePattern = /[\u3040-\u309f\u30a0-\u30ff]/;
    const koreanPattern = /[\uac00-\ud7a3]/;
    
    const vietnameseCount = (text.match(vietnamesePattern) || []).length;
    const chineseCount = (text.match(chinesePattern) || []).length;
    const japaneseCount = (text.match(japanesePattern) || []).length;
    const koreanCount = (text.match(koreanPattern) || []).length;
    
    // Check for English (common words)
    const englishWords = /\b(the|is|are|and|or|but|in|on|at|to|for|of|with|by)\b/i;
    const englishCount = (text.match(englishWords) || []).length;
    
    // Determine language based on patterns
    if (vietnameseCount > 0 && vietnameseCount > englishCount) {
      return 'vi-VN';
    } else if (chineseCount > 0) {
      return 'zh-CN';
    } else if (japaneseCount > 0) {
      return 'ja-JP';
    } else if (koreanCount > 0) {
      return 'ko-KR';
    } else if (englishCount > 2) {
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

