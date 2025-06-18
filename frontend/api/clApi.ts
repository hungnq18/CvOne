import { fetchWithAuth } from "./apiClient";
import { API_ENDPOINTS } from "./apiConfig";
//json-server --watch api/db.json --port 3001

export type CLTemplate = {
    id: string;
    templateName: string;
    imageUrl: string;
    title: string;
    isRecommended?: boolean;
    data?: any;
};

export interface CL {
    id: string;
    clTemplateId: string;
    userId: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Get all Cover Letters
 * @returns Promise with array of CLs
 */
export const getCLs = async (): Promise<CL[]> => {
    return fetchWithAuth(API_ENDPOINTS.CL.GET_ALL);
};

/**
 * Get all Cover Letter templates
 * @returns Promise with array of CL templates
 */
export const getCLTemplates = async (): Promise<CLTemplate[]> => {
    return fetchWithAuth(API_ENDPOINTS.CL.TEMPLATES);
};

/**
 * Get Cover Letter template by ID
 * @param id - The template ID to fetch
 * @returns Promise with CL template data
 */
export const getCLTemplateById = async (id: string): Promise<CLTemplate | undefined> => {
    return fetchWithAuth(API_ENDPOINTS.CL.GET_BY_ID(id));
};