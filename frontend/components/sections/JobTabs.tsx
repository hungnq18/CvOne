import { Job } from '@/app/myJobs/page';
import { useLanguage } from '@/providers/global_provider';
import { Tabs } from 'antd';
import React from 'react';

interface JobTabsProps {
    activeTab: string;
    onTabChange: (key: string) => void;
    savedJobs: Job[];
    appliedJobs: Job[];
    translations: any;
}

const JobTabs: React.FC<JobTabsProps> = ({
    activeTab,
    onTabChange,
    savedJobs,
    appliedJobs,
    translations
}) => {
    const { language } = useLanguage();
    const t = translations[language];

    const items = [
        {
            key: '1',
            label: (
                <div className="flex items-center gap-2">
                    <span>{t.tabs.saved}</span>
                </div>
            ),
            children: null,
        },
        {
            key: '2',
            label: (
                <div className="flex items-center gap-2">
                    <span>{t.tabs.applied}</span>
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