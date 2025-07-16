
import dynamic from 'next/dynamic';

const ManageCandidateTable = dynamic(() => import('@/components/hr/ManageCandidateTable'), { ssr: false });

export default function ManageCandidatePage() {
    return <ManageCandidateTable />;
}
