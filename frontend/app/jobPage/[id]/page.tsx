import JobDetailClient from '@/components/client/JobDetailClient';

export default function JobDetailPage({ params }: { params: { id: string } }) {
    return <JobDetailClient id={params.id} />;
} 