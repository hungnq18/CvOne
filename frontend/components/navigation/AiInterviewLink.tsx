"use client";

import { Button } from '@/components/ui/button';
import { Brain, Play } from 'lucide-react';
import Link from 'next/link';

interface AiInterviewLinkProps {
  variant?: 'button' | 'link' | 'card';
  className?: string;
}

export default function AiInterviewLink({ variant = 'button', className = '' }: AiInterviewLinkProps) {
  if (variant === 'card') {
    return (
      <Link href="/ai-interview" className={`block ${className}`}>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 hover:shadow-md transition-shadow border border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-600 rounded-full p-2">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">AI Interview Practice</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Practice interview skills with AI-powered questions tailored to your job description.
          </p>
          <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
            <Play className="h-4 w-4" />
            Start Practice
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'link') {
    return (
      <Link href="/ai-interview" className={`flex items-center gap-2 text-blue-600 hover:text-blue-700 ${className}`}>
        <Brain className="h-4 w-4" />
        <span>AI Interview Practice</span>
      </Link>
    );
  }

  return (
    <Link href="/ai-interview">
      <Button className={`bg-blue-600 hover:bg-blue-700 ${className}`}>
        <Brain className="h-4 w-4 mr-2" />
        AI Interview Practice
      </Button>
    </Link>
  );
}
