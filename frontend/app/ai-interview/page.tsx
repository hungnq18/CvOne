"use client";

import AiInterviewModal from '@/components/ai-interview/AiInterviewModal';
import InterviewHistory from '@/components/ai-interview/InterviewHistory';
import InterviewSetupModal, { InterviewConfig } from '@/components/ai-interview/InterviewSetupModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Clock, History, Play, Star, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';

export default function AiInterviewPage() {
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [interviewConfig, setInterviewConfig] = useState<InterviewConfig | null>(null);

  const handleStartInterview = (config: InterviewConfig) => {
    setInterviewConfig(config);
    setShowInterviewModal(true);
  };

  const handleCloseInterview = () => {
    setShowInterviewModal(false);
    setInterviewConfig(null);
  };

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Questions',
      description: 'Personalized questions generated based on your job description and requirements.'
    },
    {
      icon: TrendingUp,
      title: 'Real-time Feedback',
      description: 'Get instant AI feedback on your answers with detailed scoring and suggestions.'
    },
    {
      icon: Users,
      title: 'Interview Simulation',
      description: 'Practice with realistic interview scenarios and follow-up questions.'
    },
    {
      icon: Clock,
      title: 'Flexible Timing',
      description: 'Practice at your own pace with customizable session lengths.'
    }
  ];

  const stats = [
    { label: 'Practice Sessions', value: '12', icon: Play },
    { label: 'Average Score', value: '8.2/10', icon: Star },
    { label: 'Total Time', value: '4h 30m', icon: Clock },
    { label: 'Questions Answered', value: '156', icon: Brain }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Interview Practice
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Practice your interview skills with AI-powered questions tailored to your job description. 
            Get instant feedback and improve your performance.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4 text-center">
                <stat.icon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Start New Interview */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-6 w-6 text-blue-600" />
                Start New Interview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Begin a new AI-powered interview practice session. Upload your job description 
                and get personalized questions.
              </p>
              <div className="space-y-2">
                <Badge variant="outline">Personalized Questions</Badge>
                <Badge variant="outline">Real-time Feedback</Badge>
                <Badge variant="outline">Follow-up Questions</Badge>
              </div>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowSetupModal(true)}
              >
                Start Interview Practice
              </Button>
            </CardContent>
          </Card>

          {/* View History */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-6 w-6 text-green-600" />
                Interview History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Review your past interview sessions, track your progress, and see how you've improved over time.
              </p>
              <div className="space-y-2">
                <Badge variant="outline">Progress Tracking</Badge>
                <Badge variant="outline">Performance Analytics</Badge>
                <Badge variant="outline">Session History</Badge>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowHistory(true)}
              >
                View History
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Why Choose AI Interview Practice?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <feature.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center text-2xl">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Upload Job Description</h3>
                <p className="text-gray-600">
                  Paste the job description you're applying for to get relevant questions.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Answer Questions</h3>
                <p className="text-gray-600">
                  Practice answering interview questions and get real-time AI feedback.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Improve & Repeat</h3>
                <p className="text-gray-600">
                  Review feedback, practice more, and track your improvement over time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        <InterviewSetupModal
          isOpen={showSetupModal}
          onClose={() => setShowSetupModal(false)}
          onStartInterview={handleStartInterview}
        />

        {interviewConfig && (
          <AiInterviewModal
            isOpen={showInterviewModal}
            onClose={handleCloseInterview}
            jobDescription={interviewConfig.jobDescription}
          />
        )}

        {showHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold">Interview History</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)}>
                  ×
                </Button>
              </div>
              <div className="p-6">
                <InterviewHistory />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
