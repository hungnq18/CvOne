"use client";

import { aiInterviewApi, InterviewFeedback, InterviewQuestion, InterviewSession } from '@/api/aiInterviewApi';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Lightbulb, Mic, MicOff, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AiInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobDescription: string;
}

export default function AiInterviewModal({ isOpen, onClose, jobDescription }: AiInterviewModalProps) {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);
  const [sampleAnswer, setSampleAnswer] = useState('');
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [showFollowUp, setShowFollowUp] = useState(false);

  useEffect(() => {
    if (isOpen && jobDescription) {
      initializeInterview();
    }
  }, [isOpen, jobDescription]);

  const initializeInterview = async () => {
    setIsLoading(true);
    try {
      const response = await aiInterviewApi.createInterviewSession({
        jobDescription,
        numberOfQuestions: 10,
        difficulty: 'medium'
      });

      if (response.success && response.data) {
        setSession(response.data);
        loadCurrentQuestion(response.data.sessionId);
      }
    } catch (error) {
      console.error('Error initializing interview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCurrentQuestion = async (sessionId: string) => {
    try {
      const response = await aiInterviewApi.getCurrentQuestion(sessionId);
      if (response.success && response.data) {
        setCurrentQuestion(response.data);
        setUserAnswer('');
        setFeedback(null);
        setShowSampleAnswer(false);
        setShowFollowUp(false);
      }
    } catch (error) {
      console.error('Error loading current question:', error);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!session || !currentQuestion || !userAnswer.trim()) return;

    setIsLoading(true);
    try {
      const response = await aiInterviewApi.submitAnswer(session.sessionId, {
        questionId: currentQuestion.id,
        answer: userAnswer
      });

      if (response.success && response.data) {
        setFeedback(response.data.feedback);
        setShowFollowUp(true);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!session) return;
    await loadCurrentQuestion(session.sessionId);
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
      if (response.success) {
        // Show completion message or redirect
        alert('Interview completed! Check your overall feedback.');
        onClose();
      }
    } catch (error) {
      console.error('Error completing session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Implement voice recording logic here
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">AI Interview Practice</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Progress */}
          {session && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{session.completedQuestions}/{session.totalQuestions}</span>
              </div>
              <Progress 
                value={(session.completedQuestions / session.totalQuestions) * 100} 
                className="h-2"
              />
            </div>
          )}

          {/* Current Question */}
          {currentQuestion && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Question {(session?.currentQuestionIndex || 0) + 1} of {session?.totalQuestions}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{currentQuestion.category}</Badge>
                    <Badge variant={currentQuestion.difficulty === 'easy' ? 'default' : 
                                 currentQuestion.difficulty === 'medium' ? 'secondary' : 'destructive'}>
                      {currentQuestion.difficulty}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg font-medium">{currentQuestion.question}</p>
                
                {currentQuestion.tips && currentQuestion.tips.length > 0 && (
                  <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Tips:</strong> {currentQuestion.tips.join(', ')}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Answer Input */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Textarea
                      placeholder="Type your answer here..."
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className="min-h-[120px]"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleRecording}
                      className={isRecording ? 'bg-red-100 text-red-600' : ''}
                    >
                      {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSubmitAnswer} disabled={!userAnswer.trim() || isLoading}>
                      {isLoading ? 'Submitting...' : 'Submit Answer'}
                    </Button>
                    <Button variant="outline" onClick={handleGetSampleAnswer} disabled={isLoading}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Sample Answer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sample Answer */}
          {showSampleAnswer && sampleAnswer && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sample Answer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{sampleAnswer}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => setShowSampleAnswer(false)}
                >
                  Hide Sample Answer
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Feedback */}
          {feedback && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{feedback.score}/10</div>
                    <div className="text-sm text-gray-500">Score</div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700">{feedback.feedback}</p>
                  </div>
                </div>

                {feedback.strengths.length > 0 && (
                  <div>
                    <h4 className="font-medium text-green-700 mb-2">Strengths:</h4>
                    <ul className="list-disc list-inside text-sm text-green-600">
                      {feedback.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {feedback.improvements.length > 0 && (
                  <div>
                    <h4 className="font-medium text-orange-700 mb-2">Areas for Improvement:</h4>
                    <ul className="list-disc list-inside text-sm text-orange-600">
                      {feedback.improvements.map((improvement, index) => (
                        <li key={index}>{improvement}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {feedback.suggestions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-blue-700 mb-2">Suggestions:</h4>
                    <ul className="list-disc list-inside text-sm text-blue-600">
                      {feedback.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={handleNextQuestion}>
                    Next Question
                  </Button>
                  {showFollowUp && (
                    <Button variant="outline" onClick={handleGenerateFollowUp} disabled={isLoading}>
                      Generate Follow-up Question
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Follow-up Question */}
          {followUpQuestion && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Follow-up Question</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{followUpQuestion}</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setFollowUpQuestion('')}
                >
                  Hide Follow-up
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Session Controls */}
          {session && (
            <div className="flex justify-between items-center pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Exit Interview
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCompleteSession} disabled={isLoading}>
                  Complete Session
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
