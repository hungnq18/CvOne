import React from 'react';
import { useLanguage } from '@/providers/global-provider';

interface JobSearchProps {
    searchValue: string;
    onSearch: (value: string) => void;
    translations: any;
}

const JobSearch: React.FC<JobSearchProps> = ({ searchValue, onSearch, translations }) => {
    const { language } = useLanguage();
    const t = translations[language];

    return (
        <form className="relative w-full sm:w-auto" onSubmit={e => e.preventDefault()}>
            <button type="submit" className="absolute left-2 -translate-y-1/2 top-1/2 p-1">
                <svg
                    width="17"
                    height="16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    role="img"
                    aria-labelledby="search"
                    className="w-4 h-4 text-gray-700"
                >
                    <path
                        d="M7.667 12.667A5.333 5.333 0 107.667 2a5.333 5.333 0 000 10.667zM14.334 14l-2.9-2.9"
                        stroke="currentColor"
                        strokeWidth="1.333"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    ></path>
                </svg>
            </button>
            <input
                className="rounded-full px-8 py-2 text-sm border-2 border-blue-500 focus:border-blue-700 placeholder-gray-400 transition-all duration-300 w-full shadow-[0_0_0_3px_#3b82f633] focus:shadow-[0_0_0_3px_#1d4ed866] focus:outline-none"
                type="text"
                placeholder={t.search.placeholder}
                value={searchValue}
                onChange={e => onSearch(e.target.value)}
            />
            {searchValue && (
                <button type="button" onClick={() => onSearch('')} className="absolute right-3 -translate-y-1/2 top-1/2 p-1">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 text-gray-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        ></path>
                    </svg>
                </button>
            )}
        </form>
    );
};

export default JobSearch; 