import { fetchWithAuth } from "./apiClient";
import { API_ENDPOINTS } from './apiConfig';

// This interface is a placeholder based on frontend components.
// It should be verified against the actual backend DTO/schema.
export interface Voucher {
    _id: string;
    name: string;
    description: string;
    type: string;
    discountValue: number;
    discountType: string;
    maxDiscountValue?: number;
    minOrderValue?: number;
    usageLimit: number;
    perUserLimit: number;
    startDate: string;
    endDate: string;
    status?: "active" | "expired" | "used"; // Assuming status is handled by frontend based on dates
}

/**
 * Get all vouchers from the system
 * @returns Promise with array of voucher data
 */
export const getAllVouchers = async (): Promise<Voucher[]> => {
    const response = await fetchWithAuth(API_ENDPOINTS.VOUCHER.GET_FOR_MKT);
    return response as Voucher[];
};

/**
 * Create a new voucher
 * @param voucherData - The data for the new voucher
 * @returns Promise with the created voucher data
 */
export const createVoucher = async (voucherData: Omit<Voucher, '_id' | 'status'>): Promise<Voucher> => {
    const response = await fetchWithAuth(API_ENDPOINTS.VOUCHER.POST_VOUCHER_DIRECT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(voucherData),
    });
    return response as Voucher;
};

/**
 * Update an existing voucher
 * @param id - The ID of the voucher to update
 * @param voucherData - The updated voucher data
 * @returns Promise with the updated voucher data
 */
export const updateVoucher = async (id: string, voucherData: Partial<Omit<Voucher, '_id'>>): Promise<Voucher> => {
    const response = await fetchWithAuth(API_ENDPOINTS.VOUCHER.UPDATE(id), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(voucherData),
    });
    return response as Voucher;
};

/**
 * Delete a voucher
 * @param id - The ID of the voucher to delete
 * @returns Promise indicating success or failure
 */
export const deleteVoucher = async (id: string): Promise<void> => {
    await fetchWithAuth(API_ENDPOINTS.VOUCHER.DELETE(id), {
        method: 'DELETE',
    });
};
