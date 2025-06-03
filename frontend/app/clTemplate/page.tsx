import { Typography } from 'antd';
import TemplateSection from '@/components/sections/pageCLTemplate-section';
import HeaderSection from '@/components/sections/header-pageclTemplate-section';

// Dữ liệu mẫu nhúng trực tiếp
const cvTemplates = [
    {
        id: 1,
        imageUrl: '/template-cv/0e5fda43-6a21-439c-9148-7780278cba2c.jpg',
        title: 'Modern CV Template',
        isRecommended: true,
    },
    {
        id: 2,
        imageUrl: '/template-cv/0e5fda43-6a21-439c-9148-7780278cba2c.jpg',
        title: 'Professional CV Template',
        isRecommended: true,
    },
    {
        id: 3,
        imageUrl: '/template-cv/0e5fda43-6a21-439c-9148-7780278cba2c.jpg',
        title: 'Creative CV Template',
    },
    {
        id: 4,
        imageUrl: '/template-cv/0e5fda43-6a21-439c-9148-7780278cba2c.jpg',
        title: 'Minimalist CV Template',
    },
];

export default function CLTemplatePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <HeaderSection />
                <TemplateSection cvTemplates={cvTemplates} />
            </div>
        </div>
    );
}