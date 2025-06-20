"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from "react";
import { ArrowLeft, ArrowRight } from 'lucide-react';

const workStyles = [
  {
    title: "ARTISTIC",
    description: "You thrive in dynamic environments driven by innovation and creativity.",
  },
  {
    title: "ENTERPRISING",
    description: "You're accustomed to leading teams with empowering and decisive task delegation.",
  },
  {
    title: "INVESTIGATIVE",
    description: "You bring a resourceful approach with a knack for problem-solving.",
  },
  {
    title: "ORGANIZED",
    description: "You bring structure and focus to streamline tasks.",
  },
  {
    title: "PRACTICAL",
    description: "You go above and beyond to meet goals and ensure timely task completion.",
  },
  {
    title: "SERVICE-ORIENTED",
    description: "You excel in collaborative situations and enjoy helping others.",
  },
];

export default function WorkStylePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    if (!selectedStyle) return;

    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.append('workStyle', selectedStyle);
    router.push(`/work-history?${currentParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-4xl">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            What's your working style?
          </h1>
          <p className="text-gray-600 text-lg">
            This helps us personalize the tone of your letter.
          </p>
        </div>

        {/* Work Style Cards Grid */}
        <div className="grid grid-cols-3 gap-6 mb-16">
          {workStyles.map((style, index) => (
            <div
              key={index}
              className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                selectedStyle === style.title
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 bg-white hover:border-gray-400"
              }`}
              onClick={() => setSelectedStyle(style.title)}
            >
              {/* Header with dark background */}
              <div className={`-mx-6 -mt-6 mb-4 px-6 py-4 rounded-t-lg ${
                selectedStyle === style.title ? "bg-blue-600" : "bg-gray-800"
              }`}>
                <h3 className="font-bold text-white text-center text-sm">
                  {style.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-center text-gray-700 text-sm leading-relaxed">
                {style.description}
              </p>
            </div>
          ))}
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
            disabled={!selectedStyle}
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