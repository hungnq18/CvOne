import { useEffect, useRef, useState } from "react";

interface WebSpeechToTextOptions {
  language?: string;
  languages?: string[]; // Multiple languages for mixed language support
  continuous?: boolean;
  interimResults?: boolean;
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onStop?: () => void;
  onLanguageDetected?: (language: string) => void; // Callback when language is detected from transcript
  autoSwitchLanguage?: boolean; // Auto switch recognition language based on transcript
  minConfidence?: number; // Minimum confidence threshold (0-1), default 0.5
  enableAudioConstraints?: boolean; // Enable better audio quality constraints
  enableTextNormalization?: boolean; // Enable text normalization and punctuation correction
}

interface WebSpeechToTextResult {
  isRecording: boolean;
  transcript: string; // Full transcript (final + interim)
  finalTranscript: string; // Only final (confirmed) transcript
  interimTranscript: string; // Only interim (temporary) transcript
  isSupported: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  setLanguage: (language: string | string[]) => void;
  resetTranscript: () => void;
  error: string | null;
  currentLanguage: string; // Current recognition language
}

/**
 * Hook sử dụng Web Speech API (miễn phí, không cần server)
 * Hoạt động hoàn toàn trên browser, không tốn chi phí
 *
 * @example
 * ```tsx
 * const { isRecording, transcript, startRecording, stopRecording } = useWebSpeechToText({
 *   language: 'vi-VN',
 *   onTranscript: (text) => setAnswer(text)
 * });
 * ```
 */
export function useWebSpeechToText(
  options: WebSpeechToTextOptions = {}
): WebSpeechToTextResult {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState(""); // Full transcript
  const [finalTranscript, setFinalTranscript] = useState(""); // Only final transcript
  const [interimTranscript, setInterimTranscript] = useState(""); // Only interim transcript
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef<string>("");
  const pendingStopRef = useRef<boolean>(false);
  const currentLanguageRef = useRef<string>("");
  const languageSwitchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRecordingRef = useRef<boolean>(false); // Track recording state with ref for auto-switch
  const minConfidence = options.minConfidence ?? 0.5; // Default minimum confidence threshold

  useEffect(() => {
    // Kiểm tra browser support
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError(
        "Trình duyệt của bạn không hỗ trợ Web Speech API. Vui lòng sử dụng Chrome, Edge, hoặc Safari."
      );
      return;
    }

    setIsSupported(true);

    // Tạo SpeechRecognition instance
    const recognition = new SpeechRecognition();
    recognition.continuous = options.continuous ?? true;
    recognition.interimResults = options.interimResults ?? true;

    // Note: Web Speech API manages its own audio stream
    // Audio quality improvements are handled by the browser's implementation
    // For better accuracy, users should:
    // 1. Use a good quality microphone
    // 2. Speak clearly in a quiet environment
    // 3. Ensure stable internet connection (for cloud-based recognition)

    // Set language: support multiple languages if provided, otherwise use single language
    const primaryLanguage = options.language || "vi-VN";
    if (options.languages && options.languages.length > 0) {
      // Try to set multiple languages (some browsers support comma-separated list)
      // Format: "vi-VN,en-US" or ["vi-VN", "en-US"]
      try {
        recognition.lang = options.languages.join(",");
      } catch (e) {
        // Fallback to primary language if multiple languages not supported
        recognition.lang = primaryLanguage;
      }
    } else {
      recognition.lang = primaryLanguage;
    }

    currentLanguageRef.current = recognition.lang;
    recognitionRef.current = recognition;

    // Helper function to normalize and correct text
    const normalizeText = (text: string): string => {
      if (!options.enableTextNormalization) return text;

      let normalized = text.trim();

      // Fix common spacing issues
      normalized = normalized.replace(/\s+/g, " "); // Multiple spaces to single
      normalized = normalized.replace(/\s+([.,!?;:])/g, "$1"); // Remove space before punctuation
      normalized = normalized.replace(/([.,!?;:])([^\s])/g, "$1 $2"); // Add space after punctuation

      // Fix common Vietnamese diacritics issues (if any)
      // This is a basic example - can be expanded

      // Capitalize first letter of sentences
      normalized = normalized.replace(/(^|\.\s+)([a-z])/g, (match, p1, p2) => {
        return p1 + p2.toUpperCase();
      });

      return normalized;
    };

    // Helper function to detect language from text
    const detectLanguageFromText = (text: string): string | null => {
      if (!text || text.trim().length < 3) return null;

      // Vietnamese characters (with diacritics)
      const vietnamesePattern =
        /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
      const vietnameseWords =
        /\b(của|và|với|cho|từ|về|trong|này|đó|được|sẽ|có|không|một|hai|ba|bạn|tôi|chúng|nó|họ)\b/i;

      // English common words
      const englishWords =
        /\b(the|is|are|and|or|but|in|on|at|to|for|of|with|by|this|that|these|those|was|were|been|have|has|had|do|does|did|will|would|should|could|can|may|might)\b/i;

      // Chinese characters
      const chinesePattern = /[\u4e00-\u9fff]/;

      // Japanese characters
      const japanesePattern = /[\u3040-\u309f\u30a0-\u30ff]/;

      // Korean characters
      const koreanPattern = /[\uac00-\ud7a3]/;

      const vietnameseCount = (text.match(vietnamesePattern) || []).length;
      const vietnameseWordCount = (text.match(vietnameseWords) || []).length;
      const englishCount = (text.match(englishWords) || []).length;
      const chineseCount = (text.match(chinesePattern) || []).length;
      const japaneseCount = (text.match(japanesePattern) || []).length;
      const koreanCount = (text.match(koreanPattern) || []).length;

      // Determine dominant language
      if (vietnameseCount > 0 || vietnameseWordCount > 2) {
        return "vi-VN";
      } else if (chineseCount > 0) {
        return "zh-CN";
      } else if (japaneseCount > 0) {
        return "ja-JP";
      } else if (koreanCount > 0) {
        return "ko-KR";
      } else if (englishCount > 2) {
        return "en-US";
      }

      return null;
    };

    // Xử lý kết quả
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const alternative = result[0];
        const transcript = alternative.transcript;
        const confidence = alternative.confidence || 1.0; // Default to 1.0 if confidence not available

        // Filter out low confidence results (only for final results)
        if (result.isFinal) {
          // Only accept final results with sufficient confidence
          if (confidence >= minConfidence) {
            finalTranscript += transcript + " ";
          } else {
            // console.warn(
            //   `Low confidence result filtered: ${transcript} (confidence: ${confidence})`
            // );
            // Still add it but mark as low confidence - user can see and correct
            finalTranscript += transcript + " ";
          }
        } else {
          // Always show interim results (they update in real-time)
          interimTranscript += transcript;
        }
      }

      // Auto-switch language if enabled and we detect a different language
      if (
        options.autoSwitchLanguage &&
        recognitionRef.current &&
        isRecordingRef.current
      ) {
        const fullText = (
          finalTranscriptRef.current +
          " " +
          finalTranscript +
          " " +
          interimTranscript
        ).trim();
        if (fullText.length > 10) {
          // Only switch if we have enough text
          const detectedLang = detectLanguageFromText(fullText);
          // Check if detected language is different from current (handle both single and multiple language formats)
          const currentLang = currentLanguageRef.current.split(",")[0]; // Get primary language
          if (detectedLang && detectedLang !== currentLang) {
            // Debounce language switching to avoid too frequent changes
            if (languageSwitchTimeoutRef.current) {
              clearTimeout(languageSwitchTimeoutRef.current);
            }

            languageSwitchTimeoutRef.current = setTimeout(() => {
              if (recognitionRef.current && isRecordingRef.current) {
                try {
                  // Update language without stopping (better UX)
                  const newLang = detectedLang;
                  currentLanguageRef.current = newLang;
                  recognitionRef.current.lang = newLang;

                  // Notify about language change
                  if (options.onLanguageDetected) {
                    options.onLanguageDetected(newLang);
                  }
                } catch (e) {}
              }
            }, 1500); // Wait 1.5 seconds before switching to avoid too frequent changes
          }
        }
      }

      // Cập nhật transcript
      if (finalTranscript) {
        finalTranscriptRef.current += finalTranscript + " ";
        const normalizedFinal = options.enableTextNormalization
          ? normalizeText(finalTranscriptRef.current.trim())
          : finalTranscriptRef.current.trim();
        setFinalTranscript(normalizedFinal);

        // Update full transcript with final + interim
        const fullTranscript =
          normalizedFinal + (interimTranscript ? " " + interimTranscript : "");
        const normalizedFull = options.enableTextNormalization
          ? normalizeText(fullTranscript)
          : fullTranscript;
        setTranscript(normalizedFull.trim());

        // Clear interim when we get final results
        setInterimTranscript("");

        // Gọi callback với final transcript (normalized)
        if (options.onTranscript) {
          options.onTranscript(normalizedFinal, true);
        }
      } else if (interimTranscript) {
        const normalizedInterim = options.enableTextNormalization
          ? normalizeText(interimTranscript)
          : interimTranscript;
        setInterimTranscript(normalizedInterim);

        // Update full transcript with final + interim
        const fullTranscript =
          finalTranscriptRef.current.trim() + " " + normalizedInterim;
        const normalizedFull = options.enableTextNormalization
          ? normalizeText(fullTranscript)
          : fullTranscript;
        setTranscript(normalizedFull.trim());

        // Gọi callback với interim transcript (normalized)
        if (options.onTranscript) {
          options.onTranscript(normalizedFull.trim(), false);
        }
      }
    };

    // Xử lý lỗi
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = "Lỗi nhận dạng giọng nói";

      switch (event.error) {
        case "no-speech":
          errorMessage = "Không phát hiện giọng nói. Vui lòng thử lại.";
          break;
        case "audio-capture":
          errorMessage =
            "Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.";
          break;
        case "not-allowed":
          errorMessage =
            "Quyền truy cập microphone bị từ chối. Vui lòng cấp quyền trong cài đặt trình duyệt.";
          break;
        case "network":
          errorMessage =
            "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.";
          break;
        case "aborted":
          // Người dùng dừng, không cần hiển thị lỗi
          return;
        default:
          errorMessage = `Lỗi: ${event.error}`;
      }

      setError(errorMessage);
      if (options.onError) {
        options.onError(errorMessage);
      }
    };

    // Khi bắt đầu
    recognition.onstart = () => {
      setIsRecording(true);
      isRecordingRef.current = true;
      setError(null);
      // Nếu người dùng đã yêu cầu dừng trước khi recognition kịp start
      if (pendingStopRef.current && recognitionRef.current) {
        pendingStopRef.current = false;
        try {
          recognitionRef.current.stop();
        } catch (error: any) {
          setError(error.message || "Không thể dừng ghi âm");
        }
      }
      if (options.onStart) {
        options.onStart();
      }
    };

    // Khi kết thúc
    recognition.onend = () => {
      setIsRecording(false);
      isRecordingRef.current = false;
      // Update transcript state với final transcript khi recording kết thúc
      const finalText = finalTranscriptRef.current.trim();
      const normalizedFinal = options.enableTextNormalization
        ? normalizeText(finalText)
        : finalText;
      setFinalTranscript(normalizedFinal);
      setInterimTranscript(""); // Clear interim when recording ends
      setTranscript(normalizedFinal);
      if (options.onStop) {
        options.onStop();
      }
    };

    // Cleanup
    return () => {
      if (languageSwitchTimeoutRef.current) {
        clearTimeout(languageSwitchTimeoutRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors khi cleanup
        }
      }
    };
  }, [
    options.continuous,
    options.interimResults,
    options.language,
    options.languages,
    options.autoSwitchLanguage,
  ]);

  // Update language when it changes (if not currently recording)
  useEffect(() => {
    if (recognitionRef.current && !isRecording) {
      if (options.languages && options.languages.length > 0) {
        try {
          recognitionRef.current.lang = options.languages.join(",");
          currentLanguageRef.current = recognitionRef.current.lang;
        } catch (e) {
          // Fallback to primary language
          if (options.language) {
            recognitionRef.current.lang = options.language;
            currentLanguageRef.current = options.language;
          }
        }
      } else if (options.language) {
        recognitionRef.current.lang = options.language;
        currentLanguageRef.current = options.language;
      }
    }
  }, [options.language, options.languages, isRecording]);

  const startRecording = () => {
    if (!isSupported) {
      setError("Web Speech API không được hỗ trợ trên trình duyệt này");
      return;
    }

    if (recognitionRef.current && !isRecording && !isRecordingRef.current) {
      try {
        // Only keep existing transcript if it's not empty (user continuing to record for same question)
        // If transcript is empty, start fresh (new question)
        if (transcript.trim()) {
          finalTranscriptRef.current = transcript;
        } else {
          finalTranscriptRef.current = "";
        }
        recognitionRef.current.start();
      } catch (error: any) {
        setError(error.message || "Không thể bắt đầu ghi âm");
        if (options.onError) {
          options.onError(error.message || "Không thể bắt đầu ghi âm");
        }
      }
    }
  };

  const stopRecording = () => {
    if (!recognitionRef.current) return;

    if (isRecording || isRecordingRef.current) {
      try {
        // Clear language switch timeout if exists
        if (languageSwitchTimeoutRef.current) {
          clearTimeout(languageSwitchTimeoutRef.current);
          languageSwitchTimeoutRef.current = null;
        }
        recognitionRef.current.stop();
      } catch (error: any) {
        // Nếu stop thất bại (ví dụ chưa start hoàn toàn), fallback sang abort
        try {
          recognitionRef.current.abort();
        } catch {
          pendingStopRef.current = true;
        }
        setError(error.message || "Không thể dừng ghi âm");
      }
    } else {
      // Nếu ghi âm chưa start hoàn toàn nhưng người dùng đã thả nút, ghi nhận để stop ngay khi start
      pendingStopRef.current = true;
    }
  };

  const setLanguage = (language: string | string[]) => {
    if (recognitionRef.current && !isRecording) {
      if (Array.isArray(language)) {
        try {
          recognitionRef.current.lang = language.join(",");
          currentLanguageRef.current = recognitionRef.current.lang;
        } catch (e) {
          // Fallback to first language
          recognitionRef.current.lang = language[0] || "vi-VN";
          currentLanguageRef.current = recognitionRef.current.lang;
        }
      } else {
        recognitionRef.current.lang = language;
        currentLanguageRef.current = language;
      }
    }
  };

  const resetTranscript = () => {
    // Reset transcript state and ref when moving to new question
    setTranscript("");
    setFinalTranscript("");
    setInterimTranscript("");
    finalTranscriptRef.current = "";
  };

  return {
    isRecording,
    transcript, // Full transcript (final + interim)
    finalTranscript, // Only final (confirmed) transcript
    interimTranscript, // Only interim (temporary) transcript
    isSupported,
    startRecording,
    stopRecording,
    setLanguage,
    resetTranscript,
    error,
    currentLanguage: currentLanguageRef.current,
  };
}

// Type definitions cho Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onstart: () => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}
