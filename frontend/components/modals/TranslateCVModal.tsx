"use client";

import { useLanguage } from "@/providers/global_provider";
import { Languages, Loader2, X } from "lucide-react";
import { useState } from "react";

interface TranslateCVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranslate: (targetLanguage: string) => Promise<void>;
  isTranslating?: boolean;
}

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
];

const translations = {
  en: {
    title: "Translate CV",
    subtitle: "Select target language for translation",
    translate: "Translate",
    cancel: "Cancel",
    translating: "Translating...",
  },
  vi: {
    title: "Dịch CV",
    subtitle: "Chọn ngôn ngữ đích để dịch",
    translate: "Dịch",
    cancel: "Hủy",
    translating: "Đang dịch...",
  },
};

export default function TranslateCVModal({
  isOpen,
  onClose,
  onTranslate,
  isTranslating = false,
}: TranslateCVModalProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");

  const handleTranslate = async () => {
    if (selectedLanguage) {
      await onTranslate(selectedLanguage);
      setSelectedLanguage("");
    }
  };

  const handleClose = () => {
    if (!isTranslating) {
      setSelectedLanguage("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Languages className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{t.title}</h3>
              <p className="text-sm text-gray-500">{t.subtitle}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isTranslating}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Language Selection */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                disabled={isTranslating}
                className={`p-3 rounded-lg border-2 transition-all duration-200 text-left disabled:opacity-50 ${
                  selectedLanguage === lang.code
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <div>
                    <div className="font-medium">{lang.name}</div>
                    <div className="text-xs text-gray-500 uppercase">{lang.code}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={isTranslating}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleTranslate}
            disabled={!selectedLanguage || isTranslating}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isTranslating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.translating}
              </>
            ) : (
              t.translate
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
