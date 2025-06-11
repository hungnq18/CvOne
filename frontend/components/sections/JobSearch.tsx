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
        <div className="custom-search">
            <input
                type="text"
                placeholder={t.search.placeholder}
                value={searchValue}
                onChange={(e) => onSearch(e.target.value)}
            />
            <button id="search-icon">
                <div id="search-icon-circle"></div>
                <span></span>
            </button>
        </div>
    );
};

export default JobSearch; 