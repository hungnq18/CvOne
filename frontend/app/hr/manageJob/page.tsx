"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, Eye, Search, MapPin, Calendar, DollarSign, Briefcase, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

// Định nghĩa interface cho Job
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

// Dữ liệu fix cứng cho jobs theo cấu trúc mới
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
        "Job Description": "Social Media Managers oversee an organizations social media presence. They create and schedule content, engage with followers, and analyze social media metrics to drive brand awareness and engagement.",
        Benefits: "Flexible Spending Accounts (FSAs), Relocation Assistance, Legal Assistance, Employee Recognition Programs, Financial Counseling",
        skills: "Social media platforms (e.g., Facebook, Twitter, Instagram) Content creation and scheduling Social media analytics and insights Community engagement Paid social advertising",
        Responsibilities: "Manage and grow social media accounts, create engaging content, and interact with the online community. Develop social media content calendars and strategies. Monitor social media trends and engagement metrics.",
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
        "Job Description": "We are looking for a skilled Frontend Developer to join our team and help build modern web applications using React and TypeScript.",
        Benefits: "Health Insurance, Remote Work, Flexible Hours, Professional Development, Stock Options",
        skills: "React, TypeScript, JavaScript, HTML, CSS, Git, REST APIs, Responsive Design",
        Responsibilities: "Develop and maintain user-facing features, collaborate with design and backend teams, optimize applications for maximum speed and scalability, ensure code quality and best practices.",
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
        "Job Description": "Experienced Backend Developer needed for our growing platform. You will be responsible for building scalable server-side applications.",
        Benefits: "Competitive Salary, Health Benefits, Learning Budget, Team Events, Performance Bonuses",
        skills: "Node.js, Express, MongoDB, PostgreSQL, Docker, AWS, REST APIs, Microservices",
        Responsibilities: "Design and implement server-side logic, integrate with databases and third-party services, ensure high performance and responsiveness, maintain code quality and documentation.",
        user_id: "68552606392287395a95a3dd",
        status: "Active",
        applications: 12
    },
    {
        _id: "68559556c366e4dd961cc7e6",
        "Job Title": "UI/UX Designer",
        Role: "Product Designer",
        Experience: "2 to 6 Years",
        Qualifications: "B.Des",
        "Salary Range": "$40K-$65K",
        location: "Da Nang",
        Country: "Vietnam",
        "Work Type": "Part-time",
        "Job Posting Date": "1/5/2024",
        "Job Description": "Creative UI/UX Designer to create beautiful user experiences and intuitive interfaces for our digital products.",
        Benefits: "Flexible Schedule, Creative Freedom, Latest Tools, Portfolio Building, Remote Work",
        skills: "Figma, Adobe XD, Sketch, Prototyping, User Research, Design Systems, Wireframing",
        Responsibilities: "Create user-centered designs, conduct user research and usability testing, collaborate with product and engineering teams, maintain design consistency across platforms.",
        user_id: "68552606392287395a95a3de",
        status: "Inactive",
        applications: 6
    },
    {
        _id: "68559556c366e4dd961cc7e7",
        "Job Title": "DevOps Engineer",
        Role: "Cloud Infrastructure Engineer",
        Experience: "5 to 12 Years",
        Qualifications: "B.Tech",
        "Salary Range": "$70K-$110K",
        location: "Ho Chi Minh City",
        Country: "Vietnam",
        "Work Type": "Full-time",
        "Job Posting Date": "1/20/2024",
        "Job Description": "DevOps Engineer to manage our cloud infrastructure and implement CI/CD pipelines for efficient software delivery.",
        Benefits: "High Salary, Stock Options, Health Insurance, Professional Certifications, Conference Attendance",
        skills: "AWS, Kubernetes, Jenkins, Terraform, Docker, Linux, Shell Scripting, Monitoring",
        Responsibilities: "Manage cloud infrastructure, implement CI/CD pipelines, ensure system reliability and security, automate deployment processes, monitor system performance.",
        user_id: "68552606392287395a95a3df",
        status: "Active",
        applications: 4
    }
]

export default function ManageJobPage() {
    const [jobs, setJobs] = useState<Job[]>(mockJobs)
    const [searchTerm, setSearchTerm] = useState("")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedJob, setSelectedJob] = useState<Job | null>(null)
    const [newJob, setNewJob] = useState<Partial<Job>>({
        "Job Title": "",
        Role: "",
        Experience: "",
        Qualifications: "",
        "Salary Range": "",
        location: "",
        Country: "",
        "Work Type": "",
        "Job Description": "",
        Benefits: "",
        skills: "",
        Responsibilities: ""
    })

    const filteredJobs = jobs.filter(job =>
        job["Job Title"].toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.Role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.Country.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleAddJob = () => {
        const job: Job = {
            _id: `job_${Date.now()}`,
            "Job Title": newJob["Job Title"] || "",
            Role: newJob.Role || "",
            Experience: newJob.Experience || "",
            Qualifications: newJob.Qualifications || "",
            "Salary Range": newJob["Salary Range"] || "",
            location: newJob.location || "",
            Country: newJob.Country || "",
            "Work Type": newJob["Work Type"] || "",
            "Job Posting Date": new Date().toLocaleDateString(),
            "Job Description": newJob["Job Description"] || "",
            Benefits: newJob.Benefits || "",
            skills: newJob.skills || "",
            Responsibilities: newJob.Responsibilities || "",
            user_id: "current_user_id",
            status: "Active",
            applications: 0
        }
        setJobs([...jobs, job])
        setNewJob({
            "Job Title": "",
            Role: "",
            Experience: "",
            Qualifications: "",
            "Salary Range": "",
            location: "",
            Country: "",
            "Work Type": "",
            "Job Description": "",
            Benefits: "",
            skills: "",
            Responsibilities: ""
        })
        setIsAddDialogOpen(false)
    }

    const handleEditJob = () => {
        if (selectedJob) {
            setJobs(jobs.map(job => job._id === selectedJob._id ? { ...selectedJob } : job))
            setIsEditDialogOpen(false)
            setSelectedJob(null)
        }
    }

    const handleDeleteJob = () => {
        if (selectedJob) {
            setJobs(jobs.filter(job => job._id !== selectedJob._id))
            setIsDeleteDialogOpen(false)
            setSelectedJob(null)
        }
    }

    const getStatusColor = (status: string) => {
        return status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
    }

    const getWorkTypeColor = (workType: string) => {
        switch (workType) {
            case "Full-time":
                return "bg-blue-100 text-blue-800"
            case "Part-time":
                return "bg-purple-100 text-purple-800"
            case "Intern":
                return "bg-orange-100 text-orange-800"
            case "Contract":
                return "bg-yellow-100 text-yellow-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    return (
        <div className="p-2 sm:p-4 md:p-6 space-y-6 max-w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold">Manage Jobs</h1>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2 w-full sm:w-auto">
                            <Plus className="h-4 w-4" />
                            Add New Job
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="w-full max-w-xl sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Add New Job</DialogTitle>
                            <DialogDescription>
                                Create a new job posting for your company.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="job-title">Job Title</Label>
                                    <Input
                                        id="job-title"
                                        value={newJob["Job Title"] || ""}
                                        onChange={(e) => setNewJob({ ...newJob, "Job Title": e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="role">Role</Label>
                                    <Input
                                        id="role"
                                        value={newJob.Role || ""}
                                        onChange={(e) => setNewJob({ ...newJob, Role: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="experience">Experience</Label>
                                    <Input
                                        id="experience"
                                        value={newJob.Experience || ""}
                                        onChange={(e) => setNewJob({ ...newJob, Experience: e.target.value })}
                                        placeholder="e.g., 3 to 8 Years"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="qualifications">Qualifications</Label>
                                    <Input
                                        id="qualifications"
                                        value={newJob.Qualifications || ""}
                                        onChange={(e) => setNewJob({ ...newJob, Qualifications: e.target.value })}
                                        placeholder="e.g., B.Tech, M.Tech"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="salary-range">Salary Range</Label>
                                    <Input
                                        id="salary-range"
                                        value={newJob["Salary Range"] || ""}
                                        onChange={(e) => setNewJob({ ...newJob, "Salary Range": e.target.value })}
                                        placeholder="e.g., $45K-$75K"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="work-type">Work Type</Label>
                                    <Select value={newJob["Work Type"] || ""} onValueChange={(value) => setNewJob({ ...newJob, "Work Type": value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select work type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Full-time">Full-time</SelectItem>
                                            <SelectItem value="Part-time">Part-time</SelectItem>
                                            <SelectItem value="Intern">Intern</SelectItem>
                                            <SelectItem value="Contract">Contract</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        value={newJob.location || ""}
                                        onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="country">Country</Label>
                                    <Input
                                        id="country"
                                        value={newJob.Country || ""}
                                        onChange={(e) => setNewJob({ ...newJob, Country: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="job-description">Job Description</Label>
                                <Textarea
                                    id="job-description"
                                    value={newJob["Job Description"] || ""}
                                    onChange={(e) => setNewJob({ ...newJob, "Job Description": e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="responsibilities">Responsibilities</Label>
                                <Textarea
                                    id="responsibilities"
                                    value={newJob.Responsibilities || ""}
                                    onChange={(e) => setNewJob({ ...newJob, Responsibilities: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="skills">Skills</Label>
                                <Textarea
                                    id="skills"
                                    value={newJob.skills || ""}
                                    onChange={(e) => setNewJob({ ...newJob, skills: e.target.value })}
                                    rows={2}
                                    placeholder="Enter skills separated by commas"
                                />
                            </div>

                            <div>
                                <Label htmlFor="benefits">Benefits</Label>
                                <Textarea
                                    id="benefits"
                                    value={newJob.Benefits || ""}
                                    onChange={(e) => setNewJob({ ...newJob, Benefits: e.target.value })}
                                    rows={2}
                                    placeholder="Enter benefits separated by commas"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" onClick={handleAddJob}>Add Job</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Job Listings</CardTitle>
                    <div className="flex items-center space-x-2 w-full">
                        <div className="relative w-full max-w-xs">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search jobs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8 w-full"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="overflow-x-auto p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Job Title</TableHead>
                                <TableHead className="hidden md:table-cell">Role</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead className="hidden lg:table-cell">Experience</TableHead>
                                <TableHead className="hidden md:table-cell">Salary Range</TableHead>
                                <TableHead>Work Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="hidden md:table-cell">Applications</TableHead>
                                <TableHead className="hidden lg:table-cell">Posted Date</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredJobs.map((job) => (
                                <TableRow key={job._id}>
                                    <TableCell className="font-medium">{job["Job Title"]}</TableCell>
                                    <TableCell className="hidden md:table-cell">{job.Role}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-1">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span>{job.location}, {job.Country}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell">{job.Experience}</TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <div className="flex items-center space-x-1">
                                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                                            <span>{job["Salary Range"]}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getWorkTypeColor(job["Work Type"])}>
                                            {job["Work Type"]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(job.status || "Active")}>
                                            {job.status || "Active"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">{job.applications || 0}</TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                        <div className="flex items-center space-x-1">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span>{job["Job Posting Date"]}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedJob(job)
                                                    setIsEditDialogOpen(true)
                                                }}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedJob(job)
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

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="w-full max-w-xl sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Job</DialogTitle>
                        <DialogDescription>
                            Update the job posting details.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedJob && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit-job-title">Job Title</Label>
                                    <Input
                                        id="edit-job-title"
                                        value={selectedJob["Job Title"]}
                                        onChange={(e) => setSelectedJob({ ...selectedJob, "Job Title": e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-role">Role</Label>
                                    <Input
                                        id="edit-role"
                                        value={selectedJob.Role}
                                        onChange={(e) => setSelectedJob({ ...selectedJob, Role: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit-experience">Experience</Label>
                                    <Input
                                        id="edit-experience"
                                        value={selectedJob.Experience}
                                        onChange={(e) => setSelectedJob({ ...selectedJob, Experience: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-qualifications">Qualifications</Label>
                                    <Input
                                        id="edit-qualifications"
                                        value={selectedJob.Qualifications}
                                        onChange={(e) => setSelectedJob({ ...selectedJob, Qualifications: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit-salary-range">Salary Range</Label>
                                    <Input
                                        id="edit-salary-range"
                                        value={selectedJob["Salary Range"]}
                                        onChange={(e) => setSelectedJob({ ...selectedJob, "Salary Range": e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-work-type">Work Type</Label>
                                    <Select value={selectedJob["Work Type"]} onValueChange={(value) => setSelectedJob({ ...selectedJob, "Work Type": value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Full-time">Full-time</SelectItem>
                                            <SelectItem value="Part-time">Part-time</SelectItem>
                                            <SelectItem value="Intern">Intern</SelectItem>
                                            <SelectItem value="Contract">Contract</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit-location">Location</Label>
                                    <Input
                                        id="edit-location"
                                        value={selectedJob.location}
                                        onChange={(e) => setSelectedJob({ ...selectedJob, location: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-country">Country</Label>
                                    <Input
                                        id="edit-country"
                                        value={selectedJob.Country}
                                        onChange={(e) => setSelectedJob({ ...selectedJob, Country: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="edit-job-description">Job Description</Label>
                                <Textarea
                                    id="edit-job-description"
                                    value={selectedJob["Job Description"]}
                                    onChange={(e) => setSelectedJob({ ...selectedJob, "Job Description": e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit-responsibilities">Responsibilities</Label>
                                <Textarea
                                    id="edit-responsibilities"
                                    value={selectedJob.Responsibilities}
                                    onChange={(e) => setSelectedJob({ ...selectedJob, Responsibilities: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit-skills">Skills</Label>
                                <Textarea
                                    id="edit-skills"
                                    value={selectedJob.skills}
                                    onChange={(e) => setSelectedJob({ ...selectedJob, skills: e.target.value })}
                                    rows={2}
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit-benefits">Benefits</Label>
                                <Textarea
                                    id="edit-benefits"
                                    value={selectedJob.Benefits}
                                    onChange={(e) => setSelectedJob({ ...selectedJob, Benefits: e.target.value })}
                                    rows={2}
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit-status">Status</Label>
                                <Select value={selectedJob.status || "Active"} onValueChange={(value) => setSelectedJob({ ...selectedJob, status: value as "Active" | "Inactive" })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button type="submit" onClick={handleEditJob}>Update Job</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Job</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this job posting? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteJob}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
