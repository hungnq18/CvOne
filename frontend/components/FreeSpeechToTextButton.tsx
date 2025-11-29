import React, { useState } from 'react';
import { useWebSpeechToText } from '../hooks/useWebSpeechToText';

interface FreeSpeechToTextButtonProps {
  onTranscript?: (transcript: string) => void;
  language?: string;
  className?: string;
  disabled?: boolean;
  showTranscript?: boolean;
}

/**
 * Component button sử dụng Web Speech API - HOÀN TOÀN MIỄN PHÍ
 * Không cần server, không tốn chi phí, hoạt động trực tiếp trên browser
 * 
 * @example
 * ```tsx
 * <FreeSpeechToTextButton 
 *   onTranscript={(text) => setAnswer(text)}
 *   language="vi-VN"
 * />
 * ```
 */
export const FreeSpeechToTextButton: React.FC<FreeSpeechToTextButtonProps> = ({
  onTranscript,
  language = 'vi-VN',
  className = '',
  disabled = false,
  showTranscript = true,
}) => {
  const { 
    isRecording, 
    transcript, 
    isSupported,
    startRecording, 
    stopRecording, 
    error 
  } = useWebSpeechToText({
    language,
    continuous: true,
    interimResults: true,
    onTranscript: (text, isFinal) => {
      if (isFinal && onTranscript) {
        onTranscript(text);
      }
    },
    onError: (err) => {
      console.error('Speech-to-text error:', err);
    },
  });

  const handleToggle = () => {
    if (isRecording) {
      stopRecording();
      // Gửi transcript cuối cùng khi dừng
      if (transcript && onTranscript) {
        onTranscript(transcript);
      }
    } else {
      startRecording();
    }
  };

  if (!isSupported) {
    return (
      <div className={`speech-error ${className}`}>
        <p>⚠️ Trình duyệt không hỗ trợ. Vui lòng sử dụng Chrome, Edge hoặc Safari.</p>
      </div>
    );
  }

  return (
    <div className={`free-speech-container ${className}`}>
      <button
        onClick={handleToggle}
        disabled={disabled}
        className={`
          speech-button
          ${isRecording ? 'recording' : ''}
          ${error ? 'error' : ''}
        `}
        title={isRecording ? 'Nhấn để dừng ghi âm (MIỄN PHÍ)' : 'Nhấn để bắt đầu ghi âm (MIỄN PHÍ)'}
      >
        {isRecording ? (
          <>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            <span>Đang ghi âm (MIỄN PHÍ)...</span>
          </>
        ) : (
          <>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            <span>Bắt đầu ghi âm (MIỄN PHÍ)</span>
          </>
        )}
      </button>

      {showTranscript && (isRecording || transcript) && (
        <div className="transcript-preview">
          <p className="transcript-label">Văn bản:</p>
          <p className="transcript-text">{transcript || 'Đang nghe...'}</p>
          {isRecording && (
            <p className="recording-indicator">● Đang ghi âm...</p>
          )}
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
        </div>
      )}

      <style jsx>{`
        .free-speech-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .speech-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
        }

        .speech-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
          transform: translateY(-1px);
        }

        .speech-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .speech-button.recording {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
          animation: pulse 2s infinite;
        }

        .speech-button.recording:hover:not(:disabled) {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
        }

        .speech-button.error {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        .transcript-preview {
          padding: 12px;
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          min-height: 80px;
        }

        .transcript-label {
          margin: 0 0 8px 0;
          color: #6b7280;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .transcript-text {
          margin: 0 0 8px 0;
          color: #1f2937;
          font-size: 14px;
          line-height: 1.6;
          min-height: 40px;
        }

        .recording-indicator {
          margin: 0;
          color: #ef4444;
          font-size: 12px;
          font-weight: 500;
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .error-message {
          padding: 8px 12px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          color: #991b1b;
          font-size: 12px;
        }

        .speech-error {
          padding: 12px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 6px;
          color: #92400e;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
};

