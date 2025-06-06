"use client";

import React from 'react';
import { Progress } from 'antd';
import { FaUserEdit } from 'react-icons/fa';
import styles from '@/app/userDashboard/page.module.css';
import useAnimatedButtons from '@/app/userDashboard/page.modunle';
import { useLanguage } from '@/providers/global-provider';

const translations = {
    vi: {
        title: "Tiến độ hoàn thiện hồ sơ",
        completed: "hoàn thành",
        update: "Cập nhật",
        create: "Tạo CV",
    },
    en: {
        title: "Profile Completion Progress",
        completed: "completed",
        update: "Update",
        create: "Create CV",
    }
};

interface ProfileProgressProps {
    progress: number;
    cvImage?: string;
}

const ProfileProgress: React.FC<ProfileProgressProps> = ({ progress, cvImage }) => {
    useAnimatedButtons();
    const { language } = useLanguage();

    const t = translations[language];

    return (
        <div>
            <div className="bg-gradient-to-r from-blue-100 to-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300">
                <div className="flex items-center mb-4">
                    <FaUserEdit className="text-blue-600 text-lg mr-2" />
                    <h2 className="text-xl font-semibold text-blue-600">{t.title}</h2>
                </div>

                <Progress percent={progress} strokeColor="#10B981" />
                <p className="text-gray-700 text-sm mt-2">{progress}% {t.completed}</p>

                {cvImage && (
                    <div className="mt-4">
                        <img
                            src={cvImage}
                            alt="CV preview"
                            className="w-full max-w-md mx-auto rounded-lg shadow-sm border"
                        />
                    </div>
                )}
                <div className="flex justify-end space-x-4 mt-4">
                    <button className={`${styles["animated-button"]} flex-1`}>
                        <span className="block text-center text-sm leading-tight">{t.update}</span>
                    </button>
                    <button className={`${styles["animated-button"]} flex-1`}>
                        <span className="block text-center text-sm leading-tight">{t.create}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileProgress;