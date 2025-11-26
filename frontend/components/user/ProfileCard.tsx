import React from 'react';
import { User } from '@/types/auth';

interface ProfileCardProps {
    user: User;
}

const ProfileCardComponent: React.FC<ProfileCardProps> = ({ user }) => {
    return (
        <div className="card bg-white/80 backdrop-blur-sm border border-blue-100 shadow-lg mt-5">
            <div className="card-body">
                <div className="flex flex-col items-center text-center">
                    <div className="w-32 h-32 mb-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                        <span className="text-4xl text-white font-semibold">
                            {user.first_name[0]}{user.last_name[0]}
                        </span>
                    </div>
                    <div className="mt-3">
                        <h4 className="text-xl font-semibold text-gray-900">{`${user.first_name} ${user.last_name}`}</h4>
                        <p className="text-gray-700 mb-1">Full Stack Developer</p>
                        <p className="text-gray-600 text-sm">{user.city}, {user.country}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Memo để tránh re-render khi parent re-render mà props không đổi
const ProfileCard = React.memo(ProfileCardComponent);

export default ProfileCard; 