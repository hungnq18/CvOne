import { CVTemplate, getCVTemplates } from "@/api/cvapi";
import { templateComponentMap } from "@/components/cvTemplate/index";
import StatusRadioTabs from "@/components/hr/RadioTabsInManageApply";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HrAction from "@/components/ui/hrActions";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import html2pdf from "html2pdf.js";
import { Check, Search, X } from "lucide-react";
import React, { useEffect, useState } from "react";

interface ManageApplyJobTableProps {
    applications: any[];
    statusFilter: string;
    setStatusFilter: (v: string) => void;
    searchTerm: string;
    setSearchTerm: (v: string) => void;
    handleViewCV: (cvId: string) => void;
    handleViewCoverLetter: (coverLetterId: string) => void;
    handleUpdateStatus: (applyJobId: string, newStatus: "approved" | "rejected" | "reviewed", candidateId: string) => void;
    handleDeleteApplyJob?: (applyJobId: string) => void;
    handleDownloadCL?: (clId?: string, clUrl?: string) => void;
}

const ManageApplyJobTable: React.FC<ManageApplyJobTableProps> = ({
    applications,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    handleViewCV,
    handleViewCoverLetter,
    handleUpdateStatus,
    handleDeleteApplyJob,
    handleDownloadCL,
}) => {
    const [allTemplates, setAllTemplates] = useState<CVTemplate[]>([]);
    const [workType, setWorkType] = useState('All');
    const [showWorkTypeDropdown, setShowWorkTypeDropdown] = useState(false);
    useEffect(() => {
        getCVTemplates().then(setAllTemplates);
    }, []);

    // Lấy danh sách work type duy nhất từ dữ liệu job
    const workTypes = Array.from(new Set(applications.map(app => app.jobId?.workType || app.jobId?.["Work Type"]).filter(Boolean)));

    // Lọc lại filteredApplications theo statusFilter
    const filteredApplications =
        statusFilter === "all"
            ? applications.filter((app: any) => ["pending", "reviewed"].includes(app.status))
            : applications.filter((app: any) => app.status === statusFilter);

    // Luôn filter theo work type và searchTerm
    const searchedApplications = filteredApplications.filter((app: any) => {
        const name =
            (app.cvId?.content?.userData?.firstName || app.userId?.first_name || "") +
            " " +
            (app.cvId?.content?.userData?.lastName || app.userId?.last_name || "");
        const jobWorkTypeRaw = app.jobId?.workType || app.jobId?.["Work Type"] || '';
        const jobWorkType = String(jobWorkTypeRaw).trim().toLowerCase();
        const workTypeFilter = String(workType).trim().toLowerCase();
        const search = searchTerm.toLowerCase();
        const matchName = name.toLowerCase().includes(search);
        const matchWorkType = workType === 'All' || jobWorkType === workTypeFilter;
        return matchName && matchWorkType;
    }).sort((a, b) => {
        const dateA = new Date(a.createdAt || a.submit_at || 0).getTime();
        const dateB = new Date(b.createdAt || b.submit_at || 0).getTime();
        return dateB - dateA;
    });

    // Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    // Thêm filter/sort theo thời gian apply
    const [applySort, setApplySort] = useState<'newest' | 'oldest'>('newest');

    // Sắp xếp theo thời gian apply
    const sortedApplications = [...searchedApplications].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.submit_at || 0).getTime();
        const dateB = new Date(b.createdAt || b.submit_at || 0).getTime();
        return applySort === 'newest' ? dateB - dateA : dateA - dateB;
    });
    const totalPages = Math.ceil(sortedApplications.length / itemsPerPage);
    const paginatedApplications = sortedApplications.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "reviewed":
                return "bg-blue-100 text-blue-800";
            case "interviewed":
                return "bg-purple-100 text-purple-800";
            case "hired":
                return "bg-green-100 text-green-800";
            case "rejected":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const handleDownloadCV = async (cvData: any) => {
        if (!window.confirm("Bạn có chắc chắn muốn tải CV này về máy?")) {
            return;
        }
        if (!cvData || !cvData.content?.userData || !(cvData.cvTemplateId || cvData.templateId)) {
            alert("Không đủ dữ liệu để xuất PDF");
            return;
        }
        const templateId = cvData.cvTemplateId || cvData.templateId;
        console.log("cvData", cvData);
        console.log("allTemplates", allTemplates);
        const template = allTemplates.find((t) => t._id === templateId);
        console.log("template found", template);
        if (!template) {
            alert("Không tìm thấy template phù hợp để xuất PDF");
            return;
        }
        const TemplateComponent = templateComponentMap[template.title];
        console.log("template title", template.title);
        console.log("TemplateComponent", TemplateComponent);
        if (!TemplateComponent) {
            alert("Không tìm thấy component template để xuất PDF");
            return;
        }
        const templateData = { ...template.data, userData: cvData.content.userData };
        // 1. Tạo iframe ẩn
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.width = '794px';
        iframe.style.height = '1123px';
        iframe.style.left = '-9999px';
        document.body.appendChild(iframe);
        const iframeDoc = iframe.contentWindow?.document;
        if (!iframeDoc) {
            alert("Không thể tạo môi trường để xuất PDF.");
            document.body.removeChild(iframe);
            return;
        }
        // 2. Copy CSS
        const head = iframeDoc.head;
        document.querySelectorAll('style, link[rel="stylesheet"]').forEach(node => {
            head.appendChild(node.cloneNode(true));
        });
        // 3. Tạo mount node
        const mountNode = iframeDoc.createElement('div');
        iframeDoc.body.appendChild(mountNode);
        let root = null;
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            const { createRoot } = await import('react-dom/client');
            root = createRoot(mountNode);
            root.render(
                <div>
                    {/* Có thể thêm font-base64 nếu muốn như ở pageCreateCV-section */}
                    <div style={{ fontFamily: 'sans-serif' }}>
                        <TemplateComponent data={templateData} isPdfMode={true} />
                    </div>
                </div>
            );
            await new Promise(resolve => setTimeout(resolve, 500));
            await html2pdf()
                .from(iframe.contentWindow.document.body)
                .set({
                    margin: 0,
                    filename: `${cvData.title || "cv"}.pdf`,
                    image: { type: "jpeg", quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true },
                    jsPDF: { unit: "px", format: [794, 1123], orientation: "portrait" },
                })
                .save();
        } catch (error) {
            console.error("Lỗi khi tạo PDF:", error);
            alert("Đã có lỗi xảy ra khi xuất file PDF.");
        } finally {
            if (root) root.unmount();
            if (document.body.contains(iframe)) document.body.removeChild(iframe);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Job Applications with CV & Cover Letter</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                    <label className="text-sm">Sort by:</label>
                    <select
                        className="border rounded px-2 py-1 text-sm"
                        value={applySort}
                        onChange={e => { setApplySort(e.target.value as 'newest' | 'oldest'); setCurrentPage(1); }}
                    >
                        <option value="newest">Newest Applied</option>
                        <option value="oldest">Oldest Applied</option>
                    </select>
                </div>
                <div className="flex items-center space-x-2" style={{ marginTop: 20 }}>
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search candidates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    {/* Dropdown Work Type custom */}
                    <div className="relative inline-block">
                        <button
                            id="dropdownDefaultButton"
                            type="button"
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            onClick={() => setShowWorkTypeDropdown((v: boolean) => !v)}
                        >
                            {workType === 'All' ? 'All Work Types' : workType}
                            <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" fill="none" viewBox="0 0 10 6">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                            </svg>
                        </button>
                        {showWorkTypeDropdown && (
                            <div className="z-10 absolute bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 mt-2">
                                <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                                    <li>
                                        <button
                                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                            onClick={() => { setWorkType('All'); setShowWorkTypeDropdown(false); }}
                                        >
                                            All Work Types
                                        </button>
                                    </li>
                                    {workTypes.map(type => (
                                        <li key={type}>
                                            <button
                                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                                onClick={() => { setWorkType(type); setShowWorkTypeDropdown(false); }}
                                            >
                                                {type}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </CardHeader>
            <StatusRadioTabs statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Candidate</TableHead>
                            <TableHead>Job Title</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Applied Date</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>{statusFilter === "all" ? "Status" : "Action"}</TableHead>
                            <TableHead>Documents</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedApplications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-gray-400">
                                    No applications found for this status.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedApplications.map((app: any) => (
                                <TableRow key={app._id}>
                                    <TableCell>
                                        <div className="flex items-center space-x-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage
                                                    src={
                                                        app.cvId?.content?.userData?.avatar ||
                                                        app.cvId?.avatar ||
                                                        "/placeholder-user.jpg"
                                                    }
                                                />
                                                <AvatarFallback>
                                                    {app.cvId?.content?.userData?.firstName?.[0] || ""}
                                                    {app.cvId?.content?.userData?.lastName?.[0] || ""}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">
                                                    {app.cvId?.content?.userData?.firstName ||
                                                        app.userId?.first_name ||
                                                        "-"} {app.cvId?.content?.userData?.lastName ||
                                                            app.userId?.last_name ||
                                                            ""}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {app.cvId?.content?.userData?.email ||
                                                        app.userId?.email ||
                                                        "-"}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {app.jobId?.title || app.job_id || "-"}
                                    </TableCell>
                                    <TableCell>
                                        {app.jobId?.role || app.jobId?.Role || "-"}
                                    </TableCell>
                                    <TableCell>
                                        {app.createdAt
                                            ? new Date(app.createdAt).toLocaleDateString()
                                            : app.submit_at
                                                ? new Date(app.submit_at).toLocaleDateString()
                                                : "-"}
                                    </TableCell>
                                    <TableCell>
                                        {app.userId?.phone || "-"}
                                    </TableCell>
                                    <TableCell>
                                        {statusFilter === "all" ? (
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                                                    app.status
                                                )}`}
                                            >
                                                {app.status.charAt(0).toUpperCase() +
                                                    app.status.slice(1)}
                                            </span>
                                        ) : app.status === "pending" ? (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                                    onClick={() => handleUpdateStatus(app._id, "reviewed", app.userId?._id || app.user_id || app.userId)}
                                                >
                                                    <Check className="h-4 w-4 mr-1" /> Reviewed
                                                </Button>
                                            </div>
                                        ) : app.status === "reviewed" ? (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-green-600 border-green-600 hover:bg-green-50"
                                                    onClick={() => handleUpdateStatus(app._id, "approved", app.userId?._id || app.user_id || app.userId)}
                                                >
                                                    <Check className="h-4 w-4 mr-1" /> Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                                    onClick={() => handleUpdateStatus(app._id, "rejected", app.userId?._id || app.user_id || app.userId)}
                                                >
                                                    <X className="h-4 w-4 mr-1" /> Reject
                                                </Button>
                                            </div>
                                        ) : app.status === "rejected" && statusFilter !== "all" ? (
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                                    onClick={() => handleUpdateStatus(app._id, "reviewed", app.userId?._id || app.user_id || app.userId)}
                                                >
                                                    <svg
                                                        style={{ marginRight: 4 }}
                                                        width="18"
                                                        height="18"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="#2563eb"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                                        <polyline points="22 4 21 12 13 11" />
                                                    </svg>
                                                    Restore
                                                </Button>
                                            </div>
                                        ) : null}
                                    </TableCell>
                                    <TableCell>
                                        <HrAction
                                            onViewCV={() => handleViewCV(app.cvId?._id || app.cv_id)}
                                            onDownloadCV={() => handleDownloadCV(app.cvId)}
                                            onViewCL={() => handleViewCoverLetter(app.coverletterId?._id || app.coverletter_id)}
                                            onDownloadCL={() => handleDownloadCL && handleDownloadCL(app.coverletterId?._id || app.coverletter_id, app.coverletterUrl)}
                                            status={app.status}
                                            onDelete={
                                                app.status === "rejected" && handleDeleteApplyJob
                                                    ? () => handleDeleteApplyJob(app._id)
                                                    : undefined
                                            }
                                            cvId={app.cvId?._id || app.cv_id}
                                            cvUrl={app.cvUrl}
                                            clId={app.coverletterId?._id || app.coverletter_id}
                                            clUrl={app.coverletterUrl}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                {/* Pagination controls */}
                <div className="flex justify-center items-center gap-1 mt-2">
                    <button
                        className="w-8 h-8 flex items-center justify-center rounded-md border text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        &lt;
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            className={`w-8 h-8 flex items-center justify-center rounded-md border text-xs ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                            onClick={() => setCurrentPage(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        className="w-8 h-8 flex items-center justify-center rounded-md border text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        &gt;
                    </button>
                </div>
            </CardContent>
        </Card>
    );
};

export default ManageApplyJobTable; 