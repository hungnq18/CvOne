import { fetchWithAuth } from "./apiClient";
import { API_ENDPOINTS } from "./apiConfig";

export interface AccountId {
    _id: string;
    email: string;
    role: string;
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
}

export interface HrUser {
    _id: string;
    account_id: AccountId;   // ❗ sửa từ string → object

    first_name: string;
    last_name: string;
    phone?: string;

    city?: string;
    country?: string;

    company_name?: string;
    company_country?: string;
    company_city?: string;
    company_district?: string;
    vatRegistrationNumber?: string;

    createdAt?: string;
    updatedAt?: string;
}


/**
 * Lấy danh sách HR chưa active
 */
export const getUnactiveHrUsers = async (): Promise<HrUser[]> => {
    const response = await fetchWithAuth(API_ENDPOINTS.USER.GET_HR_UNACTIVE);
    return response as HrUser[];
};

/**
 * Active/Unactive HR (Admin dùng để duyệt HR)
 * @param id account_id của HR
 * @param data { isActive: boolean }
 */
export const updateHrActiveStatus = async (
    id: string,
    data: { isActive: boolean }
): Promise<any> => {
    const response = await fetchWithAuth(
        API_ENDPOINTS.ACCOUNTS.UPDATE_ACTIVE_HR(id),
        {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        }
    );

    return response;
};
