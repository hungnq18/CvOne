"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

export default function CustomizePage() {
  const router = useRouter();

  const [hasSpecificJob, setHasSpecificJob] = useState<boolean | null>(null);
  const [jobTitle, setJobTitle] = useState<string>("");
  const [targetCompany, setTargetCompany] = useState<string>("");
  const [hasJobDescription, setHasJobDescription] = useState<boolean | null>(null);

  useEffect(() => {
    const savedDataString = localStorage.getItem('coverLetterData');
    if (savedDataString) {
        const coverLetterData = JSON.parse(savedDataString);
        setHasSpecificJob(coverLetterData.hasSpecificJob ?? null);
        setJobTitle(coverLetterData.targetJobTitle || "");
        setTargetCompany(coverLetterData.targetCompany || "");
        setHasJobDescription(coverLetterData.hasJobDescription ?? null);
    }
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    const savedDataString = localStorage.getItem('coverLetterData');
    const coverLetterData = savedDataString ? JSON.parse(savedDataString) : {};

    const updatedData = {
        ...coverLetterData,
        hasSpecificJob: hasSpecificJob,
        targetJobTitle: jobTitle,
        targetCompany: targetCompany,
        hasJobDescription: hasJobDescription
    };

    localStorage.setItem('coverLetterData', JSON.stringify(updatedData));


    if (hasSpecificJob && hasJobDescription) {
        router.push(`/job-description`);
    } else {
        // Assuming the next step is to finalize/create the letter
        router.push(`/createCLTemplate`);
    }
  };

  const isFormComplete = () => {
    if (hasSpecificJob === null) return false;
    if (hasSpecificJob === false) return true;
    if (!jobTitle.trim() || !targetCompany.trim()) return false;
    return hasJobDescription !== null;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl space-y-12">

        {/* First Question: Do you have a specific job in mind? */}
        <div className="text-center space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Do you have a specific job in mind?
            </h1>
            <p className="text-gray-600 text-lg">
              Either way, our AI will craft a cover letter you can customize later.
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setHasSpecificJob(true)}
              className={`px-8 py-3 rounded-lg border-2 transition-all duration-200 ${
                hasSpecificJob === true
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => setHasSpecificJob(false)}
              className={`px-8 py-3 rounded-lg border-2 transition-all duration-200 ${
                hasSpecificJob === false
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
              }`}
            >
              Not Yet
            </button>
          </div>
        </div>

        {/* Second Section: What job are you applying for? - Only show if hasSpecificJob is true */}
        {hasSpecificJob === true && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 text-center">
              What job are you applying for?
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide">
                  JOB TITLE
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="jobTitle"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Customer Service Representative"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:border-blue-500 transition-colors pr-10"
                  />
                  {jobTitle.trim() && (
                    <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" size={20} />
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="targetCompany" className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide">
                  TARGET COMPANY
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="targetCompany"
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    placeholder="e.g. FPT Software"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:border-blue-500 transition-colors pr-10"
                  />
                  {targetCompany.trim() && (
                    <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" size={20} />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Third Section: Do you have a job description? - Only show if both inputs are filled */}
        {hasSpecificJob === true && jobTitle.trim() && targetCompany.trim() && (
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Do you have a job description?
            </h2>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setHasJobDescription(true)}
                className={`px-8 py-3 rounded-lg border-2 transition-all duration-200 ${
                  hasJobDescription === true
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => setHasJobDescription(false)}
                className={`px-8 py-3 rounded-lg border-2 transition-all duration-200 ${
                  hasJobDescription === false
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                Not Yet
              </button>
            </div>
          </div>
        )}

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
            disabled={!isFormComplete()}
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