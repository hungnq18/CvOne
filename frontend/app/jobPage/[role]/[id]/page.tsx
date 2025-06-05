import Link from 'next/link';
import { jobData } from '../../../jobPage/page';

const translations = {
    vi: { title: 'Chi tiết công việc', back: 'Quay lại', notFound: 'Không tìm thấy công việc' },
    en: { title: 'Job Details', back: 'Back', notFound: 'Job not found' },
};

interface JobDetailPageProps {
    params: { type: string; role: string; id: string };
    searchParams: { lang?: 'vi' | 'en' };
}

export default function JobDetailPage({ params, searchParams }: JobDetailPageProps) {
    const decodedType = decodeURIComponent(params.type);
    const decodedRole = decodeURIComponent(params.role);
    const language = searchParams.lang || 'en';
    const t = translations[language] || translations.en;

    const job = jobData[decodedType]?.jobs.find((j) => j.id === parseInt(params.id));

    if (!jobData[decodedType] || !job) {
        return <div className="p-8 text-center text-gray-500">{t.notFound}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <Link
                href={`/jobs/${encodeURIComponent(params.type)}/${encodeURIComponent(params.role)}?lang=${language}`}
                className="text-indigo-600 hover:underline mb-4 inline-block"
            >
                {t.back}
            </Link>
            <h1 className="text-2xl font-bold mb-4">{t.title}: {job.title}</h1>
            <div className="bg-white p-6 border border-gray-300 rounded-lg">
                <p><strong>Loại công việc:</strong> {job.type}</p>
                <p><strong>Vai trò:</strong> {job.role}</p>
                <p><strong>Mô tả:</strong> {job.description}</p>
                <p><strong>Lương:</strong> {job.salary}</p>
            </div>
        </div>
    );
}