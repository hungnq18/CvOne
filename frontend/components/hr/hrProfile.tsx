import React, { useEffect, useState } from 'react';
import { Job, getJobs } from '@/api/jobApi';
import JobList from '@/components/ui/jobList';
import ProfileCard from '../user/ProfileCard';
import SocialIcons from '../user/SocialIcons';
import UserInfo from '../user/UserInfo';

interface HRJobsProfileProps {
    user: any;
}

const HRJobsProfile: React.FC<HRJobsProfileProps> = ({ user }) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getJobs().then(allJobs => {
            setJobs(allJobs.filter(job => job.user_id === user._id));
        }).finally(() => setLoading(false));
    }, [user]);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="profile-wrapper">
            <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="main-body">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* Left Column */}
                        <div className="md:col-span-4">
                            <ProfileCard user={user} />
                            <SocialIcons />
                        </div>
                        {/* Right Column */}
                        <div className="md:col-span-8">
                            <UserInfo user={user} onEdit={() => { }} onChangePassword={() => { }} />
                            <h2 className="text-lg font-semibold mb-4 mt-8">Jobs Posted by You</h2>
                            <JobList jobs={jobs} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HRJobsProfile; 