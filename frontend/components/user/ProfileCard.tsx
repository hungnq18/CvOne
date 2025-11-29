import React from 'react';
import { User } from '@/types/auth';
import { useLanguage } from '@/providers/global_provider';

interface ProfileCardProps {
    user: User;
}

const ProfileCardComponent: React.FC<ProfileCardProps> = ({ user }) => {
    const { language } = useLanguage(); // lấy ngôn ngữ hiện tại ("vi" | "en")

    // Text tùy theo ngôn ngữ
    const locationText = `${user.city}, ${user.country}`; // có thể giữ nguyên hoặc chuyển ngôn ngữ city nếu cần

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
                        <p className="text-gray-600 text-sm">{locationText}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProfileCard = React.memo(ProfileCardComponent);

export default ProfileCard;
