/**
 * Credit API Module
 * author: HungNQ
 *
 * This module provides functions for managing user credits and saved vouchers:
 * - Get user credit balance
 * - Update token balance
 * - Save voucher to user account
 */

import { fetchWithAuth } from "./apiClient"
import { API_ENDPOINTS } from "./apiConfig"

/**
 * Credit Interface
 */
export interface CreditVoucher {
    voucherId: string
    startDate: string
    endDate: string
}

export interface Credit {
    _id?: string
    userId: string
    token: number
    vouchers: CreditVoucher[]
    createdAt?: string
    updatedAt?: string
}

/**
 * Get user credit information
 * @returns Promise<Credit>
 */
export async function getCredit(): Promise<Credit> {
    return fetchWithAuth(API_ENDPOINTS.CREDIT.GET_CREDIT)
}

/**
 * Update user's token balance
 * @param data - Object containing {token}
 * @returns Promise<Credit>
 */
export async function updateToken(data: { token: number }): Promise<Credit> {
    return fetchWithAuth(API_ENDPOINTS.CREDIT.UPDATE_TOKEN, {
        method: "PATCH",
        body: JSON.stringify(data),
    })
}

/**
 * Save voucher to user's account
 * @param voucherId - The voucher ID to save
 * @returns Promise<Credit>
 */
export async function saveVoucher(voucherId: string): Promise<Credit> {
    return fetchWithAuth(API_ENDPOINTS.CREDIT.UPDATE_VOUCHER(voucherId), {
        method: "PATCH",
    })
}
