import { fetchWithAuth } from "./apiClient";
import { API_ENDPOINTS } from './apiConfig';

export interface Ad {
  _id: string;
  title: string;
  redirectUrl?: string;
  imageUrl?: string;
  position?: string;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
}

/**
 * Get all ads (banners) from the system
 * @returns Promise with array of ad data
 */
export const getAllAds = async (): Promise<Ad[]> => {
    const response = await fetchWithAuth(API_ENDPOINTS.BANNER.GET_ALL);
    return response as Ad[];
};

/**
 * Create a new ad (banner)
 * @param adData - The data for the new ad
 * @returns Promise with the created ad data
 */
export const createAd = async (adData: Omit<Ad, '_id' | 'isActive' | 'startDate' | 'endDate'> & { startDate: string; endDate: string; }): Promise<Ad> => {
    const response = await fetchWithAuth(API_ENDPOINTS.BANNER.CREATE, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(adData),
    });
    return response as Ad;
};

/**
 * Update an existing ad (banner)
 * @param id - The id of the ad to update
 * @param adData - The fields to update
 * @returns Promise with the updated ad data
 */
export const updateAd = async (
  id: string,
  adData: Partial<Omit<Ad, '_id' | 'isActive' | 'startDate' | 'endDate'>> & {
    startDate?: string;
    endDate?: string;
  },
): Promise<Ad> => {
  const response = await fetchWithAuth(API_ENDPOINTS.BANNER.UPDATE(id), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(adData),
  });
  return response as Ad;
};

/**
 * Delete an existing ad (banner)
 * @param id - The id of the ad to delete
 */
export const deleteAd = async (id: string): Promise<void> => {
  await fetchWithAuth(API_ENDPOINTS.BANNER.DELETE(id), {
    method: "DELETE",
  });
};
