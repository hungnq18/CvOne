import React from 'react';
import Link from 'next/link';
import { User } from '@/types/auth';

interface UserInfoProps {
    user: User;
    onEdit: () => void;
    onChangePassword: () => void;
}

const UserInfoComponent: React.FC<UserInfoProps> = ({ user, onEdit, onChangePassword }) => {
    return (
        <div className="card mb-6 bg-white/80 backdrop-blur-sm border border-blue-100 shadow-lg mt-5">
            <div className="card-body">
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="font-medium text-gray-900">Full Name</div>
                        <div className="col-span-2 text-gray-700">{`${user.first_name} ${user.last_name}`}</div>
                    </div>
                    <hr className="my-4 border-gray-200" />
                    <div className="grid grid-cols-3 gap-4">
                        <div className="font-medium text-gray-900">Phone</div>
                        <div className="col-span-2 text-gray-700">{user.phone || 'Not provided'}</div>
                    </div>
                    <hr className="my-4 border-gray-200" />
                    <div className="grid grid-cols-3 gap-4">
                        <div className="font-medium text-gray-900">Address</div>
                        <div className="col-span-2 text-gray-700">
                            {user.city && user.country ? `${user.city}, ${user.country}` : 'Not provided'}
                        </div>
                    </div>
                    <hr className="my-4 border-gray-200" />
                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={onEdit}
                            className="relative px-6 py-2 overflow-hidden group bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white transition-all ease-out duration-300 rounded-lg text-sm"
                        >
                            <span className="absolute right-0 w-8 h-full top-0 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 -skew-x-12 group-hover:-translate-x-36 ease"></span>
                            <span className="relative font-semibold">Edit Profile</span>
                        </button>
                        <button
                            onClick={onChangePassword}
                            className="relative px-6 py-2 overflow-hidden group bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white transition-all ease-out duration-300 rounded-lg text-sm"
                        >
                            <span className="absolute right-0 w-8 h-full top-0 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 -skew-x-12 group-hover:-translate-x-36 ease"></span>
                            <span className="relative font-semibold">Change Password</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Chỉ re-render khi user hoặc callback props thay đổi
const UserInfo = React.memo(UserInfoComponent);

export default UserInfo; 