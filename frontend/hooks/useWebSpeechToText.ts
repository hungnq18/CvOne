import { useEffect, useRef, useState } from 'react';

interface WebSpeechToTextOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onStop?: () => void;
}

interface WebSpeechToTextResult {
  isRecording: boolean;
  transcript: string;
  isSupported: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  setLanguage: (language: string) => void;
  resetTranscript: () => void;
  error: string | null;
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
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef<string>('');
  const pendingStopRef = useRef<boolean>(false);

  useEffect(() => {
    // Kiểm tra browser support
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Trình duyệt của bạn không hỗ trợ Web Speech API. Vui lòng sử dụng Chrome, Edge, hoặc Safari.');
      return;
    }

    setIsSupported(true);

    // Tạo SpeechRecognition instance
    const recognition = new SpeechRecognition();
    recognition.continuous = options.continuous ?? true;
    recognition.interimResults = options.interimResults ?? true;
    recognition.lang = options.language || 'vi-VN';
    
    recognitionRef.current = recognition;

    // Xử lý kết quả
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Cập nhật transcript
      if (finalTranscript) {
        finalTranscriptRef.current += finalTranscript;
        const fullTranscript = finalTranscriptRef.current.trim() + ' ' + interimTranscript;
        setTranscript(fullTranscript.trim());
        
        // Gọi callback với final transcript
        if (options.onTranscript) {
          options.onTranscript(finalTranscriptRef.current.trim(), true);
        }
      } else if (interimTranscript) {
        const fullTranscript = finalTranscriptRef.current.trim() + ' ' + interimTranscript;
        setTranscript(fullTranscript.trim());
        
        // Gọi callback với interim transcript
        if (options.onTranscript) {
          options.onTranscript(fullTranscript.trim(), false);
        }
      }
    };

    // Xử lý lỗi
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = 'Lỗi nhận dạng giọng nói';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'Không phát hiện giọng nói. Vui lòng thử lại.';
          break;
        case 'audio-capture':
          errorMessage = 'Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.';
          break;
        case 'not-allowed':
          errorMessage = 'Quyền truy cập microphone bị từ chối. Vui lòng cấp quyền trong cài đặt trình duyệt.';
          break;
        case 'network':
          errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.';
          break;
        case 'aborted':
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
      setError(null);
      // Nếu người dùng đã yêu cầu dừng trước khi recognition kịp start
      if (pendingStopRef.current && recognitionRef.current) {
        pendingStopRef.current = false;
        try {
          recognitionRef.current.stop();
        } catch (error: any) {
          setError(error.message || 'Không thể dừng ghi âm');
        }
      }
      if (options.onStart) {
        options.onStart();
      }
    };

    // Khi kết thúc
    recognition.onend = () => {
      setIsRecording(false);
      // Update transcript state với final transcript khi recording kết thúc
      setTranscript(finalTranscriptRef.current.trim());
      if (options.onStop) {
        options.onStop();
      }
    };

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors khi cleanup
        }
      }
    };
  }, [options.continuous, options.interimResults]);

  // Update language when it changes (if not currently recording)
  useEffect(() => {
    if (recognitionRef.current && !isRecording && options.language) {
      recognitionRef.current.lang = options.language;
    }
  }, [options.language, isRecording]);

  const startRecording = () => {
    if (!isSupported) {
      setError('Web Speech API không được hỗ trợ trên trình duyệt này');
      return;
    }

    if (recognitionRef.current && !isRecording) {
      try {
        // Only keep existing transcript if it's not empty (user continuing to record for same question)
        // If transcript is empty, start fresh (new question)
        if (transcript.trim()) {
          finalTranscriptRef.current = transcript;
        } else {
          finalTranscriptRef.current = '';
        }
        recognitionRef.current.start();
      } catch (error: any) {
        setError(error.message || 'Không thể bắt đầu ghi âm');
        if (options.onError) {
          options.onError(error.message || 'Không thể bắt đầu ghi âm');
        }
      }
    }
  };

  const stopRecording = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      try {
        recognitionRef.current.stop();
      } catch (error: any) {
        // Nếu stop thất bại (ví dụ chưa start hoàn toàn), fallback sang abort
        try {
          recognitionRef.current.abort();
        } catch {
          pendingStopRef.current = true;
        }
        setError(error.message || 'Không thể dừng ghi âm');
      }
    } else {
      // Nếu ghi âm chưa start hoàn toàn nhưng người dùng đã thả nút, ghi nhận để stop ngay khi start
      pendingStopRef.current = true;
    }
  };

  const setLanguage = (language: string) => {
    if (recognitionRef.current && !isRecording) {
      recognitionRef.current.lang = language;
    }
  };

  const resetTranscript = () => {
    // Reset transcript state and ref when moving to new question
    setTranscript('');
    finalTranscriptRef.current = '';
  };

  return {
    isRecording,
    transcript,
    isSupported,
    startRecording,
    stopRecording,
    setLanguage,
    resetTranscript,
    error,
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

