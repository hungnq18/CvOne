"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, FilePlus, FileText } from 'lucide-react';

function ApplyOptionContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const jobId = searchParams.get('jobId');
    const [selectedOption, setSelectedOption] = useState('existing');

    const handleContinue = () => {
        
        if (!jobId) {
            router.back();
            return;
        }
        const params = new URLSearchParams({ jobId });

        if (selectedOption === 'existing') {
            router.push(`/user/apply?${params.toString()}`);
        } else if (selectedOption === 'new') {
            router.push(`/createCV?${params.toString()}`);
        }
    };

    const handleBack = () => {
        router.back();
    };

    const OptionCard = ({ id, icon, title, description }: { id: string, icon: React.ReactNode, title: string, description: string }) => {
        const isSelected = selectedOption === id;
        return (
            <div
                onClick={() => setSelectedOption(id)}
                className={`flex flex-col items-center justify-center border rounded-lg cursor-pointer transition-all duration-200 w-80 h-48
                    ${isSelected ? 'border-blue-500 border-2 shadow-lg' : 'border-gray-300 hover:border-blue-400 hover:shadow-md'}
                `}
            >
                <div className="text-blue-500 mb-4">{icon}</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 text-center">{description}</p>
            </div>
        );
    };

    return (
        <div className="bg-white flex flex-col items-center justify-center py-12 min-h-screen">
            <div className="w-full max-w-5xl flex flex-col items-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-12">
                    How do you want to apply for this job?
                </h1>
                <div className="flex flex-wrap justify-center gap-8 mb-16">
                    <OptionCard
                        id="existing"
                        icon={<FileText size={40} />}
                        title="Use AI for Existing CV"
                        description="Choose from your saved CVs."
                    />
                    <OptionCard
                        id="new"
                        icon={<FilePlus size={40} />}
                        title="Create New CV"
                        description="Create a new CV for this job."
                    />
                </div>
            </div>
            <div className="flex w-full justify-between max-w-2xl">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 px-8 py-3 text-lg font-semibold text-gray-700 bg-white border border-gray-400 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back
                </button>
                <button
                    onClick={handleContinue}
                    className="flex items-center gap-2 px-8 py-3 text-lg font-semibold text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-colors"
                >
                    Continue
                    <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
}

export default function ApplyOptionPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ApplyOptionContent />
        </Suspense>
    );
} 