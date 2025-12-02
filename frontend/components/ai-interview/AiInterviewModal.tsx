"use client";

import { aiInterviewApi, InterviewFeedback, InterviewSession } from '@/api/aiInterviewApi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { LanguageCode, useLanguageDetection } from '@/hooks/useLanguageDetection';
import { useWebSpeechToText } from '@/hooks/useWebSpeechToText';
import { notify } from "@/lib/notify";
import { Bot, Clock, Globe, Maximize2, Mic, Minimize2, Send, User, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import LanguageSelector from './LanguageSelector';

interface AiInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobDescription: string;
  jobTitle?: string;
  companyName?: string;
  numberOfQuestions?: number;
}

export default function AiInterviewModal({ 
  isOpen, 
  onClose, 
  jobDescription, 
  jobTitle, 
  companyName, 
  numberOfQuestions = 10 
}: AiInterviewModalProps) {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);
  const [sampleAnswer, setSampleAnswer] = useState('');
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [questionTimer, setQuestionTimer] = useState(0); // seconds
  const [sessionStartTime] = useState(Date.now());
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [conversation, setConversation] = useState<Array<{
    type: 'question' | 'answer' | 'feedback' | 'typing';
    content: string;
    timestamp: Date;
    questionId?: string;
    feedback?: InterviewFeedback;
  }>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isQuestionReady, setIsQuestionReady] = useState(false);
  const isQuestionReadyRef = useRef(false);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const [displayedText, setDisplayedText] = useState<{ [key: string]: string }>({});
  const addedQuestionsRef = useRef<Set<string>>(new Set());
  const hasInitializedRef = useRef(false);

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
    isSupported,
    startRecording,
    stopRecording,
    setLanguage: setSpeechLanguage,
    resetTranscript: resetSpeechTranscript,
    error: speechError
  } = useWebSpeechToText({
    language: selectedLanguage,
    continuous: true,
    interimResults: true,
    onTranscript: (text) => {
      if (!text || !isQuestionReadyRef.current) return;
      setUserAnswer((prev) => (prev !== text ? text : prev));
    },
    onError: (error) => {
      notify.error(`Lỗi ghi âm: ${error}`);
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

  // Get current question from session
  const currentQuestion = session?.questions[currentQuestionIndex];
  const isLastQuestion = session ? currentQuestionIndex >= session.questions.length - 1 : false;

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
        document.documentElement.requestFullscreen().then(() => {
          setIsFullscreen(true);
        }).catch(() => {
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
      setUserAnswer('');
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
    }
  }, [isOpen, jobDescription]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const initializeInterview = async () => {
    setIsCreatingSession(true);
    try {
      const response = await aiInterviewApi.createInterviewSession({
        jobDescription,
        jobTitle,
        companyName,
        numberOfQuestions
      });

      if (response.success && response.data) {
        setSession(response.data);
        setCurrentQuestionIndex(0); // Start from first question
        setUserAnswer('');
        setFeedback(null);
        
        // Initialize conversation with welcome message
        if (response.data) {
          const welcomeMessage = `Xin chào! 👋\n\nRất vui được gặp bạn hôm nay! Tôi là AI Interviewer, và tôi sẽ đồng hành cùng bạn trong buổi phỏng vấn cho vị trí ${response.data.jobTitle || 'này'}${response.data.companyName ? ` tại ${response.data.companyName}` : ''}.\n\nĐừng lo lắng, hãy thư giãn và trả lời một cách tự nhiên nhé! Tôi sẽ hỏi bạn ${response.data.totalQuestions} câu hỏi để hiểu rõ hơn về bạn. Chúc bạn may mắn! 🍀`;
          
          // Start with typing indicator
          setConversation([
            {
              type: 'typing',
              content: '',
              timestamp: new Date(),
            }
          ]);
          
          // Type welcome message
          const welcomeId = 'welcome';
          let currentIndex = 0;
          const typingSpeed = 30;
          
          const welcomeTypingInterval = setInterval(() => {
            if (currentIndex < welcomeMessage.length) {
              setDisplayedText(prev => ({
                ...prev,
                [welcomeId]: welcomeMessage.substring(0, currentIndex + 1)
              }));
              currentIndex++;
            } else {
              clearInterval(welcomeTypingInterval);
              // Remove typing and add welcome message
              setConversation([
                {
                  type: 'question',
                  content: welcomeMessage,
                  timestamp: new Date(),
                }
              ]);
              
              // Show first question after welcome message (only question at index 0)
              // Use closure to capture the first question
              const firstQuestion = response.data?.questions?.[0];
              if (firstQuestion) {
                setTimeout(() => {
                  // Only add the first question, ensure it's not already added
                  if (!addedQuestionsRef.current.has(firstQuestion.id)) {
                    addQuestionToConversation(firstQuestion);
                  }
                }, 2000);
              }
            }
          }, typingSpeed);
        }
      } else {
        notify.error('Failed to create interview session. Please try again.');
      }
    } catch (error) {
      console.error('Error initializing interview:', error);
      notify.error('Failed to create interview session. Please try again.');
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!session || !currentQuestion || !userAnswer.trim()) return;

    // Add user answer to conversation
    setConversation(prev => [...prev, {
      type: 'answer',
      content: userAnswer,
      timestamp: new Date(),
    }]);

    setIsLoading(true);
    setIsEvaluating(true);
    
    // Stop timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // Show typing indicator
    setIsTyping(true);
    setConversation(prev => [...prev, {
      type: 'typing',
      content: '',
      timestamp: new Date(),
    }]);

    try {
      // Simulate thinking time for realism
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await aiInterviewApi.submitAnswer(session.sessionId, {
        questionId: currentQuestion.id,
        answer: userAnswer
      });

      if (response.success && response.data) {
        const feedbackData = response.data.feedback;
        setFeedback(feedbackData);
        setShowFollowUp(true);
        
        // Remove typing indicator and add feedback
        setConversation(prev => {
          const filtered = prev.filter(msg => msg.type !== 'typing');
          return [...filtered, {
            type: 'feedback',
            content: `Cảm ơn bạn đã trả lời! Điểm số của bạn: ${feedbackData.score}/10\n\n${feedbackData.feedback}`,
            timestamp: new Date(),
            feedback: feedbackData,
          }];
        });
        
        // Update session completedQuestions count
        setSession({
          ...session,
          completedQuestions: response.data.answeredQuestions
        });
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      notify.error('Failed to submit answer. Please try again.');
      // Remove typing indicator on error
      setConversation(prev => prev.filter(msg => msg.type !== 'typing'));
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
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Scroll to bottom when conversation updates
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const addQuestionToConversation = (question: any) => {
    // Check if question already added using ref
    if (addedQuestionsRef.current.has(question.id)) {
      return; // Don't add duplicate question
    }
    
    // Mark question as added
    addedQuestionsRef.current.add(question.id);
    setIsQuestionReady(false);
    isQuestionReadyRef.current = false;
    
    setIsTyping(true);
    setConversation(prev => [...prev, {
      type: 'typing',
      content: '',
      timestamp: new Date(),
    }]);
    
    // Simulate typing effect
    const questionText = question.question;
    const typingSpeed = 30; // milliseconds per character
    let currentIndex = 0;
    
    const typingInterval = setInterval(() => {
      if (currentIndex < questionText.length) {
        setDisplayedText(prev => ({
          ...prev,
          [question.id]: questionText.substring(0, currentIndex + 1)
        }));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        // Remove typing indicator and add actual question
        setConversation(prev => {
          const filtered = prev.filter(msg => msg.type !== 'typing');
          return [...filtered, {
            type: 'question',
            content: questionText,
            timestamp: new Date(),
            questionId: question.id,
          }];
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
    
    // Reset states cho câu hỏi mới
    setUserAnswer('');
    setFeedback(null);
    setShowSampleAnswer(false);
    setShowFollowUp(false);
    setFollowUpQuestion('');
    setSampleAnswer('');
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
        addQuestionToConversation(session.questions[nextIndex]);
      }, 1000);
    }
  };

  const handleGetSampleAnswer = async () => {
    if (!session || !currentQuestion) return;

    setIsLoading(true);
    try {
      const response = await aiInterviewApi.getSampleAnswer(session.sessionId, currentQuestion.id);
      if (response.success && response.data) {
        setSampleAnswer(response.data.sampleAnswer);
        setShowSampleAnswer(true);
      }
    } catch (error) {
      console.error('Error getting sample answer:', error);
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
      console.error('Error generating follow-up question:', error);
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
        // Show overall feedback
        const message = `🎉 Interview Completed!\n\n` +
          `Overall Score: ${response.data.averageScore.toFixed(1)}/10\n` +
          `Questions Answered: ${response.data.answeredQuestions}/${response.data.totalQuestions}\n\n` +
          `Check your interview history to review detailed feedback.`;
        
        notify.success(message);
        onClose();
      }
    } catch (error) {
      console.error('Error completing session:', error);
      notify.error('Failed to complete session. Your answers have been saved.');
    } finally {
      setIsLoading(false);
    }
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
          <h3 className="text-xl font-semibold mb-2">Preparing Your Interview Room</h3>
          <p className="text-gray-600 mb-4">
            AI is analyzing the job description and generating personalized questions...
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p className="flex items-center justify-center gap-2">
              <span className="text-green-500">✓</span> Analyzing job requirements
            </p>
            <p className="flex items-center justify-center gap-2">
              <span className="text-green-500">✓</span> Determining difficulty level
            </p>
            <p className="flex items-center justify-center gap-2 animate-pulse">
              <span className="text-blue-500">⏳</span> Generating interview questions...
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
        backgroundImage: 'url(https://res.cloudinary.com/dijayprrw/image/upload/v1764365074/mo-hinh-van-phong-cho-thue-6_tapr8g.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      <div className="bg-white/10 backdrop-blur-md rounded-xl max-w-4xl w-full h-[95vh] flex flex-col shadow-2xl border border-white/30 relative z-10">
        <div className="flex items-center justify-between p-6 border-b border-white/20 bg-white/20 backdrop-blur-sm">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">Live Interview Session</h2>
            </div>
            {session && (
              <div className="flex items-center gap-2 mt-3">
                {session.jobTitle && (
                  <Badge variant="outline" className="font-normal bg-white/90 backdrop-blur-sm text-gray-800 border-white/50">
                    {session.jobTitle}
                  </Badge>
                )}
                {session.companyName && (
                  <Badge variant="outline" className="font-normal bg-white/90 backdrop-blur-sm text-gray-800 border-white/50">
                    {session.companyName}
                  </Badge>
                )}
                <Badge 
                  variant="default"
                  className="font-medium bg-blue-600 hover:bg-blue-700 text-white border-0"
                >
                  {session.difficulty.charAt(0).toUpperCase() + session.difficulty.slice(1)} Difficulty
                </Badge>
                {currentQuestion && (
                  <Badge variant="outline" className="font-normal bg-white/90 backdrop-blur-sm text-gray-800 border-white/50 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(questionTimer)}
                  </Badge>
                )}
                <Badge variant="outline" className="font-normal bg-white/90 backdrop-blur-sm text-gray-800 border-white/50 flex items-center gap-1" title={`Ngôn ngữ: ${detectionInfo.detectedLanguage} (${detectionInfo.source === 'browser' ? 'Từ trình duyệt' : detectionInfo.source === 'text' ? 'Từ văn bản' : 'Mặc định'})`}>
                  <Globe className="h-3 w-3" />
                  {detectionInfo.detectedLanguage === 'vi-VN' ? 'Tiếng Việt' : 
                   detectionInfo.detectedLanguage === 'en-US' || detectionInfo.detectedLanguage === 'en-GB' ? 'English' :
                   detectionInfo.detectedLanguage === 'ja-JP' ? '日本語' :
                   detectionInfo.detectedLanguage === 'ko-KR' ? '한국어' :
                   detectionInfo.detectedLanguage === 'zh-CN' ? '中文' :
                   detectionInfo.detectedLanguage}
                </Badge>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggleFullscreen} title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
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
                <span>Progress</span>
                <span>{currentQuestionIndex + 1}/{session.totalQuestions} questions | {session.completedQuestions} answered</span>
              </div>
              <Progress 
                value={((currentQuestionIndex + 1) / session.totalQuestions) * 100} 
                className="h-2 bg-white/20"
              />
            </div>
          )}

          {/* Conversation Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {conversation.map((message, index) => {
              if (message.type === 'typing') {
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-2xl rounded-tl-sm px-4 py-3 shadow-lg border border-white/30">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                );
              }

              if (message.type === 'question') {
                const questionId = message.questionId || 'welcome';
                const textToShow = displayedText[questionId] 
                  ? displayedText[questionId] 
                  : message.content;
                const isTyping = displayedText[questionId] && displayedText[questionId].length < message.content.length;
                
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

              if (message.type === 'answer') {
                return (
                  <div key={index} className="flex items-start gap-3 justify-end">
                    <div className="flex-1 flex flex-col items-end">
                      <div className="bg-white/90 backdrop-blur-sm text-gray-900 rounded-2xl rounded-tr-sm px-4 py-3 shadow-lg border border-white/30 max-w-[80%]">
                        <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
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

              if (message.type === 'feedback') {
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                      <div className="bg-green-50/90 backdrop-blur-sm border-2 border-green-200/50 rounded-2xl rounded-tl-sm px-4 py-3 shadow-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl font-bold text-green-600">{message.feedback?.score}/10</span>
                          <span className="text-sm text-gray-700">Điểm số</span>
                  </div>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-3">{message.content.split('\n\n')[1]}</p>
                        {message.feedback && (
                          <div className="space-y-2 mt-3 pt-3 border-t border-green-200/50">
                            {message.feedback.strengths.length > 0 && (
                  <div>
                                <h4 className="font-semibold text-green-700 text-sm mb-1">Điểm mạnh:</h4>
                                <ul className="text-xs text-green-600 space-y-1">
                                  {message.feedback.strengths.map((s, i) => (
                                    <li key={i} className="flex items-start gap-1">
                                      <span>✓</span>
                                      <span>{s}</span>
                                    </li>
                      ))}
                    </ul>
                  </div>
                )}
                            {message.feedback.improvements.length > 0 && (
                  <div>
                                <h4 className="font-semibold text-orange-700 text-sm mb-1">Cần cải thiện:</h4>
                                <ul className="text-xs text-orange-600 space-y-1">
                                  {message.feedback.improvements.map((imp, i) => (
                                    <li key={i} className="flex items-start gap-1">
                                      <span>•</span>
                                      <span>{imp}</span>
                                    </li>
                      ))}
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
                          Câu hỏi tiếp theo →
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
                    {recommendedLanguage && recommendedLanguage !== selectedLanguage && (
                      <span className="text-xs text-white/70 drop-shadow-sm">
                        💡 Recommended: {recommendedLanguage === 'vi-VN' ? 'Tiếng Việt' : 
                                         recommendedLanguage === 'en-US' || recommendedLanguage === 'en-GB' ? 'English' :
                                         recommendedLanguage === 'ja-JP' ? '日本語' :
                                         recommendedLanguage === 'ko-KR' ? '한국어' :
                                         recommendedLanguage === 'zh-CN' ? '中文' :
                                         recommendedLanguage === 'fr-FR' ? 'Français' :
                                         recommendedLanguage === 'de-DE' ? 'Deutsch' :
                                         recommendedLanguage === 'es-ES' ? 'Español' : recommendedLanguage}
                      </span>
                    )}
                  </div>
                  {!isQuestionReady && (
                    <div className="p-3 bg-yellow-50/90 backdrop-blur-sm border-2 border-yellow-300/50 rounded-lg text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                        <p className="font-semibold text-yellow-700">
                          ⏳ Đang hiển thị câu hỏi, vui lòng đợi...
                        </p>
                      </div>
                  </div>
                )}
                  <Textarea
                    placeholder={isQuestionReady ? "Nhập câu trả lời của bạn..." : "Vui lòng đợi câu hỏi hiển thị xong..."}
                    value={userAnswer}
                    onChange={(e) => {
                      if (isQuestionReady) {
                        setUserAnswer(e.target.value);
                      }
                    }}
                    disabled={!isQuestionReady}
                    className="min-h-[80px] resize-none bg-white/90 backdrop-blur-sm border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey && userAnswer.trim() && isQuestionReady) {
                        handleSubmitAnswer();
                      }
                    }}
                  />
                  {isRecording && (
                    <div className="p-3 bg-red-50/90 backdrop-blur-sm border-2 border-red-300/50 rounded-lg text-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <p className="font-semibold text-red-700">
                          🎤 Đang ghi âm ({selectedLanguage === 'vi-VN' ? 'Tiếng Việt' : 
                                          selectedLanguage === 'en-US' || selectedLanguage === 'en-GB' ? 'English' :
                                          selectedLanguage === 'ja-JP' ? '日本語' :
                                          selectedLanguage === 'ko-KR' ? '한국어' :
                                          selectedLanguage === 'zh-CN' ? '中文' :
                                          selectedLanguage === 'fr-FR' ? 'Français' :
                                          selectedLanguage === 'de-DE' ? 'Deutsch' :
                                          selectedLanguage === 'es-ES' ? 'Español' : selectedLanguage})
                        </p>
                      </div>
                      {transcript ? (
                        <div className="mt-2 p-2 bg-white/80 rounded border border-red-200/50">
                          <p className="text-gray-800 font-medium mb-1">Transcript:</p>
                          <p className="text-gray-700">{transcript}</p>
                        </div>
                      ) : (
                        <p className="text-red-600 text-xs italic">Đang lắng nghe... Hãy nói vào microphone</p>
                      )}
                    </div>
                  )}
                  {speechError && (
                    <div className="p-2 bg-red-50/90 backdrop-blur-sm border border-red-200/50 rounded text-sm text-red-700">
                      <p>Lỗi: {speechError}</p>
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
                        className={isRecording ? 'bg-red-100 text-red-600 hover:bg-red-200 border-red-300 bg-white/90 backdrop-blur-sm active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed' : 'bg-white/90 backdrop-blur-sm border-white/30 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed'}
                        title={!isQuestionReady ? 'Vui lòng đợi câu hỏi hiển thị xong' : (isRecording ? 'Nhấn để dừng ghi âm' : 'Nhấn để bắt đầu ghi âm')}
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
                            Đang ghi âm
                          </p>
                          <p className="mt-1 text-white/90 max-h-20 overflow-hidden text-ellipsis whitespace-pre-line">
                            {transcript || 'Đang lắng nghe... Hãy nói vào microphone'}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                  <Button 
                    onClick={handleSubmitAnswer} 
                    disabled={!userAnswer.trim() || isLoading || !isQuestionReady}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    size="icon"
                    title={!isQuestionReady ? 'Vui lòng đợi câu hỏi hiển thị xong' : ''}
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
                Nhấn Ctrl + Enter để gửi • {isSupported && 'Nhấn icon mic để bật/tắt ghi âm'} • Chọn ngôn ngữ để ghi âm/nhập text
              </p>
            </div>
          )}

          {/* No more questions */}
          {session && !currentQuestion && (
            <div className="border-t border-white/20 bg-white/10 backdrop-blur-sm p-6 text-center">
              <h3 className="text-lg font-medium text-white mb-2 drop-shadow-lg">Tất cả câu hỏi đã hoàn thành! 🎉</h3>
              <p className="text-white/90 mb-4 drop-shadow-md">
                Bạn đã trả lời tất cả {session.totalQuestions} câu hỏi. Nhấn nút bên dưới để hoàn thành phỏng vấn và xem kết quả tổng thể.
              </p>
              <Button onClick={handleCompleteSession} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white shadow-lg">
                {isLoading ? 'Đang hoàn thành...' : 'Hoàn thành phỏng vấn'}
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
