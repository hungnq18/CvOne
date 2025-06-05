import React from 'react';
import { Progress } from 'antd';
import { FaUserEdit } from 'react-icons/fa';

interface ProfileProgressProps {
    progress: number;
    cvImage?: string;
}

const ProfileProgress: React.FC<ProfileProgressProps> = ({ progress, cvImage }) => {
    return (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center mb-4">
                <FaUserEdit className="text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-blue-600">Tiến độ hoàn thiện hồ sơ</h2>
            </div>
            <Progress percent={progress} strokeColor="#10B981" />
            <p className="text-gray-900 text-sm mt-2">{progress}% hoàn thành</p>
            {cvImage && (
                <div className="mt-4">
                    <img src={cvImage} alt="CV preview" className="w-full h-auto rounded-lg shadow-sm" />
                </div>
            )}
        </div>
    );
};

export default ProfileProgress;