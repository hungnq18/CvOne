import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, User } from 'lucide-react';
import React from 'react';

export default function CandidateDetailsDialog({ open, onOpenChange, application, getStatusColor, handleViewCV, handleViewCoverLetter, getStatusActions }: any) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Candidate Details</DialogTitle>
                    <DialogDescription>
                        View detailed information about this application.
                    </DialogDescription>
                </DialogHeader>
                {application && (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={application.cv.content.userData.avatar} />
                                <AvatarFallback>
                                    {application.cv.content.userData.firstName[0]}{application.cv.content.userData.lastName[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-lg font-semibold">
                                    {application.cv.content.userData.firstName} {application.cv.content.userData.lastName}
                                </h3>
                                <p className="text-muted-foreground">{application.cv.content.userData.email}</p>
                                <p className="text-muted-foreground">{application.cv.content.userData.phone}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="font-medium">Job Title</Label>
                                <p>{application.job["Job Title"]}</p>
                            </div>
                            <div>
                                <Label className="font-medium">Role</Label>
                                <p>{application.job.Role}</p>
                            </div>
                            <div>
                                <Label className="font-medium">Profession</Label>
                                <p>{application.cv.content.userData.professional}</p>
                            </div>
                            <div>
                                <Label className="font-medium">Location</Label>
                                <p>{application.cv.content.userData.city}, {application.cv.content.userData.country}</p>
                            </div>
                            <div>
                                <Label className="font-medium">Applied Date</Label>
                                <p>{new Date(application.applyJob.submit_at).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <Label className="font-medium">Status</Label>
                                <Badge className={getStatusColor(application.applyJob.status)}>
                                    {application.applyJob.status.charAt(0).toUpperCase() + application.applyJob.status.slice(1)}
                                </Badge>
                            </div>
                        </div>

                        <div>
                            <Label className="font-medium">Summary</Label>
                            <p className="mt-2 text-sm text-muted-foreground">{application.cv.content.userData.summary}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="font-medium">CV Document</Label>
                                <div className="flex items-center space-x-2 mt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleViewCV(application.cv._id)}
                                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                    >
                                        <FileText className="h-4 w-4 mr-1" />
                                        View CV
                                    </Button>
                                    <span className="text-sm text-muted-foreground">{application.cv.title}</span>
                                </div>
                            </div>
                            <div>
                                <Label className="font-medium">Cover Letter</Label>
                                <div className="flex items-center space-x-2 mt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleViewCoverLetter(application.coverLetter._id)}
                                        className="text-green-600 border-green-600 hover:bg-green-50"
                                    >
                                        <User className="h-4 w-4 mr-1" />
                                        View CL
                                    </Button>
                                    <span className="text-sm text-muted-foreground">{application.coverLetter.title}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-4 border-t">
                            {getStatusActions(application.applyJob.status)}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
} 