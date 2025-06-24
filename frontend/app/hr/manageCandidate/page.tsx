"use client"

import { useState } from "react"
import { Eye, Edit, Trash2, Search, Download, Mail, Phone, MapPin, Calendar, GraduationCap, Briefcase, FileText, User } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
    status: "not interviewed" | "interviewed";
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
        status: "not interviewed",
        submit_at: "2025-06-20T14:00:00.000Z"
    },
    {
        _id: "6855a0dbc366e4dd961cc7ec",
        job_id: "68559556c366e4dd961cc7e5", // Backend Developer
        user_id: "2",
        cv_id: "665e920845c2e8c9a4a33334",
        coverletter_id: "665e921c45c2e8c9a4a44445",
        status: "interviewed",
        submit_at: "2025-06-18T10:00:00.000Z"
    },
]

// Định nghĩa interface cho Candidate (kết hợp CV và Cover Letter)
interface HydratedCandidate {
    cv: CV,
    coverLetter: CoverLetter,
    applyJobs: ApplyJob[],
    jobs: Job[]
}

export default function ManageCandidatePage() {
    const [candidates, setCandidates] = useState<HydratedCandidate[]>(() => {
        // Tạo danh sách candidates từ CVs
        return mockCVs.map(cv => {
            const coverLetter = mockCoverLetters.find(cl => cl.userId === cv.userId);
            const applyJobs = mockApplyJobs.filter(aj => aj.user_id === cv.userId);
            const jobs = applyJobs.map(aj => mockJobs.find(j => j._id === aj.job_id)).filter(Boolean) as Job[];

            return {
                cv,
                coverLetter: coverLetter!,
                applyJobs,
                jobs
            };
        });
    });
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("All")
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedCandidate, setSelectedCandidate] = useState<HydratedCandidate | null>(null)

    const filteredCandidates = candidates.filter(candidate =>
        (candidate.cv.content.userData.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.cv.content.userData.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.cv.content.userData.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.cv.content.userData.skills.some(skill => skill.name.toLowerCase().includes(searchTerm.toLowerCase()))) &&
        (statusFilter === "All" || candidate.applyJobs.some(aj => aj.status === statusFilter))
    )

    const handleDeleteCandidate = () => {
        if (selectedCandidate) {
            setCandidates(candidates.filter(candidate => candidate.cv._id !== selectedCandidate.cv._id))
            setIsDeleteDialogOpen(false)
            setSelectedCandidate(null)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "not interviewed":
                return "bg-yellow-100 text-yellow-800"
            case "interviewed":
                return "bg-green-100 text-green-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const handleViewCV = (cvId: string) => {
        window.open(`/cv/${cvId}`, '_blank')
    }

    const handleViewCoverLetter = (coverLetterId: string) => {
        window.open(`/cover-letter/${coverLetterId}`, '_blank')
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Manage Candidates</h1>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <Label htmlFor="status-filter">Filter by Status:</Label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All</SelectItem>
                                <SelectItem value="not interviewed">Not Interviewed</SelectItem>
                                <SelectItem value="interviewed">Interviewed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Candidates Database</CardTitle>
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
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Candidate</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Experience</TableHead>
                                <TableHead>Skills</TableHead>
                                <TableHead>Applied Jobs</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Active</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCandidates.map((candidate) => (
                                <TableRow key={candidate.cv._id}>
                                    <TableCell>
                                        <div className="flex items-center space-x-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={candidate.cv.content.userData.avatar} />
                                                <AvatarFallback>
                                                    {candidate.cv.content.userData.firstName[0]}{candidate.cv.content.userData.lastName[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">
                                                    {candidate.cv.content.userData.firstName} {candidate.cv.content.userData.lastName}
                                                </div>
                                                <div className="text-sm text-muted-foreground">{candidate.cv.content.userData.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-1">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span>{candidate.cv.content.userData.city}, {candidate.cv.content.userData.country}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{candidate.cv.content.userData.professional}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {candidate.cv.content.userData.skills.slice(0, 3).map((skill, index) => (
                                                <Badge key={index} variant="secondary" className="text-xs">
                                                    {skill.name}
                                                </Badge>
                                            ))}
                                            {candidate.cv.content.userData.skills.length > 3 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{candidate.cv.content.userData.skills.length - 3}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{candidate.applyJobs.length}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            {candidate.applyJobs.map((applyJob, index) => (
                                                <Badge key={index} className={getStatusColor(applyJob.status)}>
                                                    {applyJob.status}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>{new Date(candidate.cv.updatedAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setSelectedCandidate(candidate)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                                    <DialogHeader>
                                                        <DialogTitle>Candidate Profile</DialogTitle>
                                                        <DialogDescription>
                                                            Detailed information about {selectedCandidate?.cv.content.userData.firstName} {selectedCandidate?.cv.content.userData.lastName}
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    {selectedCandidate && (
                                                        <Tabs defaultValue="profile" className="w-full">
                                                            <TabsList className="grid w-full grid-cols-4">
                                                                <TabsTrigger value="profile">Profile</TabsTrigger>
                                                                <TabsTrigger value="experience">Experience</TabsTrigger>
                                                                <TabsTrigger value="applications">Applications</TabsTrigger>
                                                                <TabsTrigger value="documents">Documents</TabsTrigger>
                                                            </TabsList>

                                                            <TabsContent value="profile" className="space-y-4">
                                                                <div className="flex items-center space-x-4">
                                                                    <Avatar className="h-20 w-20">
                                                                        <AvatarImage src={selectedCandidate.cv.content.userData.avatar} />
                                                                        <AvatarFallback>
                                                                            {selectedCandidate.cv.content.userData.firstName[0]}{selectedCandidate.cv.content.userData.lastName[0]}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div>
                                                                        <h3 className="text-xl font-semibold">
                                                                            {selectedCandidate.cv.content.userData.firstName} {selectedCandidate.cv.content.userData.lastName}
                                                                        </h3>
                                                                        <p className="text-muted-foreground">{selectedCandidate.cv.content.userData.email}</p>
                                                                        <p className="text-muted-foreground">{selectedCandidate.cv.content.userData.phone}</p>
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <Label className="font-medium">Location</Label>
                                                                        <p className="flex items-center space-x-1">
                                                                            <MapPin className="h-4 w-4" />
                                                                            <span>{selectedCandidate.cv.content.userData.city}, {selectedCandidate.cv.content.userData.country}</span>
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <Label className="font-medium">Profession</Label>
                                                                        <p className="flex items-center space-x-1">
                                                                            <Briefcase className="h-4 w-4" />
                                                                            <span>{selectedCandidate.cv.content.userData.professional}</span>
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <Label className="font-medium">Education</Label>
                                                                        <p className="flex items-center space-x-1">
                                                                            <GraduationCap className="h-4 w-4" />
                                                                            <span>{selectedCandidate.cv.content.userData.education[0]?.degree} in {selectedCandidate.cv.content.userData.education[0]?.major}</span>
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <Label className="font-medium">Status</Label>
                                                                        <div className="flex flex-col gap-1">
                                                                            {selectedCandidate.applyJobs.map((applyJob, index) => (
                                                                                <Badge key={index} className={getStatusColor(applyJob.status)}>
                                                                                    {applyJob.status}
                                                                                </Badge>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <Label className="font-medium">Summary</Label>
                                                                    <p className="mt-2 text-sm">{selectedCandidate.cv.content.userData.summary}</p>
                                                                </div>

                                                                <div>
                                                                    <Label className="font-medium">Skills</Label>
                                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                                        {selectedCandidate.cv.content.userData.skills.map((skill, index) => (
                                                                            <Badge key={index} variant="secondary">
                                                                                {skill.name} ({skill.rating}/5)
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center space-x-2 pt-4 border-t">
                                                                    <Button variant="outline" size="sm" onClick={() => handleViewCV(selectedCandidate.cv._id)}>
                                                                        <FileText className="h-4 w-4 mr-1" />
                                                                        View CV
                                                                    </Button>
                                                                    <Button variant="outline" size="sm" onClick={() => handleViewCoverLetter(selectedCandidate.coverLetter._id)}>
                                                                        <User className="h-4 w-4 mr-1" />
                                                                        View Cover Letter
                                                                    </Button>
                                                                    <Button variant="outline" size="sm">
                                                                        <Mail className="h-4 w-4 mr-1" />
                                                                        Send Email
                                                                    </Button>
                                                                    <Button variant="outline" size="sm">
                                                                        <Phone className="h-4 w-4 mr-1" />
                                                                        Call
                                                                    </Button>
                                                                </div>
                                                            </TabsContent>

                                                            <TabsContent value="experience" className="space-y-4">
                                                                <div>
                                                                    <Label className="font-medium">Work Experience</Label>
                                                                    <div className="mt-2 space-y-3">
                                                                        {selectedCandidate.cv.content.userData.workHistory.map((work, index) => (
                                                                            <div key={index} className="p-3 border rounded-lg">
                                                                                <h4 className="font-medium">{work.title}</h4>
                                                                                <p className="text-sm text-muted-foreground">{work.company} • {work.startDate} - {work.endDate}</p>
                                                                                <p className="text-sm mt-1">{work.description}</p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </TabsContent>

                                                            <TabsContent value="applications" className="space-y-4">
                                                                <div>
                                                                    <Label className="font-medium">Recent Applications</Label>
                                                                    <div className="mt-2 space-y-2">
                                                                        {selectedCandidate.applyJobs.map((applyJob, index) => {
                                                                            const job = selectedCandidate.jobs.find(j => j._id === applyJob.job_id);
                                                                            return (
                                                                                <div key={index} className="p-3 border rounded-lg">
                                                                                    <h4 className="font-medium">{job?.["Job Title"] || "Unknown Job"}</h4>
                                                                                    <p className="text-sm text-muted-foreground">{job?.Role}</p>
                                                                                    <div className="flex items-center space-x-2 mt-2">
                                                                                        <Badge className={getStatusColor(applyJob.status)}>
                                                                                            {applyJob.status}
                                                                                        </Badge>
                                                                                        <span className="text-sm text-muted-foreground">
                                                                                            Applied: {new Date(applyJob.submit_at).toLocaleDateString()}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            </TabsContent>

                                                            <TabsContent value="documents" className="space-y-4">
                                                                <div>
                                                                    <Label className="font-medium">Documents</Label>
                                                                    <div className="mt-2 space-y-4">
                                                                        <div className="p-3 border rounded-lg">
                                                                            <h4 className="font-medium">CV Document</h4>
                                                                            <p className="text-sm text-muted-foreground">{selectedCandidate.cv.title}</p>
                                                                            <Button variant="outline" size="sm" className="mt-2" onClick={() => handleViewCV(selectedCandidate.cv._id)}>
                                                                                <FileText className="h-4 w-4 mr-1" />
                                                                                View CV
                                                                            </Button>
                                                                        </div>
                                                                        <div className="p-3 border rounded-lg">
                                                                            <h4 className="font-medium">Cover Letter</h4>
                                                                            <p className="text-sm text-muted-foreground">{selectedCandidate.coverLetter.title}</p>
                                                                            <Button variant="outline" size="sm" className="mt-2" onClick={() => handleViewCoverLetter(selectedCandidate.coverLetter._id)}>
                                                                                <User className="h-4 w-4 mr-1" />
                                                                                View Cover Letter
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </TabsContent>
                                                        </Tabs>
                                                    )}
                                                </DialogContent>
                                            </Dialog>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedCandidate(candidate)
                                                    setIsEditDialogOpen(true)
                                                }}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedCandidate(candidate)
                                                    setIsDeleteDialogOpen(true)
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold">{candidates.length}</div>
                        <div className="text-sm text-muted-foreground">Total Candidates</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-yellow-600">
                            {candidates.filter(c => c.applyJobs.some(aj => aj.status === "not interviewed")).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Not Interviewed</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">
                            {candidates.filter(c => c.applyJobs.some(aj => aj.status === "interviewed")).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Interviewed</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-blue-600">
                            {candidates.reduce((sum, c) => sum + c.applyJobs.length, 0)}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Applications</div>
                    </CardContent>
                </Card>
            </div>

            {/* Delete Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Candidate</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {selectedCandidate?.cv.content.userData.firstName} {selectedCandidate?.cv.content.userData.lastName}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteCandidate}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
