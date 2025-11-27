"use client";

import React, { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { User } from '@/types/auth';
import '@/styles/userProfile.css';
import ProfileCard from './ProfileCard';
import SocialIcons from './SocialIcons';
import UserInfo from './UserInfo';
import JobInProfile from './JobInProfile';
import { fetchUserDataFromToken, updateUserProfile, changePassword, getUserIdFromToken, getUserById } from '@/api/userApi';
import { notify } from "@/lib/notify";
import type { ApplyJob, Job } from '@/api/jobApi';


const EditProfileModal = dynamic(() => import('./EditProfileModal'), {
    ssr: false,
});

const ChangePasswordModal = dynamic(() => import('./ChangePasswordModal'), {
    ssr: false,
});

interface UserProfileProps {
    initialUser?: User | null;
    initialJobs?: (Job | undefined)[];
    initialApplies?: ApplyJob[];
}

const UserProfile: React.FC<UserProfileProps> = ({ initialUser, initialJobs, initialApplies }) => {
    const [user, setUser] = useState<User | null>(initialUser ?? null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    // Nếu đã có user từ server thì không cần trạng thái loading ban đầu
    const [isLoading, setIsLoading] = useState(!initialUser);
    const [error, setError] = useState<string | null>(null);

    // Fetch user trên client chỉ khi không có sẵn từ server để tránh request thừa
    useEffect(() => {
        if (initialUser) {
            // Đảm bảo tắt loading nếu đã có user từ server
            setIsLoading(false);
            return;
        }

        const fetchUserData = async () => {
            try {
                setIsLoading(true);
                const userId = getUserIdFromToken();
                if (!userId) throw new Error("No user ID found in token");
                const userData = await getUserById(userId);
                setUser(userData);
                setError(null);
            } catch (err) {
                console.error("Error fetching user data:", err);
                setError("Failed to load user data. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        void fetchUserData();
    }, [initialUser]);

    const handleSaveProfile = useCallback(
        async (updatedUser: User) => {
            try {
                if (!user?._id) {
                    throw new Error("No user ID found");
                }
                const updatedUserData = await updateUserProfile(user._id, updatedUser);
                setUser(updatedUserData);
                setIsEditModalOpen(false);
                setError(null);
            } catch (err) {
                console.error("Error updating profile:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to update profile. Please try again later."
                );
            }
        },
        [user]
    );

    const handleChangePassword = useCallback(
        async (currentPassword: string, newPassword: string) => {
            try {
                await changePassword(currentPassword, newPassword);
                setIsChangePasswordModalOpen(false);
                setError(null);
                alert("Password changed successfully!");
            } catch (err) {
                console.error("Error changing password:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to change password. Please try again later."
                );
            }
        },
        []
    );

    if (isLoading && !user) {
        return (
            <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex justify-center items-center">
                <div className="text-gray-500">User not found</div>
            </div>
        );
    }

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
                            <UserInfo
                                user={user}
                                onEdit={() => setIsEditModalOpen(true)}
                                onChangePassword={() => setIsChangePasswordModalOpen(true)}
                            />
                            <JobInProfile initialJobs={initialJobs} initialApplies={initialApplies} />
                        </div>
                    </div>
                </div>
            </div>

            {isEditModalOpen && (
                <EditProfileModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    user={user}
                    onSave={handleSaveProfile}
                />
            )}

            {isChangePasswordModalOpen && (
                <ChangePasswordModal
                    isOpen={isChangePasswordModalOpen}
                    onClose={() => setIsChangePasswordModalOpen(false)}
                    onSave={handleChangePassword}
                />
            )}
        </div>
    );
};

export default UserProfile;