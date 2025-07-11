"use client"

import { useState, useEffect } from "react"
import { Eye, Check, X, Search, Download, Mail, FileText, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getApplyJobByHR } from '@/api/apiApplyJob';
import CandidateDetailsDialog from '@/components/hr/CandidateDetailsDialog';
import JobInfoDialog from '@/components/hr/JobInfoDialog';
import StatusRadioTabs from '../../../components/hr/RadioTabsInManageApply';

// Định nghĩa interface cho Job (từ manageJob page)
interface Job {
    _id: string
    "Job Title": string
    Role: string
    Experience: string
    Qualifications: string
    "Salary Range": string
    location: string
    Country: string
    "Work Type": string
    "Job Posting Date": string
    "Job Description": string
    Benefits: string
    skills: string
    Responsibilities: string
    user_id: string
    status?: "Active" | "Inactive"
    applications?: number
}

// Định nghĩa interface cho CV từ db.json
interface CV {
    _id: string
    userId: string
    title: string
    content: {
        userData: {
            firstName: string
            lastName: string
            professional: string
            city: string
            country: string
            province: string
            phone: string
            email: string
            avatar: string
            summary: string
            skills: Array<{
                name: string
                rating: number
            }>
            workHistory: Array<{
                title: string
                company: string
                startDate: string
                endDate: string
                description: string
            }>
            education: Array<{
                startDate: string
                endDate: string
                major: string
                degree: string
                institution: string
            }>
        }
    }
    isPublic: boolean
    createdAt: string
    updatedAt: string
    templateId: string
    isSaved: boolean
    isFinalized: boolean
}

// Định nghĩa interface cho Cover Letter
interface CoverLetter {
    _id: string
    userId: string
    templateId: string
    title: string
    data: {
        firstName: string
        lastName: string
        profession: string
        city: string
        state: string
        phone: string
        email: string
        date: string
        recipientFirstName: string
        recipientLastName: string
        companyName: string
        recipientCity: string
        recipientState: string
        recipientPhone: string
        recipientEmail: string
        subject: string
        greeting: string
        opening: string
        body: string
        callToAction: string
        closing: string
        signature: string
    }
    isSaved: boolean
    createdAt: string
    updatedAt: string
}

// Định nghĩa interface cho ApplyJob
interface ApplyJob {
    _id: string;
    job_id: string;
    user_id: string;
    cv_id: string;
    coverletter_id: string;
    status: "pending" | "reviewed" | "interviewed" | "hired" | "rejected";
    submit_at: string;
}

// Dữ liệu fix cứng cho Jobs
const mockJobs: Job[] = [
    {
        _id: "68559556c366e4dd961cc7e3",
        "Job Title": "Digital Marketing Specialist",
        Role: "Social Media Manager",
        Experience: "5 to 15 Years",
        Qualifications: "M.Tech",
        "Salary Range": "$59K-$99K",
        location: "Douglas",
        Country: "Isle of Man",
        "Work Type": "Intern",
        "Job Posting Date": "4/24/2022",
        "Job Description": "Social Media Managers oversee an organizations social media presence...",
        Benefits: "Flexible Spending Accounts (FSAs), Relocation Assistance...",
        skills: "Social media platforms (e.g., Facebook, Twitter, Instagram)...",
        Responsibilities: "Manage and grow social media accounts...",
        user_id: "68552606392287395a95a3db",
        status: "Active",
        applications: 15
    },
    {
        _id: "68559556c366e4dd961cc7e4",
        "Job Title": "Frontend Developer",
        Role: "React Developer",
        Experience: "3 to 8 Years",
        Qualifications: "B.Tech",
        "Salary Range": "$45K-$75K",
        location: "Ho Chi Minh City",
        Country: "Vietnam",
        "Work Type": "Full-time",
        "Job Posting Date": "1/15/2024",
        "Job Description": "We are looking for a skilled Frontend Developer...",
        Benefits: "Health Insurance, Remote Work, Flexible Hours...",
        skills: "React, TypeScript, JavaScript, HTML, CSS, Git...",
        Responsibilities: "Develop and maintain user-facing features...",
        user_id: "68552606392287395a95a3dc",
        status: "Active",
        applications: 8
    },
    {
        _id: "68559556c366e4dd961cc7e5",
        "Job Title": "Backend Developer",
        Role: "Node.js Developer",
        Experience: "4 to 10 Years",
        Qualifications: "M.Tech",
        "Salary Range": "$55K-$85K",
        location: "Ha Noi",
        Country: "Vietnam",
        "Work Type": "Full-time",
        "Job Posting Date": "1/10/2024",
        "Job Description": "Experienced Backend Developer needed for our growing platform...",
        Benefits: "Competitive Salary, Health Benefits, Learning Budget...",
        skills: "Node.js, Express, MongoDB, PostgreSQL, Docker, AWS...",
        Responsibilities: "Design and implement server-side logic...",
        user_id: "68552606392287395a95a3dd",
        status: "Active",
        applications: 12
    }
];

// Dữ liệu fix cứng cho CVs
const mockCVs: CV[] = [
    {
        _id: "665e920845c2e8c9a4a33333",
        userId: "68552606392287395a95a3db",
        title: "Software Developer CV",
        content: {
            userData: {
                firstName: "Nguyen",
                lastName: "Van A",
                professional: "Software Developer",
                city: "Hanoi",
                country: "Vietnam",
                province: "Hanoi",
                phone: "+84 912 345 678",
                email: "vana@example.com",
                avatar: "https://studiochupanhdep.com/Upload/Images/Album/anh-cv-02.jpg",
                summary: "A passionate developer with 5 years of experience in full-stack development.",
                skills: [
                    { name: "JavaScript", rating: 5 },
                    { name: "React", rating: 4 },
                    { name: "Node.js", rating: 4 }
                ],
                workHistory: [
                    {
                        title: "Frontend Developer",
                        company: "ABC Corp",
                        startDate: "2020-01-01",
                        endDate: "2022-06-01",
                        description: "Worked on UI/UX and SPA using React."
                    }
                ],
                education: [
                    {
                        startDate: "2016-09-01",
                        endDate: "2020-06-30",
                        major: "Computer Science",
                        degree: "Bachelor",
                        institution: "FPT University"
                    }
                ]
            }
        },
        isPublic: true,
        createdAt: "2025-06-06T10:00:00Z",
        updatedAt: "2025-06-06T10:30:00Z",
        templateId: "modern-1",
        isSaved: true,
        isFinalized: true
    },
    {
        _id: "665e920845c2e8c9a4a33334",
        userId: "2",
        title: "Backend Developer CV",
        content: {
            userData: {
                firstName: "Tran",
                lastName: "Thi B",
                professional: "Backend Developer",
                city: "Ho Chi Minh City",
                country: "Vietnam",
                province: "Ho Chi Minh",
                phone: "+84 987 654 321",
                email: "thib@example.com",
                avatar: "/placeholder-user.jpg",
                summary: "Experienced backend developer with expertise in Node.js and databases.",
                skills: [
                    { name: "Node.js", rating: 5 },
                    { name: "MongoDB", rating: 4 },
                    { name: "Express", rating: 4 }
                ],
                workHistory: [
                    {
                        title: "Backend Developer",
                        company: "DataSoft",
                        startDate: "2019-03-01",
                        endDate: "2023-12-01",
                        description: "Developed REST APIs and microservices."
                    }
                ],
                education: [
                    {
                        startDate: "2015-09-01",
                        endDate: "2019-06-30",
                        major: "Software Engineering",
                        degree: "Master",
                        institution: "HCMUT"
                    }
                ]
            }
        },
        isPublic: true,
        createdAt: "2025-06-07T10:00:00Z",
        updatedAt: "2025-06-07T10:30:00Z",
        templateId: "modern-1",
        isSaved: true,
        isFinalized: true
    }
];

// Dữ liệu fix cứng cho CoverLetters
const mockCoverLetters: CoverLetter[] = [
    {
        _id: "665e921c45c2e8c9a4a44444",
        userId: "68552606392287395a95a3db",
        templateId: "68537ef398cb1d0aae6dae5f",
        title: "Frontend Developer Cover Letter",
        data: {
            firstName: "Nguyen",
            lastName: "Van A",
            profession: "Frontend Developer",
            city: "Hanoi",
            state: "Hanoi",
            phone: "+84 912 345 678",
            email: "vana@example.com",
            date: "June 12, 2025",
            recipientFirstName: "Katherine",
            recipientLastName: "Bloomstein",
            companyName: "TechCorp",
            recipientCity: "Ho Chi Minh City",
            recipientState: "Vietnam",
            recipientPhone: "123-456-7890",
            recipientEmail: "hr@techcorp.com",
            subject: "RE: Frontend Developer Position",
            greeting: "Dear Ms. Bloomstein,",
            opening: "I am writing to express my interest in the Frontend Developer position at TechCorp.",
            body: "With 5 years of experience in React and modern web development, I am excited about the opportunity to contribute to your team.",
            callToAction: "Thank you for considering my application.",
            closing: "Sincerely,",
            signature: "Nguyen Van A"
        },
        isSaved: true,
        createdAt: "2025-06-19T14:31:17.426Z",
        updatedAt: "2025-06-19T15:42:28.351Z"
    },
    {
        _id: "665e921c45c2e8c9a4a44445",
        userId: "68513189121f75f7bba16f8a",
        templateId: "68537ef398cb1d0aae6dae5f",
        title: "Backend Developer Cover Letter",
        data: {
            firstName: "Tran",
            lastName: "Thi B",
            profession: "Backend Developer",
            city: "Ho Chi Minh City",
            state: "Ho Chi Minh",
            phone: "+84 987 654 321",
            email: "thib@example.com",
            date: "June 13, 2025",
            recipientFirstName: "John",
            recipientLastName: "Smith",
            companyName: "DataSoft",
            recipientCity: "Ho Chi Minh City",
            recipientState: "Vietnam",
            recipientPhone: "098-765-4321",
            recipientEmail: "hr@datasoft.com",
            subject: "RE: Backend Developer Position",
            greeting: "Dear Mr. Smith,",
            opening: "I am writing to express my interest in the Backend Developer position at DataSoft.",
            body: "With extensive experience in Node.js and database design, I am excited about the opportunity to contribute to your team.",
            callToAction: "Thank you for considering my application.",
            closing: "Sincerely,",
            signature: "Tran Thi B"
        },
        isSaved: true,
        createdAt: "2025-06-19T14:31:17.426Z",
        updatedAt: "2025-06-19T15:42:28.351Z"
    }
];

// Dữ liệu fix cứng cho applications
const mockApplyJobs: ApplyJob[] = [
    {
        _id: "6855a0dbc366e4dd961cc7eb",
        job_id: "68559556c366e4dd961cc7e4", // Frontend Developer
        user_id: "68552606392287395a95a3db",
        cv_id: "665e920845c2e8c9a4a33333",
        coverletter_id: "665e921c45c2e8c9a4a44444",
        status: "pending",
        submit_at: "2025-06-20T14:00:00.000Z"
    },
    {
        _id: "6855a0dbc366e4dd961cc7ec",
        job_id: "68559556c366e4dd961cc7e5", // Backend Developer
        user_id: "2",
        cv_id: "665e920845c2e8c9a4a33334",
        coverletter_id: "665e921c45c2e8c9a4a44445",
        status: "reviewed",
        submit_at: "2025-06-18T10:00:00.000Z"
    },
]

// Định nghĩa interface cho Application (kết hợp CV và Cover Letter)
interface HydratedApplication {
    applyJob: ApplyJob,
    job: Job,
    cv: CV,
    coverLetter: CoverLetter
}

export default function ManageApplyJobPage() {
    const [applications, setApplications] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
    const [isJobDialogOpen, setIsJobDialogOpen] = useState(false)
    const [selectedApplication, setSelectedApplication] = useState<HydratedApplication | null>(null)

    // Thêm thanh tab lọc status
    const statusTabs = [
        { label: 'All', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'Reviewed', value: 'reviewed' },
        { label: 'Rejected', value: 'rejected' },
    ];

    // Đếm số lượng ứng viên theo từng status
    const statusCounts = applications.reduce((acc: any, app: any) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
    }, {});

    // Lọc lại filteredApplications theo statusFilter
    const filteredApplications = statusFilter === 'all'
        ? applications
        : applications.filter((app: any) => app.status === statusFilter);

    // Thêm lọc theo searchTerm (tìm theo tên, email, job title)
    const searchedApplications = searchTerm.trim() === ''
        ? filteredApplications
        : filteredApplications.filter((app: any) => {
            const name = (app.cvId?.content?.userData?.firstName || app.userId?.first_name || '') + ' ' + (app.cvId?.content?.userData?.lastName || app.userId?.last_name || '');
            const email = app.cvId?.content?.userData?.email || app.userId?.email || '';
            const jobTitle = app.jobId?.title || app.job_id || '';
            const search = searchTerm.toLowerCase();
            return (
                name.toLowerCase().includes(search) ||
                email.toLowerCase().includes(search) ||
                jobTitle.toLowerCase().includes(search)
            );
        });

    useEffect(() => {
        getApplyJobByHR().then((data: any) => {
            console.log('Dữ liệu apply-job/by-hr từ API:', data);
            let arr = Array.isArray(data) ? data : (data && data.data ? data.data : []);
            setApplications(arr);
        });
    }, []);

    // Add this function to handle status change
    const handleStatusChange = async (applyJobId: string, newStatus: string) => {
        try {
            // Call the API to update status by HR
            const res = await fetch(`/api/apply-job/${applyJobId}/status/by-hr`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setApplications((prev: any[]) => prev.map(item => item._id === applyJobId ? { ...item, status: newStatus } : item));
            } else {
                alert('Failed to update status');
            }
        } catch (err) {
            alert('Error updating status');
        }
    };

    // XÓA HOẶC BỎ QUA PHẦN hydratedApplications, mockJobs, mockCVs, mockCoverLetters

    // Render trực tiếp từ dữ liệu API trả về
    // Lọc lại filteredApplications chỉ lấy đúng statusFilter
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "pending":
                return "bg-yellow-100 text-yellow-800"
            case "reviewed":
                return "bg-blue-100 text-blue-800"
            case "interviewed":
                return "bg-purple-100 text-purple-800"
            case "hired":
                return "bg-green-100 text-green-800"
            case "rejected":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const getStatusActions = (status: ApplyJob["status"]) => {
        if (!selectedApplication) return null

        const currentApplication = selectedApplication // Capture current value

        switch (status) {
            case "pending":
                return (
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(currentApplication.applyJob._id, "reviewed")}
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                            <Check className="h-4 w-4 mr-1" />
                            Review
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(currentApplication.applyJob._id, "rejected")}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                        </Button>
                    </>
                )
            case "reviewed":
                return (
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(currentApplication.applyJob._id, "interviewed")}
                            className="text-purple-600 border-purple-600 hover:bg-purple-50"
                        >
                            Schedule Interview
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(currentApplication.applyJob._id, "rejected")}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                        </Button>
                    </>
                )
            case "interviewed":
                return (
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(currentApplication.applyJob._id, "hired")}
                            className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                            <Check className="h-4 w-4 mr-1" />
                            Hire
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(currentApplication.applyJob._id, "rejected")}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                        </Button>
                    </>
                )
            default:
                return null
        }
    }

    const handleViewCV = (cvId: string) => {
        // Tạm thời mở trong tab mới, bạn có thể thay đổi link này
        window.open(`/cv/${cvId}`, '_blank')
    }

    const handleViewCoverLetter = (coverLetterId: string) => {
        // Tạm thời mở trong tab mới, bạn có thể thay đổi link này
        window.open(`/cover-letter/${coverLetterId}`, '_blank')
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Manage Job Applications</h1>
            </div>
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
                {/* StatusRadioTabs UI đẹp */}
                <StatusRadioTabs
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                />
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Candidate</TableHead>
                                <TableHead>Job Title</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Applied Date</TableHead>
                                <TableHead>Experience</TableHead>
                                <TableHead>Documents</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {searchedApplications.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-gray-400">No applications found for this status.</TableCell>
                                </TableRow>
                            ) : searchedApplications.map((app: any) => (
                                <TableRow key={app._id}>
                                    <TableCell>
                                        {/* Candidate info */}
                                        <div className="flex items-center space-x-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={app.cvId?.content?.userData?.avatar || app.cvId?.avatar || '/placeholder-user.jpg'} />
                                                <AvatarFallback>
                                                    {app.cvId?.content?.userData?.firstName?.[0] || ''}{app.cvId?.content?.userData?.lastName?.[0] || ''}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">
                                                    {app.cvId?.content?.userData?.firstName || app.userId?.first_name || '-'} {app.cvId?.content?.userData?.lastName || app.userId?.last_name || ''}
                                                </div>
                                                <div className="text-sm text-muted-foreground">{app.cvId?.content?.userData?.email || app.userId?.email || '-'}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{app.jobId?.title || app.job_id || '-'}</TableCell>
                                    <TableCell>{app.jobId?.role || app.jobId?.Role || '-'}</TableCell>
                                    <TableCell>{app.createdAt
                                        ? new Date(app.createdAt).toLocaleDateString()
                                        : (app.submit_at ? new Date(app.submit_at).toLocaleDateString() : '-')}</TableCell>
                                    <TableCell>{app.cvId?.content?.userData?.professional || '-'}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewCV(app.cvId?._id || app.cv_id)}
                                                className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                            >
                                                <FileText className="h-4 w-4 mr-1" />
                                                View CV
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewCoverLetter(app.coverletterId?._id || app.coverletter_id)}
                                                className="text-green-600 border-green-600 hover:bg-green-50"
                                            >
                                                <User className="h-4 w-4 mr-1" />
                                                View CL
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {app.status === 'pending' ? (
                                            <select
                                                value={app.status}
                                                onChange={async (e) => {
                                                    const newStatus = e.target.value;
                                                    try {
                                                        const res = await fetch(`/api/apply-job/${app._id}`, {
                                                            method: 'PATCH',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ status: newStatus }),
                                                        });
                                                        if (res.ok) {
                                                            setApplications((prev: any[]) => prev.map(item => item._id === app._id ? { ...item, status: newStatus } : item));
                                                        } else {
                                                            alert('Failed to update status');
                                                        }
                                                    } catch (err) {
                                                        alert('Error updating status');
                                                    }
                                                }}
                                                className="border rounded px-2 py-1 text-sm"
                                            >
                                                <option value="pending" disabled>Pending</option>
                                                <option value="reviewed">Reviewed</option>
                                                <option value="rejected">Rejected</option>
                                            </select>
                                        ) : (
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(app.status)}`}>
                                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                            </span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Candidate Details Dialog */}
            <CandidateDetailsDialog
                open={isViewDialogOpen}
                onOpenChange={(isOpen: boolean) => {
                    if (!isOpen) setSelectedApplication(null);
                    setIsViewDialogOpen(isOpen);
                }}
                application={selectedApplication}
                getStatusColor={getStatusColor}
                handleViewCV={handleViewCV}
                handleViewCoverLetter={handleViewCoverLetter}
                getStatusActions={getStatusActions}
            />

            {/* Job Info Dialog */}
            <JobInfoDialog
                open={isJobDialogOpen}
                onOpenChange={(isOpen: boolean) => {
                    if (!isOpen) setSelectedApplication(null);
                    setIsJobDialogOpen(isOpen);
                }}
                application={selectedApplication}
            />
        </div>
    )
}
