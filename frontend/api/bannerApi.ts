import { fetchWithAuth, fetchWithoutAuth } from "./apiClient";
import { API_ENDPOINTS } from "./apiConfig";

export interface Banner {
  _id: string;
  title: string;
  redirectUrl?: string;
  imageUrl?: string;
  position?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  isActive?: boolean;
}

/**
 * Get all banners from the system
 * @returns Promise with array of banner data
 */
export const getAllBanners = async (): Promise<Banner[]> => {
  const response = await fetchWithAuth(API_ENDPOINTS.BANNER.GET_ALL);
  return response as Banner[];
};

/**
 * Get active banners for end users (public API - no authentication required)
 * @returns Promise with array of active banner data
 */
export const getBannersForUser = async (): Promise<Banner[]> => {
  const response = await fetchWithAuth(API_ENDPOINTS.BANNER.FOR_USER);
  return response as Banner[];
};

/**
 * Create a new banner
 * @param bannerData - The data for the new banner
 * @returns Promise with the created banner data
 */
export const createBanner = async (
  bannerData: Omit<Banner, "_id" | "isActive" | "startDate" | "endDate"> & {
    startDate: string;
    endDate: string;
  },
): Promise<Banner> => {
  const response = await fetchWithAuth(API_ENDPOINTS.BANNER.CREATE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bannerData),
  });
  return response as Banner;
};

/**
 * Update an existing banner
 * @param id - The id of the banner to update
 * @param bannerData - The fields to update
 * @returns Promise with the updated banner data
 */
export const updateBanner = async (
  id: string,
  bannerData: Partial<Omit<Banner, "_id" | "isActive" | "startDate" | "endDate">> & {
    startDate?: string;
    endDate?: string;
  },
): Promise<Banner> => {
  const response = await fetchWithAuth(API_ENDPOINTS.BANNER.UPDATE(id), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bannerData),
  });
  return response as Banner;
};

/**
 * Delete an existing banner
 * @param id - The id of the banner to delete
 */
export const deleteBanner = async (id: string): Promise<void> => {
  await fetchWithAuth(API_ENDPOINTS.BANNER.DELETE(id), {
    method: "DELETE",
  });
};
