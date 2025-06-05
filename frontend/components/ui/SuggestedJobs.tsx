'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Card } from 'antd';
import { FaLightbulb, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Job } from '@/app/userDashboard/page';

interface SuggestedJobsProps {
    jobs: Job[];
}

const SuggestedJobs: React.FC<SuggestedJobsProps> = ({ jobs }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(false);

    // Hàm kiểm tra vị trí cuộn để quyết định hiển thị nút
    const checkScrollPosition = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setShowLeft(scrollLeft > 0); // Hiển thị nút "Trái" nếu đã cuộn sang phải
            setShowRight(scrollLeft < scrollWidth - clientWidth - 1); // Hiển thị nút "Phải" nếu còn nội dung để cuộn
        }
    };

    // Theo dõi vị trí cuộn khi component mount hoặc jobs thay đổi
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

    // Hàm cuộn nội dung
    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 relative">
            <div className="flex items-center mb-4">
                <FaLightbulb className="text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-blue-600">Các công việc được gợi ý</h2>
            </div>
            <div className="flex space-x-4 overflow-x-auto scroll-smooth" ref={scrollRef}>
                {jobs.map((job) => (
                    <Card
                        key={job.id}
                        className="bg-white rounded-lg shadow-sm hover:bg-blue-50 transition-colors duration-200 min-w-[250px]"
                    >
                        <h3 className="text-md font-medium text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-700">{job.company}</p>
                        <p className="text-xs text-gray-600 mt-1">{job.description}</p>
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

export default SuggestedJobs;