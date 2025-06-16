"use client";

import { useState, useEffect } from 'react';
import TemplateCLSection from '@/components/sections/pageCLTemplate-section';
import HeaderCLSection from '@/components/sections/header-pageclTemplate-section';
import { getCLTemplates, CLTemplate } from '@/api/clApi';

export default function CLTemplatePage() {
    const [templates, setTemplates] = useState<CLTemplate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const data = await getCLTemplates();
                setTemplates(data);
            } catch (error) {
                console.error("Failed to fetch CL templates:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <HeaderCLSection />
                {loading ? (
                    <p>Loading templates...</p>
                ) : (
                    <TemplateCLSection clTemplates={templates} />
                )}
            </div>
        </div>
    );
}