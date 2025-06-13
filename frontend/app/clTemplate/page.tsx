import { Typography } from 'antd';
import TemplateCLSection from '@/components/sections/pageCLTemplate-section';
import HeaderCLSection from '@/components/sections/header-pageclTemplate-section';

// Dữ liệu mẫu nhúng trực tiếp
const cvTemplates = [
    {
        id: "1",
        imageUrl: 'https://th.bing.com/th/id/OIP.GdDZiF0OCgYG8FQ7_yoxUwHaKi?rs=1&pid=ImgDetMain',
        title: 'Modern CV Template',
        type: 'modern',
        isRecommended: true,
    },        
    {
        id: "2",
        imageUrl: 'https://cdn1.vieclam24h.vn/images/assets/img/cv6-246b81.png',
        title: 'Professional CV Template',
        type: 'classic',
        isRecommended: true,
    },
    {
        id: "3",
        imageUrl: 'https://th.bing.com/th/id/OIP.GdDZiF0OCgYG8FQ7_yoxUwHaKi?rs=1&pid=ImgDetMain',
        title: 'Creative CV Template',
        type: 'modern'
    },
    {
        id: "4",
        imageUrl: 'https://cdn1.vieclam24h.vn/images/assets/img/cv6-246b81.png',
        title: 'Minimalist CV Template',
        type: 'classic'
    },
];

export default function CLTemplatePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <HeaderCLSection />
                <TemplateCLSection cvTemplates={cvTemplates} />
            </div>
        </div>
    );
}