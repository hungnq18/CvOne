"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Edit, Loader2 } from 'lucide-react';
import { getCLTemplateById, CLTemplate } from '@/api/clApi';

import Concept from '@/app/createCLTemplate/templates/concept';
import Cascade from '@/app/createCLTemplate/templates/cascade';
import Crisp from '@/app/createCLTemplate/templates/crisp';

const TemplateRenderer = ({ templateName, letterData }: { templateName: string; letterData: any }) => {
    const props = { letterData, isPreview: true };
    switch (templateName) {
        case 'concept':
            return <Concept {...props} />;
        case 'cascade':
            return <Cascade {...props} />;
        case 'crisp':
            return <Crisp {...props} />;
        default:
            return <div className="flex items-center justify-center h-full">Template not found</div>;
    }
};

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: string;
  templateTitle: string;
}

const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({ isOpen, onClose, templateId, templateTitle }) => {
    const router = useRouter();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [template, setTemplate] = useState<CLTemplate | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && templateId) {
            const fetchTemplate = async () => {
                setLoading(true);
                try {
                    const data = await getCLTemplateById(templateId);
                    if (data) {
                        setTemplate(data);
                        setFirstName(data.data.firstName || '');
                        setLastName(data.data.lastName || '');
                    }
                } catch (error) {
                    console.error("Failed to fetch template data:", error);
                    setTemplate(null);
                } finally {
                    setLoading(false);
                }
            };
            fetchTemplate();
        }
    }, [isOpen, templateId]);

    const handleUseTemplate = () => {
        if (!template) return;
        const params = new URLSearchParams({
            template: template.templateName,
            firstName: firstName,
            lastName: lastName,
        });
        router.push(`/createCLTemplate?${params.toString()}`);
    };

    if (!isOpen) return null;

    const letterData = template ? {
        ...template.data,
        firstName,
        lastName,
        signature: `${firstName} ${lastName}`,
    } : null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <div className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex overflow-hidden relative">
                <div className="flex-1 bg-gray-200 overflow-y-auto p-6 flex justify-center items-start">
                    {loading && (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                        </div>
                    )}
                    {!loading && letterData && template && (
                        <div className="bg-white w-full shadow-lg mx-auto" style={{ height: '1123px', width: '794px' }}>
                             <TemplateRenderer templateName={template.templateName} letterData={letterData} />
                        </div>
                    )}
                     {!loading && !template && (
                        <div className="flex items-center justify-center h-full text-red-500">
                            Could not load template.
                        </div>
                    )}
                </div>
                <div className="w-80 bg-white border-l border-gray-200 p-8 flex flex-col">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 uppercase tracking-wider">{templateTitle}</h2>
                    <div className="flex-1 space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-2">First Name</label>
                            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                        </div>
                         <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-2">Last Name</label>
                            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <button onClick={handleUseTemplate} className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5" disabled={loading || !template}>
                            <span className="flex items-center justify-center">
                                <Edit className="w-5 h-5 mr-2" />
                                Dùng mẫu này
                            </span>
                        </button>
                        <button onClick={onClose} className="w-full bg-white text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors border border-gray-300">Đóng lại</button>
                    </div>
                </div>
                 <button onClick={onClose} className="absolute top-4 right-[21rem] text-gray-400 hover:text-gray-800 transition-colors z-10">
                    <X size={28} />
                 </button>
            </div>
        </div>
    );
};

export default TemplatePreviewModal;