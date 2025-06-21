'use client';

import React, { useState } from 'react';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (currentPassword: string, newPassword: string) => Promise<void>;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, onSave }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const validatePassword = (password: string): boolean => {
        // Password must be at least 8 characters long
        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return false;
        }

        // Password must contain at least one uppercase letter
        if (!/[A-Z]/.test(password)) {
            setError('Password must contain at least one uppercase letter');
            return false;
        }

        // Password must contain at least one lowercase letter
        if (!/[a-z]/.test(password)) {
            setError('Password must contain at least one lowercase letter');
            return false;
        }

        // Password must contain at least one number
        if (!/\d/.test(password)) {
            setError('Password must contain at least one number');
            return false;
        }

        // Password must contain at least one special character
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            setError('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
            return false;
        }

        setError('');
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate current password
        if (!currentPassword) {
            setError('Please enter your current password');
            return;
        }

        // Validate new password
        if (!validatePassword(newPassword)) {
            return;
        }

        // Check if passwords match
        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            await onSave(currentPassword, newPassword);
            onClose();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to change password');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl transform transition-all">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                        />
                        <p className="text-sm text-gray-500">
                            Password must be at least 8 characters long and contain uppercase, lowercase, number and special character
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-red-500">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="relative px-6 py-2.5 overflow-hidden group bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white transition-all ease-out duration-300 rounded-lg text-sm font-medium"
                            disabled={isLoading}
                        >
                            <span className="absolute right-0 w-8 h-full top-0 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 -skew-x-12 group-hover:-translate-x-36 ease"></span>
                            <span className="relative">
                                {isLoading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Changing...
                                    </span>
                                ) : (
                                    'Change Password'
                                )}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal; 