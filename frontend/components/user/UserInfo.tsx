import React from 'react';
import { useLanguage } from '@/providers/global_provider';
import { User } from '@/types/auth';

interface UserInfoProps {
    user: User;
    onEdit: () => void;
    onChangePassword: () => void;
}

const UserInfoComponent: React.FC<UserInfoProps> = ({ user, onEdit, onChangePassword }) => {
    const { language } = useLanguage();

    // Text tùy theo ngôn ngữ
    const texts = {
        fullName: language === 'vi' ? 'Họ và tên' : 'Full Name',
        phone: language === 'vi' ? 'Số điện thoại' : 'Phone',
        address: language === 'vi' ? 'Địa chỉ' : 'Address',
        notProvided: language === 'vi' ? 'Chưa cung cấp' : 'Not provided',
        editProfile: language === 'vi' ? 'Chỉnh sửa hồ sơ' : 'Edit Profile',
        changePassword: language === 'vi' ? 'Đổi mật khẩu' : 'Change Password',
    };

    return (
        <div className="card mb-6 bg-white/80 backdrop-blur-sm border border-blue-100 shadow-lg mt-5">
            <div className="card-body">
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="font-medium text-gray-900">{texts.fullName}</div>
                        <div className="col-span-2 text-gray-700">{`${user.first_name} ${user.last_name}`}</div>
                    </div>
                    <hr className="my-4 border-gray-200" />
                    <div className="grid grid-cols-3 gap-4">
                        <div className="font-medium text-gray-900">{texts.phone}</div>
                        <div className="col-span-2 text-gray-700">{user.phone || texts.notProvided}</div>
                    </div>
                    <hr className="my-4 border-gray-200" />
                    <div className="grid grid-cols-3 gap-4">
                        <div className="font-medium text-gray-900">{texts.address}</div>
                        <div className="col-span-2 text-gray-700">
                            {user.city && user.country ? `${user.city}, ${user.country}` : texts.notProvided}
                        </div>
                    </div>
                    <hr className="my-4 border-gray-200" />
                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={onEdit}
                            className="relative px-6 py-2 overflow-hidden group bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white transition-all ease-out duration-300 rounded-lg text-sm"
                        >
                            <span className="absolute right-0 w-8 h-full top-0 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 -skew-x-12 group-hover:-translate-x-36 ease"></span>
                            <span className="relative font-semibold">{texts.editProfile}</span>
                        </button>
                        <button
                            onClick={onChangePassword}
                            className="relative px-6 py-2 overflow-hidden group bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white transition-all ease-out duration-300 rounded-lg text-sm"
                        >
                            <span className="absolute right-0 w-8 h-full top-0 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 -skew-x-12 group-hover:-translate-x-36 ease"></span>
                            <span className="relative font-semibold">{texts.changePassword}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const UserInfo = React.memo(UserInfoComponent);

export default UserInfo;
