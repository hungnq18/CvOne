"use client";

import React, { useEffect, useState } from 'react';
import { User } from '@/types/auth';
import '@/styles/userProfile.css';
import EditProfileModal from './EditProfileModal';
import ChangePasswordModal from './ChangePasswordModal';
import ProfileCard from './ProfileCard';
import SocialIcons from './SocialIcons';
import UserInfo from './UserInfo';
import JobApplications from './JobApplications';
import { fetchUserDataFromToken, updateUserProfile, changePassword } from '@/api/userApi';

const UserProfile: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUserData = async () => {
        try {
            setIsLoading(true);
            const userData = await fetchUserDataFromToken();
            setUser(userData);
            setError(null);
        } catch (err) {
            console.error("Error fetching user data:", err);
            setError("Failed to load user data. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveProfile = async (updatedUser: User) => {
        try {
            if (!user?._id) {
                throw new Error("No user ID found");
            }
            setIsLoading(true);
            const updatedUserData = await updateUserProfile(user._id, updatedUser);
            setUser(updatedUserData);
            setIsEditModalOpen(false);
            setError(null);
        } catch (err) {
            console.error("Error updating profile:", err);
            setError(err instanceof Error ? err.message : "Failed to update profile. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async (currentPassword: string, newPassword: string) => {
        try {
            setIsLoading(true);
            await changePassword(currentPassword, newPassword);
            setIsChangePasswordModalOpen(false);
            setError(null);
            alert("Password changed successfully!");
        } catch (err) {
            console.error("Error changing password:", err);
            setError(err instanceof Error ? err.message : "Failed to change password. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    if (isLoading) {
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
                            <JobApplications />
                        </div>
                    </div>
                </div>
            </div>

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={user}
                onSave={handleSaveProfile}
            />

            <ChangePasswordModal
                isOpen={isChangePasswordModalOpen}
                onClose={() => setIsChangePasswordModalOpen(false)}
                onSave={handleChangePassword}
            />
        </div>
    );
};

export default UserProfile; 