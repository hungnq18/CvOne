"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface Company {
    name: string;
    logo: string;
    jobsCount: number;
}

interface PopularCompaniesProps {
    companies: Company[];
}

const PopularCompanies: React.FC<PopularCompaniesProps> = ({ companies }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerPage = 3;

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % Math.ceil(companies.length / itemsPerPage));
        }, 5000); // Auto-scroll every 5 seconds
        return () => clearInterval(interval);
    }, [companies.length]);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % Math.ceil(companies.length / itemsPerPage));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + Math.ceil(companies.length / itemsPerPage)) % Math.ceil(companies.length / itemsPerPage));
    };

    return (
        <div className="relative w-full mt-8">

            <div className="relative">
                <button
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-3 rounded-full shadow-md hover:bg-blue-600 transition disabled:opacity-50 z-10"
                    disabled={currentIndex === 0}
                >
                    &lt;
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-3 rounded-full shadow-md hover:bg-blue-600 transition disabled:opacity-50 z-10"
                    disabled={(currentIndex + 1) * itemsPerPage >= companies.length}
                >
                    &gt;
                </button>
                <div className="overflow-hidden">
                    <div
                        className="flex space-x-6 transition-transform duration-300"
                        style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` }}
                    >
                        {companies.map((company, index) => (
                            <div
                                key={index}
                                className="bg-white shadow-lg rounded-lg p-6 flex items-center space-x-6 hover:shadow-xl transition transform hover:scale-105 h-40 flex-shrink-0"
                                style={{ width: `${100 / itemsPerPage}%` }}
                            >
                                <Image
                                    src={company.logo}
                                    alt={`${company.name} logo`}
                                    width={64}
                                    height={64}
                                    className="w-16 h-16 object-contain"
                                />
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">{company.name}</h3>
                                    <p className="text-sm text-gray-600">{company.jobsCount} việc làm</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PopularCompanies;