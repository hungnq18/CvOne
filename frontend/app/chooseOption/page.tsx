"use client";

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Bot, FileUp, Smile } from 'lucide-react';

function ChooseOptionContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const templateId = searchParams.get('templateId');
    const [selectedOption, setSelectedOption] = useState('manual');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='));
        setIsLoggedIn(!!token);
    }, []);

    const handleContinue = () => {
        if (!templateId) {
            router.push('/clTemplate');
            return;
        }

        const params = new URLSearchParams({ templateId });
        const destination = `/personal-info?${params.toString()}`; // for 'ai'
        const uploadDestination = `/uploadCLTemplate?${params.toString()}`;

        if (selectedOption === 'manual') {
            router.push(`/createCLTemplate?${params.toString()}`);
        } else if (selectedOption === 'ai') {
            if (isLoggedIn) {
                router.push(destination);
            } else {
                router.push(`/login?redirect=${destination}`);
            }
        } else if (selectedOption === 'upload') {
            if (isLoggedIn) {
                router.push(uploadDestination);
            } else {
                router.push(`/login?redirect=${uploadDestination}`);
            }
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
        <div className=" bg-white flex flex-col items-center justify-center py-12 min-h-screen">
            <div className="w-full max-w-5xl flex flex-col items-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-12">
                    How do you want to start your cover letter?
                </h1>

                <div className="flex flex-wrap justify-center gap-8 mb-16">
                    <OptionCard
                        id="ai"
                        icon={<Bot size={40} />}
                        title="Generate by AI"
                        description="We'll generate the cover letter for you."
                    />
                    <OptionCard
                        id="manual"
                        icon={<Smile size={40} />}
                        title="Generate by manual"
                        description="We'll start from the beginning."
                    />
                    <OptionCard
                        id="upload"
                        icon={<FileUp size={40} />}
                        title="Upload cover letter"
                        description="We'll extract information from your cover letter."
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

export default function ChooseOptionPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ChooseOptionContent />
        </Suspense>
    );
}