"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

const strengthsList = [
    "Collaboration", "Communication", "Critical thinking", "Customer service",
    "Decision-making", "Delegation", "Innovation", "Interpersonal",
    "Leadership", "Management", "Motivation", "Observation",
    "Organization", "Planning", "Problem-solving", "Team-building",
    "Teamwork", "Time-management"
];

const ProgressBar = ({ step }: { step: number }) => {
    const steps = ["Target Job", "Background", "Work Style", "Finalize"];
    return (
        <div className="flex items-center justify-center w-full max-w-2xl mb-16">
            {steps.map((name, index) => (
                <React.Fragment key={name}>
                    <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${index + 1 === step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {index + 1}
                        </div>
                        <p className={`mt-2 text-sm font-medium ${index + 1 === step ? 'text-blue-600' : 'text-gray-500'}`}>{name}</p>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`flex-1 h-1 mx-4 ${index < step - 1 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};


function StrengthsContent() {
    const router = useRouter();
    const [selectedStrengths, setSelectedStrengths] = useState<string[]>([]);

    useEffect(() => {
        const savedDataString = localStorage.getItem('coverLetterData');
        if (savedDataString) {
            const coverLetterData = JSON.parse(savedDataString);
            if (coverLetterData.strengths) {
                setSelectedStrengths(coverLetterData.strengths);
            }
        }
    }, []);

    const handleToggleStrength = (strength: string) => {
        setSelectedStrengths(prev => {
            if (prev.includes(strength)) {
                return prev.filter(s => s !== strength);
            }
            if (prev.length < 3) {
                return [...prev, strength];
            }
            return prev;
        });
    };

    const handleContinue = () => {
        const savedDataString = localStorage.getItem('coverLetterData');
        const coverLetterData = savedDataString ? JSON.parse(savedDataString) : {};

        const updatedData = { ...coverLetterData, strengths: selectedStrengths };
        localStorage.setItem('coverLetterData', JSON.stringify(updatedData));

        router.push(`/work-style`);
    };

    const handleBack = () => {
        router.back();
    };

    const remainingStrengths = strengthsList.filter(strength => !selectedStrengths.includes(strength));

    return (
        <div className="min-h-screen bg-white flex flex-col items-center py-12 px-4 mt-16">
            <div className="w-full max-w-4xl flex flex-col items-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
                    Choose your top 3 strengths.
                </h1>
                <p className="text-gray-500 mb-10 text-center">
                    We'll highlight these in your cover letter to help match your strengths to the desired position.
                </p>

                {/* Selected Strengths Section */}
                <div className="flex flex-wrap gap-4 mb-8 justify-center">
                    {selectedStrengths.map((strength, index) => (
                        <button
                            key={strength}
                            onClick={() => handleToggleStrength(strength)}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md transition-all duration-200 hover:bg-blue-700"
                        >
                            {strength}
                            <Check size={18} />
                        </button>
                    ))}
                    {Array.from({ length: 3 - selectedStrengths.length }).map((_, index) => (
                        <div
                            key={`placeholder-${index}`}
                            className="px-6 py-3 bg-gray-100 text-gray-400 rounded-md border-2 border-dashed border-gray-300"
                        >
                            Strength {selectedStrengths.length + index + 1}
                        </div>
                    ))}
                </div>

                {/* Remaining Strengths Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-16">
                    {remainingStrengths.map(strength => (
                        <button
                            key={strength}
                            onClick={() => handleToggleStrength(strength)}
                            className="flex items-center justify-center gap-2 px-4 py-2 border rounded-md transition-all duration-200
                                bg-white text-gray-700 border-gray-300 hover:border-gray-500"
                        >
                            {strength}
                            <span className="text-lg">+</span>
                        </button>
                    ))}
                </div>

                <div className="flex w-full justify-between max-w-4xl mx-auto px-4">
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
                        disabled={selectedStrengths.length === 0}
                    >
                        Continue
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function StrengthsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <StrengthsContent />
        </Suspense>
    );
}