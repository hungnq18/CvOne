/**
 * User API Module
 * author: HungNQ
 *
 * This module provides functions for managing user data:
 * - Getting all users
 * - Getting user by ID
 * - Updating user information
 * - Deleting user
 * - Changing password
 *
 * All functions use fetchWithAuth to ensure authenticated requests
 * and proper authorization for admin operations
 */

import { User } from '@/types/auth';
import { fetchWithAuth } from "./apiClient";
import { API_ENDPOINTS } from './apiConfig';
import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "@/middleware";

/**
 * Get user ID from token in cookies
 * @returns The user ID from token or null if not found
 */
export const getUserIdFromToken = (): string | null => {
    const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
    if (!token) return null;
    try {
        const decoded: any = jwtDecode(token);
        // Ưu tiên trường user, nếu không có thì thử các trường khác
        return decoded.user || decoded.id || decoded.hr || decoded.sub || null;
    } catch {
        return null;
    }
};

/**
 * Lấy account_id từ token
 * @returns The account ID from token or null if not found
 */
export const getAccountIdFromToken = (): string | null => {
    const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
    if (!token) return null;
    try {
        const decoded: any = jwtDecode(token);
        return decoded.user || decoded.id || decoded._id || null; // tuỳ vào token của bạn
    } catch {
        return null;
    }
};

/**
 * Lấy toàn bộ user và tìm user theo account_id
 * @returns Promise with user data
 */
export const fetchUserDataFromToken = async (): Promise<any> => {
    const accountId = getAccountIdFromToken();
    console.log("Account ID from token:", accountId); // LOG 1
    if (!accountId) throw new Error("No account ID found in token");
    const allUsers = await fetchWithAuth("/api/users"); // GET all users
    console.log("All users from API:", allUsers); // LOG 2
    const user = (allUsers as any[]).find(u => u.account_id === accountId);
    console.log("User found by account_id:", user); // LOG 3
    if (!user) throw new Error("User not found for this account");
    return user;
};

/**
 * Get all users in the system
 * @returns Promise with array of user data
 */
export const getAllUsers = async (): Promise<any[]> => {
    const response = await fetchWithAuth(API_ENDPOINTS.USER.GET_ALL);
    return response as any[];
};

/**
 * Get user information by ID
 * @param id - The user ID to fetch
 * @returns Promise with user data
 */
export const getUserById = async (id: string): Promise<User> => {
    const response = await fetchWithAuth(API_ENDPOINTS.USER.GET_BY_ID(id));
    return response as User;
};

/**
 * Delete a user from the system
 * @param id - The user ID to delete
 * @returns Promise with deletion result
 */
export const deleteUser = async (id: string): Promise<any> => {
    return await fetchWithAuth(API_ENDPOINTS.USER.DELETE(id), {
        method: 'DELETE',
    });
};

/**
 * Get user profile information
 * @param userId - The user ID to fetch profile for
 * @returns Promise with user profile data
 */
export const getUserProfile = async (userId: string): Promise<User> => {
    const response = await fetchWithAuth(API_ENDPOINTS.USER.GET_BY_ID(userId));
    return response as User;
};

/**
 * Update user profile information
 * @param userId - The user ID to update profile for
 * @param updatedUser - The updated user data
 * @returns Promise with updated user profile data
 */
export const updateUserProfile = async (userId: string, updatedUser: User): Promise<User> => {
    try {
        // Chỉ gửi các trường được phép cập nhật theo backend
        const updateData = {
            first_name: updatedUser.first_name,
            last_name: updatedUser.last_name,
            phone: updatedUser.phone,
            city: updatedUser.city,
            country: updatedUser.country
        };

        const response = await fetchWithAuth(API_ENDPOINTS.USER.UPDATE(userId), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
        });
        return response as User;
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw new Error('Failed to update profile. Please try again.');
    }
};

/**
 * Change user password
 * @param currentPassword - The current password
 * @param newPassword - The new password
 * @returns Promise with success message
 */
export const changePassword = async (
    currentPassword: string,
    newPassword: string
): Promise<void> => {
    try {
        const userId = getUserIdFromToken();
        if (!userId) throw new Error("User ID not found in token");

        console.log('Sending change password request with:', {
            userId,
            currentPassword,
            newPassword
        });

        const response = await fetchWithAuth(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                currentPassword,
                newPassword,
            }),
        });

        console.log('Change password response:', response);
    } catch (error: any) {
        console.error('Error changing password:', error);
        console.error('Error details:', {
            message: error.message,
            response: error.response,
            data: error.data
        });
        throw new Error(error.message || 'Failed to change password. Please try again.');
    }
};