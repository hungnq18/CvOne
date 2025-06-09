import React from 'react';
import { Tabs } from 'antd';
import { FaBookmark, FaCheckCircle, FaArchive } from 'react-icons/fa';
import { useLanguage } from '@/providers/global-provider';
import { Job } from '@/app/myJobs/page';

interface JobTabsProps {
    activeTab: string;
    onTabChange: (key: string) => void;
    savedJobs: Job[];
    appliedJobs: Job[];
    archivedJobs: Job[];
    translations: any;
}

const JobTabs: React.FC<JobTabsProps> = ({
    activeTab,
    onTabChange,
    savedJobs,
    appliedJobs,
    archivedJobs,
    translations
}) => {
    const { language } = useLanguage();
    const t = translations[language];

    const items = [
        {
            key: '1',
            label: (
                <div className="flex items-center gap-2">
                    <span>{t.tabs.saved} ({savedJobs.length})</span>
                </div>
            ),
            children: null,
        },
        {
            key: '2',
            label: (
                <div className="flex items-center gap-2">
                    <span>{t.tabs.applied} ({appliedJobs.length})</span>
                </div>
            ),
            children: null,
        },
        {
            key: '3',
            label: (
                <div className="flex items-center gap-2">
                    <span>{t.tabs.archived} ({archivedJobs.length})</span>
                </div>
            ),
            children: null,
        },
    ];

    return (
        <Tabs
            activeKey={activeTab}
            onChange={onTabChange}
            items={items}
            className="flex-1 min-w-0"
        />
    );
};

export default JobTabs; 