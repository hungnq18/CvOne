import JobSearch from '@/components/ui/jobSearch';

// Job interfaces
export interface Job {
    id: number; // Primary key, unique identifier
    job_system_id: { id: number }; // Associated job system ID
    title: string; // Required, title of job
    update_at: string | null; // Optional, time update job
    description: string; // Required, description of the job
    status: string; // Required, job is available or not
    requirement: string; // Required, the requirement of human resource
    income: number; // Required, the income of the job for candidate
    location: string; // Required, the location of the company
    benefits: string; // Required, the benefit if the application have been accept
    category_id: { id: number }; // Associated category ID
    company_id: { id: number }; // Associated company ID
}

export interface JobCategory {
    subTypes: string[]; // Roles
    jobs: Job[];
}

// Job data
export const jobData: Record<string, JobCategory> = {
    'Design & Creative': {
        subTypes: ['Visual Design Freelancer', 'Reaper Freelancer', 'Animation Specialist'],
        jobs: [
            {
                id: 1,
                job_system_id: { id: 101 },
                title: 'Wix Website Creation for NGO',
                update_at: '2025-06-04',
                description: 'Design and develop a Wix website for a non-profit organization.',
                status: 'available',
                requirement: 'Experience with Wix and UI/UX design',
                income: 40,
                location: 'Remote',
                benefits: 'Flexible hours, paid leave',
                category_id: { id: 1 },
                company_id: { id: 1001 },
            },
            {
                id: 2,
                job_system_id: { id: 102 },
                title: 'Founding Creative Director - Lifestyle Brand',
                update_at: '2025-06-03',
                description: 'Lead creative direction for a new lifestyle brand.',
                status: 'available',
                requirement: '5+ years in creative direction',
                income: 80,
                location: 'New York',
                benefits: 'Equity, health insurance',
                category_id: { id: 1 },
                company_id: { id: 1002 },
            },
            {
                id: 3,
                job_system_id: { id: 103 },
                title: 'Motion Graphics for Social Media',
                update_at: '2025-06-02',
                description: 'Create engaging motion graphics for social media campaigns.',
                status: 'available',
                requirement: 'Proficiency in After Effects',
                income: 50,
                location: 'Remote',
                benefits: 'Remote work, bonuses',
                category_id: { id: 1 },
                company_id: { id: 1003 },
            },
            {
                id: 4,
                job_system_id: { id: 104 },
                title: 'Reaper Animation for Game',
                update_at: '2025-06-01',
                description: 'Develop reaper-themed animations for a video game.',
                status: 'available',
                requirement: 'Game animation experience',
                income: 45,
                location: 'London',
                benefits: 'Game credits, flexible hours',
                category_id: { id: 1 },
                company_id: { id: 1004 },
            },
        ],
    },
    'Development & IT': {
        subTypes: ['Web Developer', 'Amazon Specialist'],
        jobs: [
            {
                id: 5,
                job_system_id: { id: 105 },
                title: 'Amazon FBA Specialist',
                update_at: '2025-06-05',
                description: 'Manage Amazon FBA accounts and optimize listings.',
                status: 'available',
                requirement: 'Experience with Amazon FBA',
                income: 50,
                location: 'Remote',
                benefits: 'Commission, remote work',
                category_id: { id: 2 },
                company_id: { id: 1005 },
            },
            {
                id: 6,
                job_system_id: { id: 106 },
                title: 'React Developer for E-commerce',
                update_at: '2025-06-04',
                description: 'Build a React-based e-commerce platform.',
                status: 'available',
                requirement: '3+ years React experience',
                income: 60,
                location: 'San Francisco',
                benefits: 'Health insurance, stock options',
                category_id: { id: 2 },
                company_id: { id: 1006 },
            },
        ],
    },
};

export const jobTypes = Object.keys(jobData);

interface JobPageProps {
    searchParams: URLSearchParams;
}

export default function JobPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    return (
        <div className="min-h-screen bg-gray-50 py-12 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <JobSearch jobData={jobData} jobTypes={jobTypes} />
            </div>
        </div>
    );
}