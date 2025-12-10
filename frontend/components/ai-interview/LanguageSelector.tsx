"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { LanguageCode } from '@/hooks/useLanguageDetection';
import { Check, Globe, Sparkles } from 'lucide-react';
import { useState } from 'react';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag?: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'vi-VN', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en-US', name: 'English (US)', nativeName: 'English', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', nativeName: 'English', flag: '🇬🇧' },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'zh-CN', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'fr-FR', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'es-ES', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
];

interface LanguageSelectorProps {
  selectedLanguage: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
  recommendedLanguage?: LanguageCode;
  showRecommendation?: boolean;
  compact?: boolean;
}

export default function LanguageSelector({
  selectedLanguage,
  onLanguageChange,
  recommendedLanguage,
  showRecommendation = true,
  compact = false,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedLang = LANGUAGES.find(l => l.code === selectedLanguage) || LANGUAGES[0];
  const recommendedLang = recommendedLanguage 
    ? LANGUAGES.find(l => l.code === recommendedLanguage)
    : null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          className="bg-white/90 backdrop-blur-sm border-white/30 hover:bg-white/95"
        >
          <Globe className="h-4 w-4 mr-2" />
          <span className="mr-1">{selectedLang.flag}</span>
          {!compact && (
            <span className="hidden sm:inline">{selectedLang.nativeName}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4">
          {showRecommendation && recommendedLang && recommendedLanguage !== selectedLanguage && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">
                  Recommended Language
                </span>
              </div>
              <p className="text-xs text-blue-700 mb-2">
                Based on the job description, we recommend using:
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{recommendedLang.flag}</span>
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      {recommendedLang.nativeName}
                    </p>
                    <p className="text-xs text-blue-600">
                      {recommendedLang.name}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    if (recommendedLanguage) {
                      onLanguageChange(recommendedLanguage);
                      setIsOpen(false);
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Use This
                </Button>
              </div>
            </div>
          )}
          
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2 px-1">
              Select Language:
            </p>
            <div className="max-h-64 overflow-y-auto space-y-1 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
              {LANGUAGES.map((lang) => {
                const isSelected = lang.code === selectedLanguage;
                const isRecommended = lang.code === recommendedLanguage;
                
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{lang.flag}</span>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">
                          {lang.nativeName}
                        </p>
                        <p className="text-xs text-gray-500">{lang.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isRecommended && !isSelected && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Recommended
                        </Badge>
                      )}
                      {isSelected && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

