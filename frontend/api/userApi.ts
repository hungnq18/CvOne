/**
 * User API Module
 * author: HungNQ
 * 
 * This module provides functions for managing user data:
 * - Getting all users
 * - Getting user by ID
 * - Updating user information
 * - Deleting user
 * 
 * All functions use fetchWithAuth to ensure authenticated requests
 * and proper authorization for admin operations
 */

import type { User } from "@/types/auth"
import { fetchWithAuth } from "./apiClient"
import { API_ENDPOINTS } from "./apiConfig"





/**
 * Get all users in the system
 * @returns Promise with array of user data
 */
export async function getAllUsers() {
  return fetchWithAuth(API_ENDPOINTS.USER.GET_ALL)
}

/**
 * Get user information by ID
 * @param id - The user ID to fetch
 * @returns Promise with user data
 */
export async function getUserById(id: string) {
  return fetchWithAuth(API_ENDPOINTS.USER.GET_BY_ID(id))
}

/**
 * Update user information
 * @param id - The user ID to update
 * @param data - Partial user data to update
 * @returns Promise with updated user data
 */
export async function updateUser(id: string, data: Partial<User>) {
  return fetchWithAuth(API_ENDPOINTS.USER.UPDATE(id), {
    method: "PATCH",
    body: JSON.stringify(data)
  })
}

/**
 * Delete a user from the system
 * @param id - The user ID to delete
 * @returns Promise with deletion result
 */
export async function deleteUser(id: string) {
  return fetchWithAuth(API_ENDPOINTS.USER.DELETE(id), {
    method: "DELETE"
  })
} 