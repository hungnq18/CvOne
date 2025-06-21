"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function JobDescriptionPage() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState<string>("");

  useEffect(() => {
    const savedDataString = localStorage.getItem('coverLetterData');
    if (savedDataString) {
        const coverLetterData = JSON.parse(savedDataString);
        if (coverLetterData.jobDescription) {
            setJobDescription(coverLetterData.jobDescription);
        }
    }
    }, []);

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    const savedDataString = localStorage.getItem('coverLetterData');
    const coverLetterData = savedDataString ? JSON.parse(savedDataString) : {};

    const updatedData = { ...coverLetterData, jobDescription: jobDescription.trim() };
    localStorage.setItem('coverLetterData', JSON.stringify(updatedData));

    router.push(`/createCLTemplate`);
  };

  const maxLength = 5000;
  const currentLength = jobDescription.length;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl space-y-8">

        {/* Main Content */}
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Add job description
            </h1>
          </div>

          <div className="space-y-2">
            <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 uppercase tracking-wide">
              JOB DESCRIPTION
            </label>
            <div className="relative">
              <textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste details of the job description including requirements and responsibilities."
                maxLength={maxLength}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {currentLength} / {maxLength}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-8 py-3 text-lg font-semibold text-gray-700 bg-white border border-gray-400 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <button
            onClick={handleContinue}
            className="flex items-center gap-2 px-8 py-3 text-lg font-semibold text-white bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors"
          >
            Finish
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}