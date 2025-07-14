import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import React from 'react';

export default function JobInfoDialog({ open, onOpenChange, application }: any) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Job Info</DialogTitle>
                    <DialogDescription>
                        View detailed information about the job this candidate applied for.
                    </DialogDescription>
                </DialogHeader>
                {application && (
                    <div className="space-y-4">
                        <div className="border-b pb-4">
                            <h3 className="text-xl font-bold">{application.job["Job Title"]}</h3>
                            <p className="text-lg text-muted-foreground">{application.job.Role}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="font-medium">Experience Required</Label>
                                <p>{application.job.Experience}</p>
                            </div>
                            <div>
                                <Label className="font-medium">Qualifications</Label>
                                <p>{application.job.Qualifications}</p>
                            </div>
                            <div>
                                <Label className="font-medium">Salary Range</Label>
                                <p>{application.job["Salary Range"]}</p>
                            </div>
                            <div>
                                <Label className="font-medium">Work Type</Label>
                                <p>{application.job["Work Type"]}</p>
                            </div>
                            <div>
                                <Label className="font-medium">Location</Label>
                                <p>{application.job.location}, {application.job.Country}</p>
                            </div>
                            <div>
                                <Label className="font-medium">Posted Date</Label>
                                <p>{application.job["Job Posting Date"]}</p>
                            </div>
                        </div>

                        <div>
                            <Label className="font-medium">Job Description</Label>
                            <p className="mt-2 text-sm text-muted-foreground">{application.job["Job Description"]}</p>
                        </div>

                        <div>
                            <Label className="font-medium">Responsibilities</Label>
                            <p className="mt-2 text-sm text-muted-foreground">{application.job.Responsibilities}</p>
                        </div>

                        <div>
                            <Label className="font-medium">Required Skills</Label>
                            <p className="mt-2 text-sm text-muted-foreground">{application.job.skills}</p>
                        </div>

                        <div>
                            <Label className="font-medium">Benefits</Label>
                            <p className="mt-2 text-sm text-muted-foreground">{application.job.Benefits}</p>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
} 