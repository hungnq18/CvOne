'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Card } from 'antd';
import { FaHeart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Job } from '@/app/userDashboard/page';
import { useLanguage } from '@/providers/global-provider';

const translations = {
    vi: {
        favoriteJobs: "Các công việc ưa thích",
        company: "Công ty",
        description: "Mô tả",
    },
    en: {
        favoriteJobs: "Favorite Jobs",
        company: "Company",
        description: "Description",
    }
};

interface FavoriteJobsProps {
    jobs: Job[];
}

const FavoriteJobs: React.FC<FavoriteJobsProps> = ({ jobs }) => {
    const { language } = useLanguage();
    const t = translations[language];

    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(false);

    const checkScrollPosition = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setShowLeft(scrollLeft > 0);
            setShowRight(scrollLeft < scrollWidth - clientWidth - 1);
        }
    };

    useEffect(() => {
        checkScrollPosition();
        if (scrollRef.current) {
            scrollRef.current.addEventListener('scroll', checkScrollPosition);
        }
        return () => {
            if (scrollRef.current) {
                scrollRef.current.removeEventListener('scroll', checkScrollPosition);
            }
        };
    }, [jobs]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-gradient-to-r from-blue-100 to-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 relative">
            <div className="flex items-center mb-4">
                <FaHeart className="text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-blue-600">{t.favoriteJobs}</h2>
            </div>
            <div className="flex space-x-4 overflow-x-auto scroll-smooth" ref={scrollRef}>
                {jobs.map((job) => (
                    <Card
                        key={job.id}
                        className="bg-white rounded-lg shadow-sm hover:bg-blue-50 transition-colors duration-200 min-w-[250px]"
                    >
                        <h3 className="text-md font-medium text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-700">{t.company}: {job.company}</p>
                        <p className="text-xs text-gray-600 mt-1">{t.description}: {job.description}</p>
                    </Card>
                ))}
            </div>
            {showLeft && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                >
                    <FaChevronLeft className="text-blue-600" />
                </button>
            )}
            {showRight && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                >
                    <FaChevronRight className="text-blue-600" />
                </button>
            )}
        </div>
    );
};

export default FavoriteJobs;