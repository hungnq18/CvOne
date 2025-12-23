"use client";

import { useLanguage } from "@/providers/global_provider";
import { Languages, Loader2, X, Search, Check, Globe } from "lucide-react";
import { useState, useMemo } from "react";

interface TranslateCVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranslate: (targetLanguage: string) => Promise<void>;
  isTranslating?: boolean;
}

// Danh sách ngôn ngữ mở rộng
const languages = [
  { code: "en", name: "English", native: "English", flag: "🇺🇸" },
  { code: "vi", name: "Vietnamese", native: "Tiếng Việt", flag: "🇻🇳" },
  { code: "fr", name: "French", native: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", native: "Deutsch", flag: "🇩🇪" },
  { code: "es", name: "Spanish", native: "Español", flag: "🇪🇸" },
  { code: "it", name: "Italian", native: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", native: "Português", flag: "🇵🇹" },
  { code: "ru", name: "Russian", native: "Русский", flag: "🇷🇺" },
  { code: "ja", name: "Japanese", native: "日本語", flag: "🇯🇵" },
  { code: "zh", name: "Chinese", native: "中文", flag: "🇨🇳" },
  { code: "ko", name: "Korean", native: "한국어", flag: "🇰🇷" },
  { code: "th", name: "Thai", native: "ไทย", flag: "🇹🇭" },
  { code: "id", name: "Indonesian", native: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "ar", name: "Arabic", native: "العربية", flag: "🇸🇦" },
  { code: "hi", name: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { code: "tr", name: "Turkish", native: "Türkçe", flag: "🇹🇷" },
  { code: "nl", name: "Dutch", native: "Nederlands", flag: "🇳🇱" },
  { code: "pl", name: "Polish", native: "Polski", flag: "🇵🇱" },
];

const translations = {
  en: {
    title: "Translate CV",
    subtitle: "Choose a target language for your CV",
    search: "Search language...",
    translate: "Translate Now",
    cancel: "Cancel",
    translating: "Translating...",
    noResult: "No language found",
  },
  vi: {
    title: "Dịch Hồ Sơ",
    subtitle: "Chọn ngôn ngữ đích để chuyển đổi CV của bạn",
    search: "Tìm kiếm ngôn ngữ...",
    translate: "Dịch Ngay",
    cancel: "Đóng",
    translating: "Đang xử lý...",
    noResult: "Không tìm thấy ngôn ngữ",
  },
};

export default function TranslateCVModal({
  isOpen,
  onClose,
  onTranslate,
  isTranslating = false,
}: TranslateCVModalProps) {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;
  
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Lọc ngôn ngữ theo từ khóa tìm kiếm
  const filteredLanguages = useMemo(() => {
    return languages.filter(
      (lang) =>
        lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.native.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleTranslate = async () => {
    if (selectedLanguage) {
      await onTranslate(selectedLanguage);
      // Reset state sau khi dịch xong nếu cần
      // setSelectedLanguage(""); 
    }
  };

  const handleClose = () => {
    if (!isTranslating) {
      setSearchQuery("");
      setSelectedLanguage("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300">
      {/* Backdrop with Blur */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header - Xanh đen */}
        <div className="bg-slate-900 p-6 pb-8 text-white relative overflow-hidden">
          {/* Decorative Circle */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-start justify-between relative z-10">
            <div className="flex gap-4 items-center">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                <Globe className="h-6 w-6 text-blue-200" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">{t.title}</h3>
                <p className="text-sm text-slate-300 mt-1">{t.subtitle}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isTranslating}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search Bar - Tích hợp vào Header để đẹp hơn */}
          <div className="mt-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Body - Language List */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
          {filteredLanguages.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <Globe className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p>{t.noResult}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredLanguages.map((lang) => {
                const isSelected = selectedLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang.code)}
                    disabled={isTranslating}
                    className={`group relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left
                      ${
                        isSelected
                          ? "bg-slate-900 border-slate-900 shadow-md transform scale-[1.02]"
                          : "bg-white border-gray-200 hover:border-slate-300 hover:shadow-sm"
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    <span className="text-2xl shadow-sm rounded-sm overflow-hidden">{lang.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold text-sm truncate ${isSelected ? "text-white" : "text-gray-900"}`}>
                        {lang.name}
                      </div>
                      <div className={`text-xs truncate ${isSelected ? "text-slate-300" : "text-gray-500"}`}>
                        {lang.native}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute right-3 bg-blue-500 rounded-full p-1 animate-in zoom-in spin-in-180 duration-300">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-gray-100 flex gap-3">
          <button
            onClick={handleClose}
            disabled={isTranslating}
            className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleTranslate}
            disabled={!selectedLanguage || isTranslating}
            className="flex-[2] px-4 py-3 text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg shadow-slate-900/20 transition-all disabled:opacity-70 disabled:shadow-none flex items-center justify-center gap-2 active:scale-95"
          >
            {isTranslating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.translating}
              </>
            ) : (
              <>
                <Languages className="h-4 w-4" />
                {t.translate}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}