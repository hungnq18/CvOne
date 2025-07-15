import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Search, Check, X } from "lucide-react";
import HrAction from "@/components/ui/hrActions";
import StatusRadioTabs from "@/components/hr/RadioTabsInManageApply";
import DeleteButton from "@/components/ui/DeleteButton";

interface ManageApplyJobTableProps {
    applications: any[];
    statusFilter: string;
    setStatusFilter: (v: string) => void;
    searchTerm: string;
    setSearchTerm: (v: string) => void;
    handleViewCV: (cvId: string) => void;
    handleViewCoverLetter: (coverLetterId: string) => void;
    handleUpdateStatus: (applyJobId: string, newStatus: "approved" | "rejected" | "reviewed") => void;
    handleDeleteApplyJob?: (applyJobId: string) => void;
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
}) => {
    // Lọc lại filteredApplications theo statusFilter
    const filteredApplications =
        statusFilter === "all"
            ? applications.filter((app: any) => ["pending", "reviewed"].includes(app.status))
            : applications.filter((app: any) => app.status === statusFilter);

    // Thêm lọc theo searchTerm (tìm theo tên, email, job title)
    const searchedApplications =
        searchTerm.trim() === ""
            ? filteredApplications
            : filteredApplications.filter((app: any) => {
                const name =
                    (app.cvId?.content?.userData?.firstName || app.userId?.first_name || "") +
                    " " +
                    (app.cvId?.content?.userData?.lastName || app.userId?.last_name || "");
                const email = app.cvId?.content?.userData?.email || app.userId?.email || "";
                const jobTitle = app.jobId?.title || app.job_id || "";
                const search = searchTerm.toLowerCase();
                return (
                    name.toLowerCase().includes(search) ||
                    email.toLowerCase().includes(search) ||
                    jobTitle.toLowerCase().includes(search)
                );
            });

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

    return (
        <Card>
            <CardHeader>
                <CardTitle>Job Applications with CV & Cover Letter</CardTitle>
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search candidates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
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
                            <TableHead>Experience</TableHead>
                            <TableHead>{statusFilter === "all" ? "Status" : "Action"}</TableHead>
                            <TableHead>Documents</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {searchedApplications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-gray-400">
                                    No applications found for this status.
                                </TableCell>
                            </TableRow>
                        ) : (
                            searchedApplications.map((app: any) => (
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
                                        {app.cvId?.content?.userData?.professional || "-"}
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
                                                    onClick={() => handleUpdateStatus(app._id, "reviewed")}
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
                                                    onClick={() => handleUpdateStatus(app._id, "approved")}
                                                >
                                                    <Check className="h-4 w-4 mr-1" /> Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                                    onClick={() => handleUpdateStatus(app._id, "rejected")}
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
                                                    onClick={() => handleUpdateStatus(app._id, "reviewed")}
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
                                            onDownloadCV={() => { }}
                                            onViewCL={() => handleViewCoverLetter(app.coverletterId?._id || app.coverletter_id)}
                                            onDownloadCL={() => { }}
                                            status={app.status}
                                            onDelete={
                                                app.status === "rejected" && handleDeleteApplyJob
                                                    ? () => handleDeleteApplyJob(app._id)
                                                    : undefined
                                            }
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default ManageApplyJobTable; 