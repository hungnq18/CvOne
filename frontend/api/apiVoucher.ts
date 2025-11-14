
import { fetchWithAuth } from "./apiClient"
import { API_ENDPOINTS } from "./apiConfig"


/**
 * Voucher Interface
 */
export interface Voucher {
    _id?: string
    name: string
    description: string
    type: "direct" | "saveable"
    discountValue: number
    discountType: "percent" | "amount"
    maxDiscountValue?: number
    minOrderValue?: number
    usageLimit?: number
    usedCount?: number
    perUserLimit?: number
    durationDays?: number
    startDate: string
    endDate: string
    isActive?: boolean
    createdAt?: string
    updatedAt?: string
}


/**
 * Get all vouchers available for the user
 * @returns Promise with user vouchers
 */
export async function getVouchersForUser() {
    return fetchWithAuth(API_ENDPOINTS.VOUCHER.GET_FOR_USER)
}

/**
 * Get all vouchers for marketing staff
 * @returns Promise with all vouchers (for MKT)
 */
export async function getVouchersForMarketing() {
    return fetchWithAuth(API_ENDPOINTS.VOUCHER.GET_FOR_MKT)
}

/**
 * Create a direct voucher
 * @param data - Voucher creation payload
 * @returns Promise with created voucher
 */
export async function createDirectVoucher(data: Voucher) {
    return fetchWithAuth(API_ENDPOINTS.VOUCHER.POST_VOUCHER_DIRECT, {
        method: "POST",
        body: JSON.stringify(data),
    })
}

/**
 * Create a saveable voucher
 * @param data - Voucher creation payload
 * @returns Promise with created voucher
 */
export async function createSaveableVoucher(data: Voucher) {
    return fetchWithAuth(API_ENDPOINTS.VOUCHER.POST_VOUCHER_SAVEABLE, {
        method: "POST",
        body: JSON.stringify(data),
    })
}

/**
 * Get voucher by ID
 * @param id - Voucher ID
 * @returns Promise with voucher details
 */
export async function getVoucherById(id: string) {
    return fetchWithAuth(API_ENDPOINTS.VOUCHER.GET_BY_ID(id))
}