"use client";

import {
  aiInterviewApi,
  InterviewFeedback,
  InterviewSession,
} from "@/api/aiInterviewApi";
import { FeedbackPopup } from "@/components/modals/feedbackPopup";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  LanguageCode,
  useLanguageDetection,
} from "@/hooks/useLanguageDetection";
import { useWebSpeechToText } from "@/hooks/useWebSpeechToText";
import { notify } from "@/lib/notify";
import { useLanguage } from "@/providers/global_provider";
import {
  Bot,
  Clock,
  Globe,
  Maximize2,
  Mic,
  Minimize2,
  Send,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import InterviewSummaryPopup from "./InterviewSummaryPopup";
import LanguageSelector from "./LanguageSelector";

interface AiInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobDescription: string;
  jobTitle?: string;
  companyName?: string;
  numberOfQuestions?: number;
  sessionData?: InterviewSession; // Session data từ retake (optional)
}

const modalTexts = {
  en: {
    loading: {
      title: "Preparing Your Interview Room",
      desc: "AI is analyzing the job description and generating personalized questions...",
      analyzing: "Analyzing job requirements",
      determining: "Determining difficulty level",
      generating: "Generating interview questions...",
    },
    header: {
      title: "Live Interview Session",
      difficulty: "Difficulty",
      exitFullscreen: "Exit Fullscreen",
      enterFullscreen: "Enter Fullscreen",
    },
    progress: {
      progress: "Progress",
      questions: "questions",
      answered: "answered",
    },
    feedback: {
      thankYou: "Thank you for your answer! Your score:",
      score: "Score",
      strengths: "Strengths:",
      improvements: "Need improvement:",
      nextQuestion: "Next question →",
    },
    input: {
      placeholder: "Type your answer here...",
      placeholderWait: "Please wait for the question to finish displaying...",
      waitMessage: "⏳ Displaying question, please wait...",
      recording: "🎤 Recording",
      transcript: "Transcript:",
      listening: "Listening... Please speak into the microphone",
      error: "Error:",
      recordingError: "Recording error:",
      helpText:
        "Press Ctrl + Enter to send • Click mic icon to start/stop recording • Select language for speech/text input",
      waitTitle: "Please wait for the question to finish displaying",
      stopRecording: "Click to stop recording",
      startRecording: "Click to start recording",
      languageSwitched: "Language auto-switched to",
      finalText: "Confirmed",
      interimText: "Recognizing...",
      editHint: "You can edit the text above if needed",
      missingViVoice:
        "Vietnamese voice not available on this browser. We'll use English voice to read. Please try Edge or install a Vietnamese voice on your system.",
    },
    complete: {
      title: "All questions completed! 🎉",
      desc: "You have answered all {count} questions. Click the button below to complete the interview and see overall results.",
      button: "Complete Interview",
      completing: "Completing...",
    },
    welcome:
      "Hello! 👋\n\nNice to meet you today! I'm AI Interviewer, and I'll accompany you in the interview for the position of {jobTitle}{company}.\n\nDon't worry, just relax and answer naturally! I will ask you {totalQuestions} questions to understand you better. Good luck! 🍀",
    welcomeDefault: "this position",
    welcomeCompany: " at {companyName}",
    notify: {
      submitError: "Failed to submit answer. Please try again.",
      sessionError: "Failed to create interview session. Please try again.",
      completeSuccess:
        "🎉 Interview Completed!\n\nOverall Score: {score}/10\nQuestions Answered: {answered}/{total}\n\nCheck your interview history to review detailed feedback.",
      completeError:
        "Failed to complete session. Your answers have been saved.",
    },
    recommended: "💡 Recommended:",
    languageNames: {
      "vi-VN": "Vietnamese",
      "en-US": "English",
      "en-GB": "English",
      "ja-JP": "Japanese",
      "ko-KR": "Korean",
      "zh-CN": "Chinese",
      "fr-FR": "French",
      "de-DE": "German",
      "es-ES": "Spanish",
    },
  },
  vi: {
    loading: {
      title: "Đang chuẩn bị phòng phỏng vấn",
      desc: "AI đang phân tích mô tả công việc và tạo các câu hỏi cá nhân hóa...",
      analyzing: "Phân tích yêu cầu công việc",
      determining: "Xác định mức độ khó",
      generating: "Đang tạo câu hỏi phỏng vấn...",
    },
    header: {
      title: "Phiên phỏng vấn trực tiếp",
      difficulty: "Độ khó",
      exitFullscreen: "Thoát toàn màn hình",
      enterFullscreen: "Chế độ toàn màn hình",
    },
    progress: {
      progress: "Tiến độ",
      questions: "câu hỏi",
      answered: "đã trả lời",
    },
    feedback: {
      thankYou: "Cảm ơn bạn đã trả lời! Điểm số của bạn:",
      score: "Điểm số",
      strengths: "Điểm mạnh:",
      improvements: "Cần cải thiện:",
      nextQuestion: "Câu hỏi tiếp theo →",
    },
    input: {
      placeholder: "Nhập câu trả lời của bạn...",
      placeholderWait: "Vui lòng đợi câu hỏi hiển thị xong...",
      waitMessage: "⏳ Đang hiển thị câu hỏi, vui lòng đợi...",
      recording: "🎤 Đang ghi âm",
      transcript: "Transcript:",
      listening: "Đang lắng nghe... Hãy nói vào microphone",
      error: "Lỗi:",
      recordingError: "Lỗi ghi âm:",
      helpText:
        "Nhấn Ctrl + Enter để gửi • Nhấn icon mic để bật/tắt ghi âm • Chọn ngôn ngữ để ghi âm/nhập text",
      waitTitle: "Vui lòng đợi câu hỏi hiển thị xong",
      stopRecording: "Nhấn để dừng ghi âm",
      startRecording: "Nhấn để bắt đầu ghi âm",
      languageSwitched: "Đã tự động chuyển sang",
      finalText: "Đã xác nhận",
      interimText: "Đang nhận diện...",
      editHint: "Bạn có thể chỉnh sửa văn bản ở trên nếu cần",
      missingViVoice:
        "Trình duyệt không có giọng tiếng Việt. Hệ thống sẽ đọc bằng giọng tiếng Anh. Vui lòng dùng Edge hoặc cài đặt giọng tiếng Việt trên hệ điều hành.",
    },
    complete: {
      title: "Tất cả câu hỏi đã hoàn thành! 🎉",
      desc: "Bạn đã trả lời tất cả {count} câu hỏi. Nhấn nút bên dưới để hoàn thành phỏng vấn và xem kết quả tổng thể.",
      button: "Hoàn thành phỏng vấn",
      completing: "Đang hoàn thành...",
    },
    welcome:
      "Xin chào! 👋\n\nRất vui được gặp bạn hôm nay! Tôi là AI Interviewer, và tôi sẽ đồng hành cùng bạn trong buổi phỏng vấn cho vị trí {jobTitle}{company}.\n\nĐừng lo lắng, hãy thư giãn và trả lời một cách tự nhiên nhé! Tôi sẽ hỏi bạn {totalQuestions} câu hỏi để hiểu rõ hơn về bạn. Chúc bạn may mắn! 🍀",
    welcomeDefault: "này",
    welcomeCompany: " tại {companyName}",
    notify: {
      submitError: "Gửi câu trả lời thất bại. Vui lòng thử lại.",
      sessionError: "Tạo phiên phỏng vấn thất bại. Vui lòng thử lại.",
      completeSuccess:
        "🎉 Hoàn thành phỏng vấn!\n\nĐiểm tổng thể: {score}/10\nSố câu đã trả lời: {answered}/{total}\n\nKiểm tra lịch sử phỏng vấn để xem phản hồi chi tiết.",
      completeError:
        "Hoàn thành phiên thất bại. Câu trả lời của bạn đã được lưu.",
    },
    recommended: "💡 Đề xuất:",
    languageNames: {
      "vi-VN": "Tiếng Việt",
      "en-US": "English",
      "en-GB": "English",
      "ja-JP": "日本語",
      "ko-KR": "한국어",
      "zh-CN": "中文",
      "fr-FR": "Français",
      "de-DE": "Deutsch",
      "es-ES": "Español",
    },
  },
} as const;

export default function AiInterviewModal({
  isOpen,
  onClose,
  jobDescription,
  jobTitle,
  companyName,
  numberOfQuestions = 10,
  sessionData,
}: AiInterviewModalProps) {
  const { language } = useLanguage();
  const t = modalTexts[language] ?? modalTexts.en;

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);
  const [sampleAnswer, setSampleAnswer] = useState("");
  const [followUpQuestion, setFollowUpQuestion] = useState("");
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [questionTimer, setQuestionTimer] = useState(0); // seconds
  const [sessionStartTime] = useState(Date.now());
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [conversation, setConversation] = useState<
    Array<{
      type: "question" | "answer" | "feedback" | "typing";
      content: string;
      timestamp: Date;
      questionId?: string;
      feedback?: InterviewFeedback;
    }>
  >([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isQuestionReady, setIsQuestionReady] = useState(false);
  const isQuestionReadyRef = useRef(false);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const [displayedText, setDisplayedText] = useState<{ [key: string]: string }>(
    {}
  );
  const addedQuestionsRef = useRef<Set<string>>(new Set());
  const hasInitializedRef = useRef(false);
  const isUserEditingRef = useRef(false); // Track if user is manually editing
  const lastTranscriptRef = useRef<string>(""); // Track last transcript to detect user edits
  const [showSummaryPopup, setShowSummaryPopup] = useState(false);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<{
    overallFeedback: string;
    averageScore: number;
    totalQuestions: number;
    answeredQuestions: number;
    feedbacks: InterviewFeedback[];
  } | null>(null);
  const [missingVietnameseVoice, setMissingVietnameseVoice] = useState(false);
  const [languageSwitchNotification, setLanguageSwitchNotification] = useState<{
    from: LanguageCode;
    to: LanguageCode;
    timestamp: number;
  } | null>(null);

  // Language detection hook
  const {
    detectedLanguage,
    detectionInfo,
    updateLanguageFromText,
    setLanguage: setDetectedLanguage,
  } = useLanguageDetection();

  // Get recommended language from session (detected from JD)
  const recommendedLanguage = session?.language as LanguageCode | undefined;

  // State for selected language (for speech and text input)
  // Initialize with recommended language from session, fallback to detected language
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(() => {
    return recommendedLanguage || detectedLanguage;
  });

  // Update selected language when session is loaded
  useEffect(() => {
    if (session?.language && session.language !== selectedLanguage) {
      const sessionLang = session.language as LanguageCode;
      setSelectedLanguage(sessionLang);
      setDetectedLanguage(sessionLang);
    }
  }, [session?.language]); // Removed setDetectedLanguage from deps - setters are stable

  // Speech-to-text hook với language được chọn

  const {
    isRecording,
    transcript,
    finalTranscript,
    interimTranscript,
    isSupported,
    startRecording,
    stopRecording,
    setLanguage: setSpeechLanguage,
    resetTranscript: resetSpeechTranscript,
    error: speechError,
    currentLanguage: currentSpeechLanguage,
  } = useWebSpeechToText({
    language: selectedLanguage,
    // Enable multiple languages support for mixed language recognition
    // Try to use both Vietnamese and English if primary language is Vietnamese
    languages: selectedLanguage?.toLowerCase().includes("vi")
      ? [selectedLanguage, "en-US"]
      : selectedLanguage?.toLowerCase().includes("en")
      ? [selectedLanguage, "vi-VN"]
      : undefined,
    continuous: true,
    interimResults: true,
    autoSwitchLanguage: true, // Enable auto language switching based on transcript
    minConfidence: 0.6, // Filter out results with confidence < 60%
    enableTextNormalization: true, // Enable text normalization and punctuation correction
    enableAudioConstraints: true, // Note: Web Speech API manages audio, but we can optimize settings
    onTranscript: (text, isFinal) => {
      if (!isQuestionReadyRef.current) return;
      // Only update if user is not manually editing
      // If it's a final result, always update (confirmed text)
      if (isFinal || !isUserEditingRef.current) {
        setUserAnswer(text);
        lastTranscriptRef.current = text;
      }
    },
    onError: (error) => {
      notify.error(`${t.input.recordingError} ${error}`);
    },
    onLanguageDetected: (detectedLang) => {
      // Update selected language when auto-detected from speech
      if (detectedLang !== selectedLanguage) {
        const oldLang = selectedLanguage;
        setSelectedLanguage(detectedLang as LanguageCode);
        setDetectedLanguage(detectedLang as LanguageCode);
        // Show subtle notification about language switch
        setLanguageSwitchNotification({
          from: oldLang,
          to: detectedLang as LanguageCode,
          timestamp: Date.now(),
        });
        // Auto-hide notification after 3 seconds
        setTimeout(() => {
          setLanguageSwitchNotification(null);
        }, 3000);
      }
    },
  });

  // Update speech recognition language when selected language changes
  useEffect(() => {
    if (!isRecording && setSpeechLanguage) {
      setSpeechLanguage(selectedLanguage);
    }
  }, [selectedLanguage, isRecording]); // Removed setSpeechLanguage from deps - function is stable

  // Update language khi user nhập text (debounced to prevent infinite loops)
  useEffect(() => {
    if (isRecording) return;
    if (userAnswer.trim().length > 5) {
      // Only update if text is significantly different to avoid loops
      const timeoutId = setTimeout(() => {
        updateLanguageFromText(userAnswer);
      }, 500); // Debounce 500ms

      return () => clearTimeout(timeoutId);
    }
  }, [userAnswer, isRecording]); // Removed updateLanguageFromText from deps to prevent loop

  // Preload voices when component mounts
  useEffect(() => {
    if ("speechSynthesis" in window) {
      // Force load voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
      };

      // Try to load voices immediately
      loadVoices();

      // Also listen for voices changed event
      window.speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  // Cleanup: Stop speech when component unmounts or modal closes
  useEffect(() => {
    return () => {
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
        speechSynthesisRef.current = null;
      }
    };
  }, []);

  // Get current question from session
  const currentQuestion = session?.questions[currentQuestionIndex];
  const isLastQuestion = session
    ? currentQuestionIndex >= session.questions.length - 1
    : false;

  // Timer effect
  useEffect(() => {
    if (currentQuestion && !feedback) {
      // Start timer when question is shown
      timerIntervalRef.current = setInterval(() => {
        setQuestionTimer((prev) => prev + 1);
      }, 1000);
    } else {
      // Stop timer when feedback is shown
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [currentQuestion, feedback]);

  // Reset timer when moving to next question
  useEffect(() => {
    setQuestionTimer(0);
  }, [currentQuestionIndex]);

  // Reset transcript when moving to new question
  useEffect(() => {
    if (currentQuestion && resetSpeechTranscript) {
      // Reset transcript when a new question is shown (by question ID)
      resetSpeechTranscript();
      // Reset editing flags
      isUserEditingRef.current = false;
      lastTranscriptRef.current = "";
    }
  }, [currentQuestion?.id, resetSpeechTranscript]);

  // Stop recording if question is not ready
  useEffect(() => {
    if (!isQuestionReady && isRecording) {
      stopRecording();
    }
  }, [isQuestionReady, isRecording]);

  useEffect(() => {
    if (isOpen && jobDescription && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      initializeInterview();
      // Request fullscreen
      if (document.documentElement.requestFullscreen) {
        document.documentElement
          .requestFullscreen()
          .then(() => {
            setIsFullscreen(true);
          })
          .catch(() => {
            // User denied or browser doesn't support
          });
      }
    } else if (!isOpen) {
      // Reset initialization flag
      hasInitializedRef.current = false;
      // Exit fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
      // Reset all states khi đóng modal
      setSession(null);
      setCurrentQuestionIndex(0);
      setUserAnswer("");
      setFeedback(null);
      setShowSampleAnswer(false);
      setShowFollowUp(false);
      setQuestionTimer(0);
      setConversation([]);
      setIsTyping(false);
      setDisplayedText({});
      setIsQuestionReady(false);
      isQuestionReadyRef.current = false;
      addedQuestionsRef.current.clear();
      setShowSummaryPopup(false);
      setShowFeedbackForm(false);
      setSessionSummary(null);
    }
  }, [isOpen, jobDescription]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const getLanguageName = (langCode: string) => {
    return (
      t.languageNames[langCode as keyof typeof t.languageNames] || langCode
    );
  };

  // Helper function to get welcome message based on language
  const getWelcomeMessage = (
    lang: string,
    jobTitle?: string,
    companyName?: string,
    totalQuestions?: number
  ): string => {
    const langCode = lang?.toLowerCase().includes("vi") ? "vi" : "en";
    const welcomeTexts = langCode === "vi" ? modalTexts.vi : modalTexts.en;

    const welcome = welcomeTexts.welcome
      .replace("{jobTitle}", jobTitle || welcomeTexts.welcomeDefault)
      .replace(
        "{company}",
        companyName
          ? welcomeTexts.welcomeCompany.replace("{companyName}", companyName)
          : ""
      )
      .replace("{totalQuestions}", (totalQuestions || 10).toString());

    return welcome;
  };

  const initializeInterview = async () => {
    setIsCreatingSession(true);
    try {
      // Nếu có sessionData từ retake, sử dụng nó luôn
      if (sessionData) {
        setSession(sessionData);
        setCurrentQuestionIndex(0); // Start from first question
        setUserAnswer("");
        setFeedback(null);

        // Initialize conversation with welcome message
        // Use language from session (detected from JD) to get correct welcome message
        const sessionLang =
          sessionData?.language || selectedLanguage || "vi-VN";
        const welcomeMessage = getWelcomeMessage(
          sessionLang,
          sessionData.jobTitle,
          sessionData.companyName,
          sessionData.totalQuestions
        );

        // Start with typing indicator
        setConversation([
          {
            type: "typing",
            content: "",
            timestamp: new Date(),
          },
        ]);

        // Type welcome message
        const welcomeId = "welcome";
        let currentIndex = 0;
        const typingSpeed = 30;

        const welcomeTypingInterval = setInterval(() => {
          if (currentIndex < welcomeMessage.length) {
            setDisplayedText((prev) => ({
              ...prev,
              [welcomeId]: welcomeMessage.substring(0, currentIndex + 1),
            }));
            currentIndex++;
          } else {
            clearInterval(welcomeTypingInterval);
            // Remove typing and add welcome message
            setConversation([
              {
                type: "question",
                content: welcomeMessage,
                timestamp: new Date(),
              },
            ]);

            // Speak welcome message with natural voice, then show first question
            speakWelcome(welcomeMessage, sessionData?.language)
              .then(() => {
                // Show first question after welcome message finishes
                const firstQuestion = sessionData?.questions?.[0];
                if (firstQuestion) {
                  // Small delay after welcome finishes
                  setTimeout(() => {
                    if (!addedQuestionsRef.current.has(firstQuestion.id)) {
                      addQuestionToConversation(firstQuestion, true);
                    }
                  }, 500);
                }
              })
              .catch((err) => {
                console.error("Error speaking welcome:", err);
                // Still show question even if welcome speech fails
                const firstQuestion = sessionData?.questions?.[0];
                if (firstQuestion) {
                  setTimeout(() => {
                    if (!addedQuestionsRef.current.has(firstQuestion.id)) {
                      addQuestionToConversation(firstQuestion, true);
                    }
                  }, 500);
                }
              });
          }
        }, typingSpeed);
        setIsCreatingSession(false);
      } else {
        // Tạo session mới như bình thường
        const response = await aiInterviewApi.createInterviewSession({
          jobDescription,
          jobTitle,
          companyName,
          numberOfQuestions,
        });

        if (response.success && response.data) {
          setSession(response.data);
          setCurrentQuestionIndex(0); // Start from first question
          setUserAnswer("");
          setFeedback(null);

          // Initialize conversation with welcome message
          if (response.data) {
            // Use language from session (detected from JD) to get correct welcome message
            const sessionLang =
              response.data?.language || selectedLanguage || "vi-VN";
            const welcomeMessage = getWelcomeMessage(
              sessionLang,
              response.data.jobTitle,
              response.data.companyName,
              response.data.totalQuestions
            );

            // Start with typing indicator
            setConversation([
              {
                type: "typing",
                content: "",
                timestamp: new Date(),
              },
            ]);

            // Type welcome message
            const welcomeId = "welcome";
            let currentIndex = 0;
            const typingSpeed = 30;

            const welcomeTypingInterval = setInterval(() => {
              if (currentIndex < welcomeMessage.length) {
                setDisplayedText((prev) => ({
                  ...prev,
                  [welcomeId]: welcomeMessage.substring(0, currentIndex + 1),
                }));
                currentIndex++;
              } else {
                clearInterval(welcomeTypingInterval);
                // Remove typing and add welcome message
                setConversation([
                  {
                    type: "question",
                    content: welcomeMessage,
                    timestamp: new Date(),
                  },
                ]);

                // Speak welcome message with natural voice, then show first question
                speakWelcome(welcomeMessage, response.data?.language)
                  .then(() => {
                    // Show first question after welcome message finishes
                    const firstQuestion = response.data?.questions?.[0];
                    if (firstQuestion) {
                      // Small delay after welcome finishes
                      setTimeout(() => {
                        if (!addedQuestionsRef.current.has(firstQuestion.id)) {
                          addQuestionToConversation(firstQuestion, true);
                        }
                      }, 500);
                    }
                  })
                  .catch((err) => {
                    console.error("Error speaking welcome:", err);
                    // Still show question even if welcome speech fails
                    const firstQuestion = response.data?.questions?.[0];
                    if (firstQuestion) {
                      setTimeout(() => {
                        if (!addedQuestionsRef.current.has(firstQuestion.id)) {
                          addQuestionToConversation(firstQuestion, true);
                        }
                      }, 500);
                    }
                  });
              }
            }, typingSpeed);
          }
        } else {
          notify.error(t.notify.sessionError);
        }
      }
    } catch (error) {
      console.error("Error initializing interview:", error);
      notify.error(t.notify.sessionError);
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!session || !currentQuestion || !userAnswer.trim()) return;

    // Add user answer to conversation
    setConversation((prev) => [
      ...prev,
      {
        type: "answer",
        content: userAnswer,
        timestamp: new Date(),
      },
    ]);

    setIsLoading(true);
    setIsEvaluating(true);

    // Stop timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // Show typing indicator
    setIsTyping(true);
    setConversation((prev) => [
      ...prev,
      {
        type: "typing",
        content: "",
        timestamp: new Date(),
      },
    ]);

    try {
      // Simulate thinking time for realism
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await aiInterviewApi.submitAnswer(session.sessionId, {
        questionId: currentQuestion.id,
        answer: userAnswer,
      });

      if (response.success && response.data) {
        const feedbackData = response.data.feedback;
        setFeedback(feedbackData);
        setShowFollowUp(true);

        // Remove typing indicator and add feedback
        setConversation((prev) => {
          const filtered = prev.filter((msg) => msg.type !== "typing");
          return [
            ...filtered,
            {
              type: "feedback",
              content: `${t.feedback.thankYou} ${feedbackData.score}/10\n\n${feedbackData.feedback}`,
              timestamp: new Date(),
              feedback: feedbackData,
            },
          ];
        });

        // Update session completedQuestions count
        setSession({
          ...session,
          completedQuestions: response.data.answeredQuestions,
        });
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      notify.error(t.notify.submitError);
      // Remove typing indicator on error
      setConversation((prev) => prev.filter((msg) => msg.type !== "typing"));
    } finally {
      setIsLoading(false);
      setIsEvaluating(false);
      setIsTyping(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString(language === "vi" ? "vi-VN" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Scroll to bottom when conversation updates
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  // Function to detect language from text - improved version
  const detectLanguageFromText = (text: string): string | null => {
    if (!text || text.trim().length < 3) return null;

    // Vietnamese characters (with diacritics)
    const vietnamesePattern =
      /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/;

    // Vietnamese common words (expanded list)
    const vietnameseWords =
      /\b(của|và|với|cho|từ|về|trong|này|đó|được|sẽ|có|không|một|hai|ba|bạn|tôi|chúng|nó|họ|nhưng|nếu|khi|để|vì|nên|mà|đã|sẽ|đang|rất|nhiều|ít|hơn|nhất|tất cả|mỗi|mọi|nào|đâu|sao|thế nào|tại sao|bạn|anh|chị|em|ông|bà|cô|chú|bác|dì|dượng|cậu|mợ)\b/i;

    // English common words (expanded list)
    const englishWords =
      /\b(the|is|are|and|or|but|in|on|at|to|for|of|with|by|this|that|these|those|was|were|been|have|has|had|do|does|did|will|would|should|could|can|may|might|what|when|where|why|how|which|who|whom|whose|about|above|across|after|against|along|among|around|before|behind|below|beneath|beside|between|beyond|during|except|inside|into|near|outside|over|through|throughout|under|until|upon|within|without|you|your|yours|we|our|ours|they|their|theirs|he|she|it|his|her|its)\b/i;

    // Count matches
    const vietnameseCharCount = (text.match(vietnamesePattern) || []).length;
    const vietnameseWordCount = (text.match(vietnameseWords) || []).length;
    const englishWordCount = (text.match(englishWords) || []).length;

    // Calculate scores (Vietnamese characters are more reliable indicators)
    const vietnameseScore = vietnameseCharCount * 3 + vietnameseWordCount * 2;
    const englishScore = englishWordCount * 2;

    // Determine language based on scores
    if (vietnameseScore > 0 && vietnameseScore >= englishScore) {
      return "vi-VN";
    } else if (englishScore > 2 && englishScore > vietnameseScore) {
      return "en-US";
    } else if (vietnameseCharCount > 0) {
      // If we see Vietnamese characters, it's Vietnamese
      return "vi-VN";
    } else if (englishWordCount > 2) {
      return "en-US";
    }

    // If no clear indicator, return null to use fallback
    return null;
  };

  // Function to normalize language code
  const normalizeLanguageCode = (lang?: string): string => {
    if (!lang) return "vi-VN";

    const langLower = lang.toLowerCase();

    // Normalize Vietnamese language codes
    if (
      langLower === "vi" ||
      langLower === "vietnamese" ||
      langLower.startsWith("vi-")
    ) {
      return "vi-VN";
    }

    // Normalize other common language codes
    if (langLower === "en" || langLower === "english") {
      return "en-US";
    }

    // Return as is if already in correct format
    return lang;
  };

  // Function to clean text for speech (remove emojis, format text)
  const cleanTextForSpeech = (text: string, language?: string): string => {
    if (!text) return "";

    const lang = language || session?.language || selectedLanguage || "vi-VN";
    const isVietnamese = lang.toLowerCase().includes("vi");

    // Remove emojis and special unicode characters
    let cleaned = text.replace(/[\u{1F300}-\u{1F9FF}]/gu, ""); // Emojis
    cleaned = cleaned.replace(/[\u{1F600}-\u{1F64F}]/gu, ""); // Emoticons
    cleaned = cleaned.replace(/[\u{1F680}-\u{1F6FF}]/gu, ""); // Transport symbols
    cleaned = cleaned.replace(/[\u{2600}-\u{26FF}]/gu, ""); // Miscellaneous symbols
    cleaned = cleaned.replace(/[\u{2700}-\u{27BF}]/gu, ""); // Dingbats

    // For Vietnamese: add space after punctuation for better pronunciation
    if (isVietnamese) {
      // Add space after common punctuation if not already present
      cleaned = cleaned.replace(/([.,!?;:])([^\s])/g, "$1 $2");
      // Ensure space before opening parentheses
      cleaned = cleaned.replace(/([^\s])(\()/g, "$1 $2");
      // Ensure space after closing parentheses
      cleaned = cleaned.replace(/(\))([^\s])/g, "$1 $2");
    }

    // Replace newlines with periods or spaces for better speech flow
    cleaned = cleaned.replace(/\n+/g, ". ");

    // Remove multiple spaces
    cleaned = cleaned.replace(/\s+/g, " ");

    // Remove markdown formatting
    cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, "$1"); // Bold
    cleaned = cleaned.replace(/\*(.*?)\*/g, "$1"); // Italic
    cleaned = cleaned.replace(/_(.*?)_/g, "$1"); // Underline
    cleaned = cleaned.replace(/`(.*?)`/g, "$1"); // Code

    // For Vietnamese: normalize common abbreviations and numbers
    if (isVietnamese) {
      // Normalize common Vietnamese abbreviations
      cleaned = cleaned.replace(/\b(vd|vd\.|ví dụ)\b/gi, "ví dụ");
      cleaned = cleaned.replace(/\b(etc|etc\.)\b/gi, "vân vân");
      // Add pauses for better flow
      cleaned = cleaned.replace(/([.!?])\s+/g, "$1 ");
    }

    // Trim whitespace
    cleaned = cleaned.trim();

    return cleaned;
  };

  // Function to get the best female voice for a language
  const getBestVoice = (lang: string): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return null;

    const langCode = lang.split("-")[0].toLowerCase();
    const fullLang = lang.toLowerCase();

    // Special handling for Vietnamese - prioritize best voices per browser
    // Best Vietnamese voices:
    // - Chrome: "Google Vietnamese" (female)
    // - Edge: "Microsoft HoaiMy Online (Natural)" (female) or "Microsoft NamMinh Online (Natural)" (male)
    // - Safari/macOS: "Vietnamese (Female)" or "Vietnamese (Male)"
    if (langCode === "vi" || fullLang === "vi-vn") {
      // First, try exact match for Vietnamese
      const viVoices = voices.filter(
        (voice) =>
          voice.lang.toLowerCase() === "vi-vn" ||
          voice.lang.toLowerCase() === "vi" ||
          voice.lang.toLowerCase().startsWith("vi-")
      );

      if (viVoices.length > 0) {
        setMissingVietnameseVoice(false);

        // PRIORITY 1: Microsoft Edge voices (Natural voices - best quality)
        // "Microsoft HoaiMy Online (Natural) - Vietnamese (Vietnam)" - Female, very natural
        // "Microsoft NamMinh Online (Natural) - Vietnamese (Vietnam)" - Male, strong
        const microsoftNaturalVoice = viVoices.find((voice) => {
          const nameLower = voice.name.toLowerCase();
          return (
            (nameLower.includes("microsoft") &&
              (nameLower.includes("hoaimy") || nameLower.includes("namminh")) &&
              nameLower.includes("natural")) ||
            (nameLower.includes("hoaimy") && nameLower.includes("natural")) ||
            (nameLower.includes("namminh") && nameLower.includes("natural"))
          );
        });

        if (microsoftNaturalVoice) {
          return microsoftNaturalVoice;
        }

        // PRIORITY 2: Google Vietnamese voice (Chrome - good quality)
        // "Google Vietnamese" - Female voice, clear and natural
        const googleVietnameseVoice = viVoices.find((voice) => {
          const nameLower = voice.name.toLowerCase();
          return (
            (nameLower.includes("google") &&
              nameLower.includes("vietnamese")) ||
            nameLower === "google vietnamese" ||
            nameLower.includes("vi-vn-google") ||
            (nameLower.includes("google") && nameLower.includes("vi"))
          );
        });

        if (googleVietnameseVoice) {
          return googleVietnameseVoice;
        }

        // PRIORITY 3: Any Google voice that supports Vietnamese
        const allGoogleVoices = voices.filter((voice) => {
          const nameLower = voice.name.toLowerCase();
          return nameLower.includes("google");
        });

        const googleViVoice = allGoogleVoices.find(
          (voice) =>
            voice.lang.toLowerCase().includes("vi") ||
            voice.lang.toLowerCase() === "vi-vn"
        );

        if (googleViVoice) {
          return googleViVoice;
        }

        // PRIORITY 4: Safari/macOS voices
        // "Vietnamese (Female)" or "Vietnamese (Male)"
        const safariVoice = viVoices.find((voice) => {
          const nameLower = voice.name.toLowerCase();
          return (
            (nameLower.includes("vietnamese") &&
              (nameLower.includes("female") || nameLower.includes("male"))) ||
            nameLower === "vietnamese (female)" ||
            nameLower === "vietnamese (male)"
          );
        });

        if (safariVoice) {
          return safariVoice;
        }

        // PRIORITY 5: Microsoft voices (any Microsoft voice for Vietnamese)
        const microsoftVoice = viVoices.find((voice) => {
          const nameLower = voice.name.toLowerCase();
          return nameLower.includes("microsoft");
        });

        if (microsoftVoice) {
          return microsoftVoice;
        }

        // PRIORITY 6: Vietnamese female voice names (common in Windows, macOS, etc.)
        const viFemaleNames = [
          "linh",
          "mai",
          "lan",
          "hong",
          "anh",
          "thu",
          "ha",
          "hoaimy",
        ];

        // Try to find Vietnamese female voice
        const viFemaleVoice = viVoices.find((voice) => {
          const nameLower = voice.name.toLowerCase();
          return (
            viFemaleNames.some((name) => nameLower.includes(name)) ||
            (nameLower.includes("vietnamese") && nameLower.includes("female"))
          );
        });

        if (viFemaleVoice) {
          return viFemaleVoice;
        }

        // PRIORITY 7: Any voice with "Vietnamese" in name
        const anyVietnameseVoice = viVoices.find((voice) => {
          const nameLower = voice.name.toLowerCase();
          return (
            nameLower.includes("vietnamese") || nameLower.includes("vi-vn")
          );
        });

        if (anyVietnameseVoice) {
          return anyVietnameseVoice;
        }

        // Last resort: use first Vietnamese voice
        return viVoices[0];
      } else {
        setMissingVietnameseVoice(true);
      }
    }

    // Filter voices by language
    const langVoices = voices.filter(
      (voice) =>
        voice.lang.toLowerCase().startsWith(langCode) ||
        voice.lang.toLowerCase() === fullLang
    );

    // If no voices for this language, try to find similar language
    const allLangVoices =
      langVoices.length > 0
        ? langVoices
        : voices.filter((voice) => voice.lang.toLowerCase().includes(langCode));

    if (allLangVoices.length === 0) {
      console.warn("No voices found for language:", lang);
      return null;
    }

    // List of known female voice names for different languages
    const femaleVoiceNames: { [key: string]: string[] } = {
      en: [
        "zira",
        "samantha",
        "susan",
        "karen",
        "tessa",
        "fiona",
        "victoria",
        "siri",
        "alex",
      ],
      vi: ["linh", "mai", "lan", "hong", "anh", "thu", "ha"],
      ja: ["kyoko", "nanami", "otoya"],
      ko: ["yuna", "sora"],
      zh: ["ting-ting", "sin-ji", "mei-jia"],
      fr: ["amelie", "thomas", "thomas"],
      de: ["anna", "katrin", "helena"],
      es: ["monica", "soledad", "maria", "paulina"],
    };

    const langFemaleNames =
      femaleVoiceNames[langCode] || femaleVoiceNames["en"];

    // PRIORITY 1: Try to find Google voice (giọng chị Google) for any language
    const googleVoice = allLangVoices.find((voice) => {
      const nameLower = voice.name.toLowerCase();
      return nameLower.includes("google");
    });

    if (googleVoice) {
      return googleVoice;
    }

    // PRIORITY 2: Try to find neural/premium female voices
    const neuralFemaleVoice = allLangVoices.find((voice) => {
      const nameLower = voice.name.toLowerCase();
      return (
        (nameLower.includes("neural") ||
          nameLower.includes("premium") ||
          nameLower.includes("enhanced") ||
          nameLower.includes("natural")) &&
        langFemaleNames.some((femaleName) => nameLower.includes(femaleName))
      );
    });

    if (neuralFemaleVoice) {
      return neuralFemaleVoice;
    }

    // PRIORITY 3: Try to find any female voice
    const femaleVoice = allLangVoices.find(
      (voice) =>
        langFemaleNames.some((femaleName) =>
          voice.name.toLowerCase().includes(femaleName)
        ) || voice.name.toLowerCase().includes("female")
    );

    if (femaleVoice) {
      return femaleVoice;
    }

    // Last resort: use first available voice for the language
    console.warn(
      "No female voice found, using first available voice for language:",
      lang
    );
    return allLangVoices[0];
  };

  // Function to speak text with natural voice
  const speakText = (
    text: string,
    language?: string,
    options?: {
      rate?: number;
      pitch?: number;
      volume?: number;
      isWelcome?: boolean;
    }
  ) => {
    // Stop any ongoing speech
    if (speechSynthesisRef.current) {
      window.speechSynthesis.cancel();
    }

    // Check if browser supports speech synthesis
    if (!("speechSynthesis" in window)) {
      console.warn("Speech synthesis not supported");
      return;
    }

    // Detect language from text if not provided, then normalize
    let detectedLang = language;

    // Always try to detect from text first for accuracy
    const textDetectedLang = detectLanguageFromText(text);
    if (textDetectedLang) {
      detectedLang = textDetectedLang;
    } else {
      // Fallback to provided language or session language
      detectedLang =
        language || session?.language || selectedLanguage || "vi-VN";
    }

    // Normalize language code (vi -> vi-VN, en -> en-US, etc.)
    const speechLang = normalizeLanguageCode(detectedLang);
    const effectiveLang =
      speechLang.toLowerCase().includes("vi") && missingVietnameseVoice
        ? "en-US"
        : speechLang;

    // Wait for voices to be loaded
    const speakWithVoice = () => {
      try {
        // Clean text before speaking (pass language for proper formatting)
        const cleanedText = cleanTextForSpeech(text, speechLang);
        const langForVoice = effectiveLang;

        if (!cleanedText || cleanedText.trim().length === 0) {
          console.warn("Text is empty after cleaning, skipping speech");
          return;
        }

        const voices = window.speechSynthesis.getVoices();
        const isVietnamese = langForVoice.toLowerCase().includes("vi");

        const utterance = new SpeechSynthesisUtterance(cleanedText);
        // Force set language code to ensure correct pronunciation
        utterance.lang = langForVoice;

        // Adjust settings based on language for more natural speech
        if (isVietnamese) {
          // Vietnamese-specific settings for clearer pronunciation
          utterance.rate = options?.rate ?? 0.8; // Slightly faster for Vietnamese (more natural)
          utterance.pitch = options?.pitch ?? 1.1; // Slightly lower pitch for Vietnamese
          utterance.volume = options?.volume ?? 1.0;
        } else {
          // Default settings for other languages
          utterance.rate = options?.rate ?? 0.75; // Slower for clarity
          utterance.pitch = options?.pitch ?? 1.15; // Slightly higher pitch for female voice
          utterance.volume = options?.volume ?? 1.0; // Full volume for clarity
        }

        // Try to select the best voice for the language
        const bestVoice = getBestVoice(langForVoice);
        if (bestVoice) {
          utterance.voice = bestVoice;
          // Ensure voice language matches
          if (bestVoice.lang) {
            utterance.lang = bestVoice.lang;
          }
        } else {
          console.warn(
            "No suitable voice found, using default with lang:",
            langForVoice
          );
          // Still set language even if no specific voice found
          utterance.lang = langForVoice;
        }

        utterance.onstart = () => {};

        utterance.onend = () => {
          speechSynthesisRef.current = null;
        };

        utterance.onerror = (error) => {
          console.error("Speech synthesis error:", error);
          speechSynthesisRef.current = null;
        };

        speechSynthesisRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error("Error in speakWithVoice:", error);
      }
    };

    // Load voices if not already loaded
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      // Some browsers need this event to fire
      window.speechSynthesis.onvoiceschanged = () => {
        speakWithVoice();
        window.speechSynthesis.onvoiceschanged = null;
      };
      // Force load voices in some browsers
      window.speechSynthesis.getVoices();
      // Fallback: try after a short delay
      setTimeout(() => {
        if (window.speechSynthesis.getVoices().length > 0) {
          speakWithVoice();
        }
      }, 100);
    } else {
      speakWithVoice();
    }
  };

  // Function to speak question using text-to-speech
  const speakQuestion = async (
    text: string,
    language?: string,
    withIntroduction: boolean = false,
    isFirstQuestion: boolean = false
  ): Promise<void> => {
    // Detect language from question text first, then fallback to provided language or session language
    const detectedLang =
      detectLanguageFromText(text) ||
      language ||
      session?.language ||
      selectedLanguage ||
      "vi-VN";
    const questionLang = normalizeLanguageCode(detectedLang);

    if (withIntroduction) {
      // Use detected language for introduction
      const intro = getQuestionIntroduction(questionLang, isFirstQuestion);
      // Speak introduction first, then question
      await speakTextAsync(intro, questionLang, { isWelcome: false });
      // Small pause between introduction and question
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    // Use detected language for question
    return speakTextAsync(text, questionLang, { isWelcome: false });
  };

  // Function to get question introduction based on language
  const getQuestionIntroduction = (
    language?: string,
    isFirstQuestion: boolean = false
  ): string => {
    const lang = language || session?.language || selectedLanguage || "vi-VN";
    const langCode = lang.split("-")[0].toLowerCase();

    const introductions: { [key: string]: { first: string; next: string } } = {
      vi: {
        first: "Câu hỏi đầu tiên là:",
        next: "Câu hỏi tiếp theo là:",
      },
      en: {
        first: "The first question is:",
        next: "The next question is:",
      },
      ja: {
        first: "最初の質問は:",
        next: "次の質問は:",
      },
      ko: {
        first: "첫 번째 질문은:",
        next: "다음 질문은:",
      },
      zh: {
        first: "第一个问题是:",
        next: "下一个问题是:",
      },
      fr: {
        first: "La première question est:",
        next: "La question suivante est:",
      },
      de: {
        first: "Die erste Frage lautet:",
        next: "Die nächste Frage lautet:",
      },
      es: {
        first: "La primera pregunta es:",
        next: "La siguiente pregunta es:",
      },
    };

    const intro = introductions[langCode] || introductions["en"];
    return isFirstQuestion ? intro.first : intro.next;
  };

  // Function to speak text and return a promise that resolves when done
  const speakTextAsync = (
    text: string,
    language?: string,
    options?: {
      rate?: number;
      pitch?: number;
      volume?: number;
      isWelcome?: boolean;
    }
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Stop any ongoing speech
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
      }

      // Check if browser supports speech synthesis
      if (!("speechSynthesis" in window)) {
        console.warn("Speech synthesis not supported");
        reject(new Error("Speech synthesis not supported"));
        return;
      }

      // Detect language from text if not provided, then normalize
      let detectedLang = language;

      // Always try to detect from text first for accuracy
      const textDetectedLang = detectLanguageFromText(text);
      if (textDetectedLang) {
        detectedLang = textDetectedLang;
      } else {
        // Fallback to provided language or session language
        detectedLang =
          language || session?.language || selectedLanguage || "vi-VN";
      }

      // Normalize language code (vi -> vi-VN, en -> en-US, etc.)
      const speechLang = normalizeLanguageCode(detectedLang);
      const effectiveLang =
        speechLang.toLowerCase().includes("vi") && missingVietnameseVoice
          ? "en-US"
          : speechLang;

      // Wait for voices to be loaded
      const speakWithVoice = () => {
        try {
          // Clean text before speaking (pass language for proper formatting)
          const cleanedText = cleanTextForSpeech(text, speechLang);
          const langForVoice = effectiveLang;

          if (!cleanedText || cleanedText.trim().length === 0) {
            console.warn("Text is empty after cleaning, skipping speech");
            resolve();
            return;
          }

          const voices = window.speechSynthesis.getVoices();
          const isVietnamese = langForVoice.toLowerCase().includes("vi");

          const utterance = new SpeechSynthesisUtterance(cleanedText);
          // Force set language code to ensure correct pronunciation
          utterance.lang = langForVoice;

          // Adjust settings based on language for more natural speech
          if (isVietnamese) {
            // Vietnamese-specific settings for clearer pronunciation with tones
            utterance.rate = options?.rate ?? 0.85; // Slightly slower for better clarity with tones
            utterance.pitch = options?.pitch ?? 1.0; // Neutral pitch (tones are more important than pitch)
            utterance.volume = options?.volume ?? 1.0;
          } else {
            // Default settings for other languages
            utterance.rate = options?.rate ?? 0.75; // Slower for clarity
            utterance.pitch = options?.pitch ?? 1.15; // Slightly higher pitch for female voice
            utterance.volume = options?.volume ?? 1.0; // Full volume for clarity
          }

          // Try to select the best voice for the language
          const bestVoice = getBestVoice(langForVoice);
          if (bestVoice) {
            utterance.voice = bestVoice;
            // Ensure voice language matches
            if (bestVoice.lang) {
              utterance.lang = bestVoice.lang;
            }
          } else {
            console.warn(
              "No suitable voice found, using default with lang:",
              langForVoice
            );
            // Still set language even if no specific voice found
            utterance.lang = langForVoice;
          }

          utterance.onstart = () => {};

          utterance.onend = () => {
            speechSynthesisRef.current = null;
            resolve();
          };

          utterance.onerror = (error) => {
            console.error("Speech synthesis error:", error);
            speechSynthesisRef.current = null;
            reject(error);
          };

          speechSynthesisRef.current = utterance;
          window.speechSynthesis.speak(utterance);
        } catch (error) {
          console.error("Error in speakWithVoice:", error);
          reject(error);
        }
      };

      // Load voices if not already loaded
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          speakWithVoice();
          window.speechSynthesis.onvoiceschanged = null;
        };
        window.speechSynthesis.getVoices();
        setTimeout(() => {
          if (window.speechSynthesis.getVoices().length > 0) {
            speakWithVoice();
          }
        }, 100);
      } else {
        speakWithVoice();
      }
    });
  };

  // Function to speak welcome message with friendly voice
  // Language should be detected from JD (session.language), not UI language
  const speakWelcome = async (
    text: string,
    language?: string
  ): Promise<void> => {
    // Detect language from welcome message text if not provided
    // This ensures correct pronunciation even if language parameter is missing
    const detectedLang =
      detectLanguageFromText(text) ||
      language ||
      session?.language ||
      selectedLanguage ||
      "vi-VN";
    const welcomeLang = normalizeLanguageCode(detectedLang);

    return speakTextAsync(text, welcomeLang, { isWelcome: true });
  };

  const addQuestionToConversation = async (
    question: any,
    isFirstQuestion: boolean = false
  ) => {
    // Check if question already added using ref
    if (addedQuestionsRef.current.has(question.id)) {
      return; // Don't add duplicate question
    }

    // Mark question as added
    addedQuestionsRef.current.add(question.id);
    setIsQuestionReady(false);
    isQuestionReadyRef.current = false;

    setIsTyping(true);
    setConversation((prev) => [
      ...prev,
      {
        type: "typing",
        content: "",
        timestamp: new Date(),
      },
    ]);

    // Simulate typing effect
    const questionText = question.question;

    // Detect language from question text to ensure correct pronunciation
    const questionLanguage =
      detectLanguageFromText(questionText) ||
      session?.language ||
      selectedLanguage ||
      "vi-VN";

    // If this is the first question, wait a bit for welcome to finish, then speak with introduction
    if (isFirstQuestion) {
      // Wait a bit to ensure welcome message has finished
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Speak question with introduction, using detected language
      speakQuestion(questionText, questionLanguage, true, true).catch((err) => {
        console.error("Error speaking question:", err);
      });
    } else {
      // For subsequent questions, speak immediately with introduction
      setTimeout(() => {
        speakQuestion(questionText, questionLanguage, true, false).catch(
          (err) => {
            console.error("Error speaking question:", err);
          }
        );
      }, 100);
    }

    const typingSpeed = 30; // milliseconds per character
    let currentIndex = 0;

    const typingInterval = setInterval(() => {
      if (currentIndex < questionText.length) {
        setDisplayedText((prev) => ({
          ...prev,
          [question.id]: questionText.substring(0, currentIndex + 1),
        }));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        // Remove typing indicator and add actual question
        setConversation((prev) => {
          const filtered = prev.filter((msg) => msg.type !== "typing");
          return [
            ...filtered,
            {
              type: "question",
              content: questionText,
              timestamp: new Date(),
              questionId: question.id,
            },
          ];
        });
        setIsQuestionReady(true);
        isQuestionReadyRef.current = true;
      }
    }, typingSpeed);
  };

  const handleNextQuestion = () => {
    if (!session) return;

    // Stop recording if currently recording
    if (isRecording) {
      stopRecording();
    }

    // Stop any ongoing speech
    if (speechSynthesisRef.current) {
      window.speechSynthesis.cancel();
      speechSynthesisRef.current = null;
    }

    // Reset states cho câu hỏi mới
    setUserAnswer("");
    setFeedback(null);
    setShowSampleAnswer(false);
    setShowFollowUp(false);
    setFollowUpQuestion("");
    setSampleAnswer("");
    setIsQuestionReady(false);
    isQuestionReadyRef.current = false;

    // Reset speech transcript for new question
    if (resetSpeechTranscript) {
      resetSpeechTranscript();
    }

    // Move to next question
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);

    // Add next question to conversation after delay
    if (session.questions[nextIndex]) {
      setTimeout(() => {
        addQuestionToConversation(session.questions[nextIndex], false);
      }, 1000);
    }
  };

  const handleGetSampleAnswer = async () => {
    if (!session || !currentQuestion) return;

    setIsLoading(true);
    try {
      const response = await aiInterviewApi.getSampleAnswer(
        session.sessionId,
        currentQuestion.id
      );
      if (response.success && response.data) {
        setSampleAnswer(response.data.sampleAnswer);
        setShowSampleAnswer(true);
      }
    } catch (error) {
      console.error("Error getting sample answer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateFollowUp = async () => {
    if (!session || !currentQuestion || !userAnswer.trim()) return;

    setIsLoading(true);
    try {
      const response = await aiInterviewApi.generateFollowUpQuestion(
        session.sessionId,
        currentQuestion.id,
        userAnswer
      );

      if (response.success && response.data) {
        setFollowUpQuestion(response.data.followUpQuestion);
      }
    } catch (error) {
      console.error("Error generating follow-up question:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteSession = async () => {
    if (!session) return;

    setIsLoading(true);
    try {
      const response = await aiInterviewApi.completeSession(session.sessionId);
      if (response.success && response.data) {
        // Lưu summary data để hiển thị popup
        setSessionSummary({
          overallFeedback: response.data.overallFeedback,
          averageScore: response.data.averageScore,
          totalQuestions: response.data.totalQuestions,
          answeredQuestions: response.data.answeredQuestions,
          feedbacks: response.data.feedbacks,
        });

        // Hiển thị popup tổng hợp
        setShowSummaryPopup(true);
      }
    } catch (error) {
      console.error("Error completing session:", error);
      notify.error(t.notify.completeError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSummary = () => {
    setShowSummaryPopup(false);
    // Sau khi đóng popup tổng hợp, hiển thị form feedback
    setShowFeedbackForm(true);
  };

  const handleCloseFeedback = () => {
    setShowFeedbackForm(false);
    // Stop any ongoing speech
    if (speechSynthesisRef.current) {
      window.speechSynthesis.cancel();
      speechSynthesisRef.current = null;
    }
    // Đóng modal interview sau khi đóng feedback
    onClose();
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  if (!isOpen) return null;

  // Loading screen khi đang tạo session
  if (isCreatingSession) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center z-50">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          </div>
          <h3 className="text-xl font-semibold mb-2">{t.loading.title}</h3>
          <p className="text-gray-600 mb-4">{t.loading.desc}</p>
          <div className="space-y-2 text-sm text-gray-500">
            <p className="flex items-center justify-center gap-2">
              <span className="text-green-500">✓</span> {t.loading.analyzing}
            </p>
            <p className="flex items-center justify-center gap-2">
              <span className="text-green-500">✓</span> {t.loading.determining}
            </p>
            <p className="flex items-center justify-center gap-2 animate-pulse">
              <span className="text-blue-500">⏳</span> {t.loading.generating}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundImage:
          "url(https://res.cloudinary.com/dijayprrw/image/upload/v1764365074/mo-hinh-van-phong-cho-thue-6_tapr8g.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      <div className="bg-white/10 backdrop-blur-md rounded-xl max-w-4xl w-full h-[95vh] flex flex-col shadow-2xl border border-white/30 relative z-10">
        <div className="flex items-center justify-between p-6 border-b border-white/20 bg-white/20 backdrop-blur-sm">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                {t.header.title}
              </h2>
            </div>
            {session && (
              <div className="flex items-center gap-2 mt-3">
                {session.jobTitle && (
                  <Badge
                    variant="outline"
                    className="font-normal bg-white/90 backdrop-blur-sm text-gray-800 border-white/50"
                  >
                    {session.jobTitle}
                  </Badge>
                )}
                {session.companyName && (
                  <Badge
                    variant="outline"
                    className="font-normal bg-white/90 backdrop-blur-sm text-gray-800 border-white/50"
                  >
                    {session.companyName}
                  </Badge>
                )}
                <Badge
                  variant="default"
                  className="font-medium bg-blue-600 hover:bg-blue-700 text-white border-0"
                >
                  {session.difficulty.charAt(0).toUpperCase() +
                    session.difficulty.slice(1)}{" "}
                  {t.header.difficulty}
                </Badge>
                {currentQuestion && (
                  <Badge
                    variant="outline"
                    className="font-normal bg-white/90 backdrop-blur-sm text-gray-800 border-white/50 flex items-center gap-1"
                  >
                    <Clock className="h-3 w-3" />
                    {formatTime(questionTimer)}
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className="font-normal bg-white/90 backdrop-blur-sm text-gray-800 border-white/50 flex items-center gap-1"
                  title={`${language === "vi" ? "Ngôn ngữ" : "Language"}: ${
                    detectionInfo.detectedLanguage
                  } (${
                    detectionInfo.source === "browser"
                      ? language === "vi"
                        ? "Từ trình duyệt"
                        : "From browser"
                      : detectionInfo.source === "text"
                      ? language === "vi"
                        ? "Từ văn bản"
                        : "From text"
                      : language === "vi"
                      ? "Mặc định"
                      : "Default"
                  })`}
                >
                  <Globe className="h-3 w-3" />
                  {getLanguageName(detectionInfo.detectedLanguage)}
                </Badge>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              title={
                isFullscreen
                  ? t.header.exitFullscreen
                  : t.header.enterFullscreen
              }
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col h-[calc(95vh-120px)]">
          {/* Progress Bar */}
          {session && (
            <div className="px-6 pt-4 pb-2 space-y-2 border-b border-white/20 bg-white/10 backdrop-blur-sm">
              <div className="flex justify-between text-sm text-white drop-shadow-md">
                <span>{t.progress.progress}</span>
                <span>
                  {currentQuestionIndex + 1}/{session.totalQuestions}{" "}
                  {t.progress.questions} | {session.completedQuestions}{" "}
                  {t.progress.answered}
                </span>
              </div>
              <Progress
                value={
                  ((currentQuestionIndex + 1) / session.totalQuestions) * 100
                }
                className="h-2 bg-white/20"
              />
            </div>
          )}

          {/* Conversation Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {conversation.map((message, index) => {
              if (message.type === "typing") {
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-2xl rounded-tl-sm px-4 py-3 shadow-lg border border-white/30">
                      <div className="flex gap-1">
                        <div
                          className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              }

              if (message.type === "question") {
                const questionId = message.questionId || "welcome";
                const textToShow = displayedText[questionId]
                  ? displayedText[questionId]
                  : message.content;
                const isTyping =
                  displayedText[questionId] &&
                  displayedText[questionId].length < message.content.length;

                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-blue-600/90 backdrop-blur-sm text-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-lg border border-white/20">
                        <p className="text-white leading-relaxed whitespace-pre-wrap">
                          {textToShow}
                          {isTyping && <span className="animate-pulse">|</span>}
                        </p>
                      </div>
                      <span className="text-xs text-white/70 mt-1 block ml-2 drop-shadow-sm">
                        {formatMessageTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              }

              if (message.type === "answer") {
                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 justify-end"
                  >
                    <div className="flex-1 flex flex-col items-end">
                      <div className="bg-white/90 backdrop-blur-sm text-gray-900 rounded-2xl rounded-tr-sm px-4 py-3 shadow-lg border border-white/30 max-w-[80%]">
                        <p className="leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                      <span className="text-xs text-white/70 mt-1 mr-2 drop-shadow-sm">
                        {formatMessageTime(message.timestamp)}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-500/90 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-lg border border-white/30">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  </div>
                );
              }

              if (message.type === "feedback") {
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-green-50/90 backdrop-blur-sm border-2 border-green-200/50 rounded-2xl rounded-tl-sm px-4 py-3 shadow-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl font-bold text-green-600">
                            {message.feedback?.score}/10
                          </span>
                          <span className="text-sm text-gray-700">
                            {t.feedback.score}
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-3">
                          {message.content.split("\n\n")[1]}
                        </p>
                        {message.feedback && (
                          <div className="space-y-2 mt-3 pt-3 border-t border-green-200/50">
                            {message.feedback.strengths.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-green-700 text-sm mb-1">
                                  {t.feedback.strengths}
                                </h4>
                                <ul className="text-xs text-green-600 space-y-1">
                                  {message.feedback.strengths.map((s, i) => (
                                    <li
                                      key={i}
                                      className="flex items-start gap-1"
                                    >
                                      <span>✓</span>
                                      <span>{s}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {message.feedback.improvements.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-orange-700 text-sm mb-1">
                                  {t.feedback.improvements}
                                </h4>
                                <ul className="text-xs text-orange-600 space-y-1">
                                  {message.feedback.improvements.map(
                                    (imp, i) => (
                                      <li
                                        key={i}
                                        className="flex items-start gap-1"
                                      >
                                        <span>•</span>
                                        <span>{imp}</span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-white/70 mt-1 block ml-2 drop-shadow-sm">
                        {formatMessageTime(message.timestamp)}
                      </span>
                      {!isLastQuestion && (
                        <Button
                          onClick={handleNextQuestion}
                          className="mt-3 ml-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                        >
                          {t.feedback.nextQuestion}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              }

              return null;
            })}
            <div ref={conversationEndRef} />
          </div>

          {/* Input Area - Only show when there's a current question and no feedback */}
          {currentQuestion && !feedback && (
            <div className="border-t border-white/20 bg-white/10 backdrop-blur-sm p-4">
              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-2">
                  {/* Language Selector */}
                  <div className="flex items-center gap-2 mb-2">
                    <LanguageSelector
                      selectedLanguage={selectedLanguage}
                      onLanguageChange={(lang) => {
                        setSelectedLanguage(lang);
                        setDetectedLanguage(lang);
                        if (!isRecording && setSpeechLanguage) {
                          setSpeechLanguage(lang);
                        }
                      }}
                      recommendedLanguage={recommendedLanguage}
                      showRecommendation={true}
                      compact={true}
                    />
                    {recommendedLanguage &&
                      recommendedLanguage !== selectedLanguage && (
                        <span className="text-xs text-white/70 drop-shadow-sm">
                          {t.recommended} {getLanguageName(recommendedLanguage)}
                        </span>
                      )}
                  </div>
                  {missingVietnameseVoice &&
                    (selectedLanguage.toLowerCase().includes("vi") ||
                      currentSpeechLanguage?.toLowerCase().includes("vi")) && (
                      <div className="p-3 bg-yellow-50/90 backdrop-blur-sm border-2 border-yellow-300/50 rounded-lg text-sm text-yellow-800 flex items-start gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mt-1 animate-pulse"></div>
                        <p>{t.input.missingViVoice}</p>
                      </div>
                    )}
                  {!isQuestionReady && (
                    <div className="p-3 bg-yellow-50/90 backdrop-blur-sm border-2 border-yellow-300/50 rounded-lg text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                        <p className="font-semibold text-yellow-700">
                          {t.input.waitMessage}
                        </p>
                      </div>
                    </div>
                  )}
                  <Textarea
                    placeholder={
                      isQuestionReady
                        ? t.input.placeholder
                        : t.input.placeholderWait
                    }
                    value={userAnswer}
                    onChange={(e) => {
                      if (isQuestionReady) {
                        const newValue = e.target.value;
                        setUserAnswer(newValue);
                        // Track if user is editing (value differs from last transcript)
                        if (newValue !== lastTranscriptRef.current) {
                          isUserEditingRef.current = true;
                        }
                      }
                    }}
                    onFocus={() => {
                      // When user focuses, they might be editing
                      isUserEditingRef.current = true;
                    }}
                    onBlur={() => {
                      // Reset editing flag after a delay to allow transcript updates
                      setTimeout(() => {
                        isUserEditingRef.current = false;
                        lastTranscriptRef.current = userAnswer;
                      }, 1000);
                    }}
                    disabled={!isQuestionReady}
                    className="min-h-[80px] resize-none bg-white/90 backdrop-blur-sm border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        e.ctrlKey &&
                        userAnswer.trim() &&
                        isQuestionReady
                      ) {
                        handleSubmitAnswer();
                      }
                    }}
                  />
                  {isRecording && userAnswer && (
                    <p className="text-xs text-gray-600 mt-1 italic">
                      💡 {t.input.editHint}
                    </p>
                  )}
                  {isRecording && (
                    <div className="p-3 bg-red-50/90 backdrop-blur-sm border-2 border-red-300/50 rounded-lg text-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <p className="font-semibold text-red-700">
                          {t.input.recording} (
                          {getLanguageName(
                            currentSpeechLanguage || selectedLanguage
                          )}
                          )
                        </p>
                        {languageSwitchNotification && (
                          <span
                            className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full animate-pulse"
                            title={`${
                              t.input.languageSwitched
                            } ${getLanguageName(
                              languageSwitchNotification.to
                            )}`}
                          >
                            🔄 {getLanguageName(languageSwitchNotification.to)}
                          </span>
                        )}
                      </div>
                      {finalTranscript || interimTranscript ? (
                        <div className="mt-2 space-y-2">
                          {finalTranscript && (
                            <div className="p-2 bg-green-50/80 rounded border border-green-200/50">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-green-700">
                                  {t.input.finalText}
                                </span>
                                <span className="text-xs text-green-600">
                                  ✓
                                </span>
                              </div>
                              <p className="text-gray-800">{finalTranscript}</p>
                            </div>
                          )}
                          {interimTranscript && (
                            <div className="p-2 bg-yellow-50/80 rounded border border-yellow-200/50">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-yellow-700">
                                  {t.input.interimText}
                                </span>
                                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                              </div>
                              <p className="text-gray-700 italic">
                                {interimTranscript}
                              </p>
                            </div>
                          )}
                          <p className="text-xs text-gray-600 italic mt-1">
                            {t.input.editHint}
                          </p>
                        </div>
                      ) : (
                        <p className="text-red-600 text-xs italic">
                          {t.input.listening}
                        </p>
                      )}
                    </div>
                  )}
                  {speechError && (
                    <div className="p-2 bg-red-50/90 backdrop-blur-sm border border-red-200/50 rounded text-sm text-red-700">
                      <p>
                        {t.input.error} {speechError}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {isSupported && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleRecording}
                        disabled={!isQuestionReady}
                        className={
                          isRecording
                            ? "bg-red-100 text-red-600 hover:bg-red-200 border-red-300 bg-white/90 backdrop-blur-sm active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                            : "bg-white/90 backdrop-blur-sm border-white/30 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                        }
                        title={
                          !isQuestionReady
                            ? t.input.waitTitle
                            : isRecording
                            ? t.input.stopRecording
                            : t.input.startRecording
                        }
                      >
                        {isRecording ? (
                          <Mic className="h-4 w-4 animate-pulse text-red-600" />
                        ) : (
                          <Mic className="h-4 w-4" />
                        )}
                      </Button>
                      {isRecording && (
                        <div className="mt-2 px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-center text-xs text-white/80 backdrop-blur">
                          <p className="font-semibold text-red-200 flex items-center justify-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                            {t.input.recording}
                          </p>
                          <p className="mt-1 text-white/90 max-h-20 overflow-hidden text-ellipsis whitespace-pre-line">
                            {transcript || t.input.listening}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={
                      !userAnswer.trim() || isLoading || !isQuestionReady
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    size="icon"
                    title={!isQuestionReady ? t.input.waitTitle : ""}
                  >
                    {isEvaluating ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-white/80 mt-2 ml-1 drop-shadow-sm">
                {t.input.helpText}
              </p>
            </div>
          )}

          {/* No more questions */}
          {session && !currentQuestion && (
            <div className="border-t border-white/20 bg-white/10 backdrop-blur-sm p-6 text-center">
              <h3 className="text-lg font-medium text-white mb-2 drop-shadow-lg">
                {t.complete.title}
              </h3>
              <p className="text-white/90 mb-4 drop-shadow-md">
                {t.complete.desc.replace(
                  "{count}",
                  session.totalQuestions.toString()
                )}
              </p>
              <Button
                onClick={handleCompleteSession}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
              >
                {isLoading ? t.complete.completing : t.complete.button}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Summary Popup */}
      {showSummaryPopup && sessionSummary && (
        <InterviewSummaryPopup
          isOpen={showSummaryPopup}
          onClose={handleCloseSummary}
          onShowFeedback={() => {
            setShowSummaryPopup(false);
            setShowFeedbackForm(true);
          }}
          data={sessionSummary}
        />
      )}

      {/* Feedback Form */}
      {showFeedbackForm && (
        <FeedbackPopup
          feature="interview"
          onClose={handleCloseFeedback}
          onFeedbackSent={handleCloseFeedback}
        />
      )}
    </div>
  );
}
