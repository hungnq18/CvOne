'use client';
import { ApplyJob, getApplyJobByHR } from "@/api/apiApplyJob";
import { ApplyJobOverviewChart } from "@/components/hr/profit-chart";
import { RevenueChart } from "@/components/hr/revenue-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '@/providers/global-provider';
import { Eye, Package, ShoppingCart, Users } from "lucide-react";
import { useEffect, useState } from "react";

const stats = [
    {
        title: "Total Revenue",
        value: "$3.456K",
        change: "+0.43%",
        changeType: "positive" as const,
        icon: Eye,
    },
    {
        title: "Total Profit",
        value: "$45.2K",
        change: "+4.35%",
        changeType: "positive" as const,
        icon: ShoppingCart,
    },
    {
        title: "Total Product",
        value: "2.450",
        change: "+2.59%",
        changeType: "positive" as const,
        icon: Package,
    },
    {
        title: "Total Users",
        value: "3.456",
        change: "+0.95%",
        changeType: "positive" as const,
        icon: Users,
    },
]

export function DashboardContent() {
    const [appliedJobs, setAppliedJobs] = useState<ApplyJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const { language } = useLanguage ? useLanguage() : { language: 'vi' };

    const t = {
        vi: {
            jobTitle: 'Tên công việc',
            candidate: 'Ứng viên',
            cv: 'CV',
            coverLetter: 'Cover Letter',
            status: 'Trạng thái',
            submitTime: 'Thời gian nộp',
            noData: 'Không có dữ liệu',
            loading: 'Đang tải dữ liệu...',
            error: 'Lỗi khi tải dữ liệu applied jobs',
            pending: 'Chờ duyệt',
            accepted: 'Đã nhận',
            rejected: 'Từ chối',
            submitByFile: 'Nộp bằng file',
        },
        en: {
            jobTitle: 'Job Title',
            candidate: 'Candidate',
            cv: 'CV',
            coverLetter: 'Cover Letter',
            status: 'Status',
            submitTime: 'Submitted At',
            noData: 'No data',
            loading: 'Loading data...',
            error: 'Failed to load applied jobs',
            pending: 'Pending',
            accepted: 'Accepted',
            rejected: 'Rejected',
            submitByFile: 'Submit by file',
        }
    }[language === 'en' ? 'en' : 'vi'];

    useEffect(() => {
        setLoading(true);
        getApplyJobByHR()
            .then((data) => {
                setAppliedJobs(Array.isArray(data) ? data : (data.data || []));
                setError(null);
            })
            .catch((err) => {
                setError("Lỗi khi tải dữ liệu applied jobs");
                setAppliedJobs([]);
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="flex-1 space-y-6 p-6 pt-0 bg-gray-50 w-full max-w-full">
            {/* Bảng danh sách các appliedJobs */}
            <div className="bg-white rounded-lg shadow p-6 mb-6 overflow-x-auto w-full">
                <h2 className="text-xl font-bold mb-4">{language === 'en' ? 'Applied Jobs List' : 'Danh sách Applied Jobs'}</h2>
                {loading ? (
                    <div className="text-center text-blue-500 py-8">{t.loading}</div>
                ) : error ? (
                    <div className="text-center text-red-500 py-8">{t.error}</div>
                ) : (
                    <div className="overflow-x-auto w-full">
                        {(() => {
                            const filteredJobs = appliedJobs.filter((job: any) => job.status === 'pending');
                            // Sort by newest first (createdAt or submit_at)
                            const sortedJobs = filteredJobs.sort((a: any, b: any) => {
                                const dateA = new Date(a.createdAt || a.submit_at || 0).getTime();
                                const dateB = new Date(b.createdAt || b.submit_at || 0).getTime();
                                return dateB - dateA;
                            });
                            const totalPages = Math.ceil(sortedJobs.length / itemsPerPage);
                            const paginatedJobs = sortedJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
                            return (
                                <>
                                <table className="min-w-[700px] w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t.jobTitle}</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t.candidate}</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t.cv}</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t.coverLetter}</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t.status}</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t.submitTime}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {paginatedJobs.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-4 text-center text-gray-400">{t.noData}</td>
                                            </tr>
                                        ) : (
                                            paginatedJobs.map((job: any) => (
                                                <tr key={job.id || job._id}>
                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                        {job.jobId && job.jobId.title ? job.jobId.title : (job.job_id || (job.jobId && job.jobId._id) || '-')}
                                                    </td>
                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                        {job.userId && job.userId.first_name ? `${job.userId.first_name} ${job.userId.last_name}` : (job.user_id || (job.userId && job.userId._id) || '-')}
                                                    </td>
                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                        {job.cvId && (job.cvId.title || job.cvId._id) ? (job.cvId.title || job.cvId._id) : (job.cv_id || t.submitByFile)}
                                                    </td>
                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                        {job.coverletterId && (job.coverletterId.title || job.coverletterId._id) ? (job.coverletterId.title || job.coverletterId._id) : (job.coverletter_id || t.submitByFile)}
                                                    </td>
                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : job.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {job.status === 'pending' ? t.pending : job.status === 'accepted' ? t.accepted : job.status === 'rejected' ? t.rejected : job.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2 whitespace-nowrap">{
                                                        job.createdAt
                                                            ? new Date(job.createdAt).toLocaleDateString(language === 'en' ? 'en-GB' : 'vi-VN')
                                                            : (job.submit_at ? new Date(job.submit_at).toLocaleDateString(language === 'en' ? 'en-GB' : 'vi-VN') : '-')
                                                    }</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                                {/* Pagination controls */}
                                <div className="flex justify-center items-center gap-1 mt-2">
                                    <button
                                        className="px-2 py-1 rounded-full border text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        &lt;
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <button
                                            key={i + 1}
                                            className={`px-2 py-1 rounded-full border text-xs ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                                            onClick={() => setCurrentPage(i + 1)}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        className="px-2 py-1 rounded-full border text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        &gt;
                                    </button>
                                </div>
                                </>
                            );
                        })()}
                    </div>
                )}
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg">Revenue Overview</CardTitle>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>12.04.2022 - 12.05.2022</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <RevenueChart />
                    </CardContent>
                </Card>

                <Card className="bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg">Apply Job Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ApplyJobOverviewChart />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}