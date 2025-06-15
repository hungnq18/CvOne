/**
 * Profile API Module
 * author:HungNQ
 * 
 * This module provides functions for managing user profile data:
 * - Getting user profile information
 * - Updating user profile details
 * - Uploading user avatar
 * 
 * All functions use fetchWithAuth to ensure authenticated requests
 */

import type { User } from "@/types/auth"
import { fetchWithAuth } from "./apiClient"
import { API_ENDPOINTS } from "./apiConfig"

/**
 * Get user profile information
 * @returns Promise with user profile data
 */
export async function getProfile() {
  return fetchWithAuth(API_ENDPOINTS.PROFILE.GET)
}

/**
 * Update user profile information
 * @param data - Partial user data to update
 * @returns Promise with updated user profile
 */
export async function updateProfile(data: Partial<User>) {
  return fetchWithAuth(API_ENDPOINTS.PROFILE.UPDATE, {
    method: "PATCH",
    body: JSON.stringify(data)
  })
}

/**
 * Upload user avatar image
 * @param file - The avatar image file to upload
 * @returns Promise with upload result
 */
export async function uploadAvatar(file: File) {
  const formData = new FormData()
  formData.append("avatar", file)

  return fetchWithAuth(API_ENDPOINTS.PROFILE.UPLOAD_AVATAR, {
    method: "POST",
    body: formData
  })
} 