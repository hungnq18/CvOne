import Link from 'next/link';
import { jobData } from '../../jobPage/page';

const translations = {
    vi: {
        title: 'Công việc theo vai trò',
        noJobs: 'Không tìm thấy công việc nào',
        back: 'Quay lại',
    },
    en: {
        title: 'Jobs by role',
        noJobs: 'No jobs found',
        back: 'Back',
    },
};

interface JobsByRolePageProps {
    params: { type: string; role: string };
    searchParams: { search?: string; lang?: 'vi' | 'en' };
}

export default function JobsByRolePage({ params, searchParams }: JobsByRolePageProps) {
    const decodedType = decodeURIComponent(params.type);
    const decodedRole = decodeURIComponent(params.role);
    const searchQuery = searchParams.search ? decodeURIComponent(searchParams.search) : '';
    const language = searchParams.lang || 'en';
    const t = translations[language] || translations.en;

    const filteredJobs = jobData[decodedType]?.jobs.filter(
        (job) =>
            job.role === decodedRole &&
            job.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    if (!jobData[decodedType]) {
        return <div className="p-8 text-center text-gray-500">Loại công việc không tồn tại</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <Link href={`/jobs?lang=${language}`} className="text-indigo-600 hover:underline mb-4 inline-block">{t.back}</Link>
            <h1 className="text-2xl font-bold mb-4">{t.title}: {decodedRole}</h1>
            <section className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                {filteredJobs.length === 0 ? (
                    <p className="text-gray-500 text-center py-2">{t.noJobs}</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredJobs.map((job) => (
                            <Link
                                key={job.id}
                                href={`/jobs/${encodeURIComponent(decodedType)}/${encodeURIComponent(decodedRole)}/${job.id}?lang=${language}`}
                            >
                                <div className="flex flex-col justify-between h-32 p-4 border border-gray-300 rounded-lg bg-white hover:bg-indigo-50 hover:shadow-sm transition-all duration-200">
                                    <h3 className="text-gray-800 text-md font-medium hover:text-indigo-600 cursor-pointer">{job.title}</h3>
                                    <p className="text-xs text-gray-500 mt-1">{job.salary}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}