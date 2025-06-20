"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from "react";
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function WorkHistoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [jobTitle, setJobTitle] = useState<string>("");

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    if (!jobTitle.trim()) return;

    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.append('jobTitle', jobTitle.trim());
    router.push(`/customize?${currentParams.toString()}`);
  };

  return (
    <div className="bg-white flex flex-col items-center justify-center py-12 px-4 min-h-screen">
      <div className="w-full max-w-2xl">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            What's your most recent job title?
          </h1>
          <p className="text-gray-600 text-lg">
            Include your current employment or last job.
          </p>
        </div>

        {/* Job Title Input Section */}
        <div className="mb-16">
          <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide">
            JOB TITLE
          </label>
          <input
            type="text"
            id="jobTitle"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Customer Service Representative"
            className="w-full px-4 py-3 border-2 border-blue-500 rounded-lg text-lg focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-8 py-3 text-lg font-semibold text-gray-700 bg-white border border-gray-400 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <button
            onClick={handleContinue}
            disabled={!jobTitle.trim()}
            className="flex items-center gap-2 px-8 py-3 text-lg font-semibold text-white bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}