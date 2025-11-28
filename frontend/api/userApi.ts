/**
 * User API Module (Optimized Version)
 * author: HungNQ - Optimized by ChatGPT
 */

import { User } from "@/types/auth";
import { fetchWithAuth } from "./apiClient";
import { API_ENDPOINTS } from "./apiConfig";
import { jwtDecode } from "jwt-decode";

let decodedCache: { token: string; payload: any } | null = null;

/** Lấy token từ cookie */
const getToken = (): string | null => {
    const cookie = typeof document === "undefined" ? "" : document.cookie;
    if (!cookie) return null;
    const match = cookie.split("; ").find((row) => row.startsWith("token="));
    if (!match) return null;
    const token = match.split("=").slice(1).join("=");
    return token || null;
};

/** Decode token nhưng có cache để tránh lag */
const decodeToken = (): any | null => {
    const token = getToken();
    if (!token) return null;

    // Use simple caching keyed by token so it updates when token changes
    if (decodedCache && decodedCache.token === token) return decodedCache.payload;

    try {
        const payload = jwtDecode<any>(token);
        decodedCache = { token, payload };
        return payload;
    } catch (e) {
        console.warn("Failed to decode token", e);
        return null;
    }
};

/** Lấy userId từ token */
export const getUserIdFromToken = (): string | null => {
    const decoded = decodeToken();
    if (!decoded) return null;

    return (
        decoded.user ||
        decoded.id ||
        decoded.hr ||
        decoded.sub ||
        decoded._id ||
        null
    );
};

/** Lấy accountId từ token */
export const getAccountIdFromToken = (): string | null => {
    const decoded = decodeToken();
    if (!decoded) return null;

    // some JWTs store account id under different keys
    return (
        decoded.account ||
        decoded.accountId ||
        decoded.user ||
        decoded.id ||
        decoded._id ||
        decoded.sub ||
        null
    );
};

/**
 * Fetch user theo token — Tối ưu hóa để tránh lag
 */
export const fetchUserDataFromToken = async (): Promise<User> => {
    const accountId = getAccountIdFromToken();
    if (!accountId) throw new Error("No account ID found in token");

    // If backend supports GET by account id (custom endpoint), use it
    // Note: API_ENDPOINTS.USER.GET_BY_ACCOUNT may not be defined in apiConfig
    // so we check it safely.
    // @ts-ignore
    if (API_ENDPOINTS.USER.GET_BY_ACCOUNT) {
        // @ts-ignore
        return await fetchWithAuth(API_ENDPOINTS.USER.GET_BY_ACCOUNT(accountId));
    }

    // If backend exposes authenticated profile endpoint, prefer that
    if (API_ENDPOINTS.USER.GET_PROFILE) {
        return await fetchWithAuth(API_ENDPOINTS.USER.GET_PROFILE);
    }

    // Last fallback: GET all users and attempt to match account_id robustly
    const allUsers = await fetchWithAuth(API_ENDPOINTS.USER.GET_ALL);
    const list = Array.isArray(allUsers) ? allUsers : (allUsers as any[]);

    const user = list.find((u) => {
        // account_id might be a string or an object {_id: string}
        const aid = typeof u.account_id === "string"
            ? u.account_id
            : u.account_id && typeof u.account_id === "object"
            ? u.account_id._id || u.account_id.toString()
            : undefined;
        return aid === accountId;
    });

    if (!user) throw new Error("User not found for this account");
    return user;
};

/** Lấy tất cả user */
export const getAllUsers = async (): Promise<any[]> => {
    return await fetchWithAuth(API_ENDPOINTS.USER.GET_ALL);
};

/** Get user by ID */
export const getUserById = async (id: string): Promise<User> => {
    return await fetchWithAuth(API_ENDPOINTS.USER.GET_BY_ID(id));
};

/** Delete a user */
export const deleteUser = async (id: string): Promise<any> => {
    return await fetchWithAuth(API_ENDPOINTS.USER.DELETE(id), {
        method: "DELETE",
    });
};

/** Get user profile */
export const getUserProfile = async (userId: string): Promise<User> => {
    return await fetchWithAuth(API_ENDPOINTS.USER.GET_BY_ID(userId));
};

/** Update user profile */
export const updateUserProfile = async (userId: string, updatedUser: User): Promise<User> => {
    const updateData = {
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        phone: updatedUser.phone,
        city: updatedUser.city,
        country: updatedUser.country,
    };

    return await fetchWithAuth(API_ENDPOINTS.USER.UPDATE(userId), {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
    });
};

/** Change password */
export const changePassword = async (
    currentPassword: string,
    newPassword: string
): Promise<void> => {
    const userId = getUserIdFromToken();
    if (!userId) throw new Error("User ID not found in token");

    await fetchWithAuth(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userId,
            currentPassword,
            newPassword,
        }),
    });
};
