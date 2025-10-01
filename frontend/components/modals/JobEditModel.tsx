import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Job {
  _id: string;
  "Job Title": string;
  Role: string;
  Experience: string;
  Qualifications: string;
  "Salary Range": string;
  location: string;
  Country: string;
  "Work Type": string;
  "Job Posting Date": string;
  "Job Description": string;
  Benefits: string;
  skills: string;
  Responsibilities: string;
  user_id: string;
  isActive: boolean;
  applications?: number;
  applicationDeadline: string;
}

interface JobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Partial<Job>;
  onChange: (job: Partial<Job>) => void;
  onSave: () => void;
  isEdit?: boolean;
  errors?: { [key: string]: string };
}

const JobDialog: React.FC<JobDialogProps> = ({
  open,
  onOpenChange,
  job,
  onChange,
  onSave,
  isEdit,
  errors,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-xl sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Job" : "Add New Job"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the job posting details."
              : "Create a new job posting for your company."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="job-title">Job Title</Label>
              <Input
                id="job-title"
                value={job["Job Title"] || ""}
                onChange={(e) =>
                  onChange({ ...job, "Job Title": e.target.value })
                }
                maxLength={200}
              />
              {errors?.["Job Title"] && (
                <div className="text-red-500 text-xs mt-1">
                  {errors["Job Title"]}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={job.Role || ""}
                onChange={(e) => onChange({ ...job, Role: e.target.value })}
                maxLength={200}
              />
              {errors?.Role && (
                <div className="text-red-500 text-xs mt-1">{errors.Role}</div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="experience">Experience</Label>
              <Input
                id="experience"
                value={job.Experience || ""}
                onChange={(e) =>
                  onChange({ ...job, Experience: e.target.value })
                }
                placeholder="e.g., 3 to 8 Years"
              />
              {errors?.Experience && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.Experience}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="qualifications">Qualifications</Label>
              <Input
                id="qualifications"
                value={job.Qualifications || ""}
                onChange={(e) =>
                  onChange({ ...job, Qualifications: e.target.value })
                }
                placeholder="e.g., B.Tech, M.Tech"
                maxLength={200}
              />
              {errors?.Qualifications && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.Qualifications}
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salary-range">Salary Range</Label>
              <Input
                id="salary-range"
                value={job["Salary Range"] || ""}
                onChange={(e) =>
                  onChange({ ...job, "Salary Range": e.target.value })
                }
                placeholder="e.g., $45K-$75K"
              />
              {errors?.["Salary Range"] && (
                <div className="text-red-500 text-xs mt-1">
                  {errors["Salary Range"]}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="work-type">Work Type</Label>
              <Select
                value={job["Work Type"] || ""}
                onValueChange={(value) =>
                  onChange({ ...job, "Work Type": value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select work type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Intern">Intern</SelectItem>
                  <SelectItem value="Temporary">Temporary</SelectItem>
                </SelectContent>
              </Select>
              {errors?.["Work Type"] && (
                <div className="text-red-500 text-xs mt-1">
                  {errors["Work Type"]}
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={job.location || ""}
                onChange={(e) => onChange({ ...job, location: e.target.value })}
                maxLength={200}
              />
              {errors?.location && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.location}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={job.Country || ""}
                onChange={(e) => onChange({ ...job, Country: e.target.value })}
                maxLength={200}
              />
              {errors?.Country && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.Country}
                </div>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="application-deadline">Application Deadline</Label>
            <Input
              id="application-deadline"
              type="date"
              min={new Date().toISOString().split("T")[0]} // Đảm bảo ngày tối thiểu là hôm nay: 2025-07-24
              value={
                job.applicationDeadline ||
                new Date().toISOString().split("T")[0]
              } // Mặc định là ngày hiện tại: 2025-07-24
              onChange={(e) =>
                onChange({
                  ...job,
                  applicationDeadline:
                    e.target.value || new Date().toISOString().split("T")[0],
                })
              }
              required // Đảm bảo người dùng phải chọn ngày
            />
            {errors?.applicationDeadline && (
              <div className="text-red-500 text-xs mt-1">
                {errors.applicationDeadline}
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="job-description">Job Description</Label>
            <div className="relative">
              <Textarea
                id="job-description"
                value={job["Job Description"] || ""}
                onChange={(e) =>
                  onChange({ ...job, "Job Description": e.target.value })
                }
                rows={3}
                maxLength={500}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {(job["Job Description"] || "").length}/500
              </div>
            </div>
            {errors?.["Job Description"] && (
              <div className="text-red-500 text-xs mt-1">
                {errors["Job Description"]}
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="responsibilities">Responsibilities</Label>
            <div className="relative">
              <Textarea
                id="responsibilities"
                value={job.Responsibilities || ""}
                onChange={(e) =>
                  onChange({ ...job, Responsibilities: e.target.value })
                }
                rows={3}
                maxLength={500}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {(job.Responsibilities || "").length}/500
              </div>
            </div>
            {errors?.Responsibilities && (
              <div className="text-red-500 text-xs mt-1">
                {errors.Responsibilities}
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="skills">Skills</Label>
            <div className="relative">
              <Textarea
                id="skills"
                value={job.skills || ""}
                onChange={(e) => onChange({ ...job, skills: e.target.value })}
                rows={2}
                placeholder="Enter skills separated by commas"
                maxLength={100}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {(job.skills || "").length}/100
              </div>
            </div>
            {errors?.skills && (
              <div className="text-red-500 text-xs mt-1">{errors.skills}</div>
            )}
          </div>
          <div>
            <Label htmlFor="benefits">Benefits</Label>
            <div className="relative">
              <Textarea
                id="benefits"
                value={job.Benefits || ""}
                onChange={(e) => onChange({ ...job, Benefits: e.target.value })}
                rows={2}
                placeholder="Enter benefits separated by commas"
                maxLength={100}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {(job.Benefits || "").length}/100
              </div>
            </div>
            {errors?.Benefits && (
              <div className="text-red-500 text-xs mt-1">{errors.Benefits}</div>
            )}
          </div>
          {isEdit && (
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={job.isActive ? "Active" : "Inactive"}
                onValueChange={(value) =>
                  onChange({ ...job, isActive: value === "Active" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {errors?.general && (
            <div className="text-red-500 text-xs mt-2">{errors.general}</div>
          )}
        </div>
        <DialogFooter>
          <Button type="submit" onClick={onSave}>
            {isEdit ? "Update Job" : "Add Job"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JobDialog;
