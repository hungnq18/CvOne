"use client";

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Briefcase, FileText, Play, Settings, Sparkles, X } from 'lucide-react';
import { useState } from 'react';

interface InterviewSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartInterview: (config: InterviewConfig) => void;
}

export interface InterviewConfig {
  jobDescription: string;
  jobTitle?: string;
  companyName?: string;
  numberOfQuestions: number;
  // difficulty tự động xác định từ JD
}

const questionCounts = [
  { value: 5, label: '5 questions (Quick practice)' },
  { value: 10, label: '10 questions (Standard session)' },
  { value: 15, label: '15 questions (Comprehensive session)' },
  { value: 20, label: '20 questions (Full interview simulation)' }
];

export default function InterviewSetupModal({ isOpen, onClose, onStartInterview }: InterviewSetupModalProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartInterview = async () => {
    if (!jobDescription.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const config: InterviewConfig = {
        jobDescription: jobDescription.trim(),
        jobTitle: jobTitle.trim() || undefined,
        companyName: companyName.trim() || undefined,
        numberOfQuestions
      };
      
      onStartInterview(config);
      onClose();
    } catch (error) {
      console.error('Error starting interview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Play className="h-6 w-6 text-blue-600" />
            AI Interview Setup
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Job Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Job Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">
                    Job Title <span className="text-gray-400">(Optional)</span>
                  </Label>
                  <Input
                    id="jobTitle"
                    placeholder="e.g. Senior Backend Developer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    Company Name <span className="text-gray-400">(Optional)</span>
                  </Label>
                  <Input
                    id="companyName"
                    placeholder="e.g. Google"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Job Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="jobDescription">
                  Paste the job description you want to practice for:
                </Label>
                <Textarea
                  id="jobDescription"
                  placeholder="Paste the job description here. The AI will analyze it and automatically determine the appropriate difficulty level..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[200px]"
                />
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Sparkles className="h-4 w-4" />
                  <p>
                    <strong>AI Auto-Difficulty:</strong> Interview difficulty will be automatically determined based on experience requirements and role seniority.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interview Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Interview Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Number of Questions */}
              <div className="space-y-2">
                <Label htmlFor="questionCount">Number of Questions</Label>
                <Select value={numberOfQuestions.toString()} onValueChange={(value) => setNumberOfQuestions(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {questionCounts.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Features Info */}
          <Alert>
            <AlertDescription>
              <strong>AI Interview Features:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>✨ Auto-determined difficulty from job description</li>
                <li>• Personalized questions based on job requirements</li>
                <li>• Real-time AI feedback and scoring</li>
                <li>• Sample answers and tips</li>
                <li>• Follow-up questions for deeper discussion</li>
                <li>• Overall performance analysis</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleStartInterview}
              disabled={!jobDescription.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Starting...' : 'Start AI Interview'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
