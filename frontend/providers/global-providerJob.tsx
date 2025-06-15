'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Job } from '@/api/jobApi';

interface GlobalContextType {
    jobs: Job[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedType: string | null;
    setSelectedType: (type: string | null) => void;
    selectedRole: string | null;
    setSelectedRole: (role: string | null) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProviderJob = ({ children, initialJobs }: { children: ReactNode; initialJobs: Record<string, { subTypes: string[]; jobs: Job[] }> }) => {
    const [jobs] = useState<Job[]>(Object.values(initialJobs).flatMap((category) => category.jobs));
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);

    return (
        <GlobalContext.Provider value={{ jobs, searchQuery, setSearchQuery, selectedType, setSelectedType, selectedRole, setSelectedRole }}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobal = () => {
    const context = useContext(GlobalContext);
    if (!context) throw new Error('useGlobal must be used within a GlobalProviderJob');
    return context;
};