import { fetchWithAuth } from "./apiClient";
import { API_ENDPOINTS } from "./apiConfig";
//json-server --watch api/db.json --port 3001

export type CLTemplate = {
    _id: string;
    imageUrl: string;
    title: string;
    isRecommended?: boolean;
    data?: any;
};

export interface CL {
    _id?: string;
    templateId: string | CLTemplate;
    title: string;
    data: any;
    isSaved?: boolean;
    createdAt: string;
    updatedAt: string;
}

export type CreateCLDto = {
    templateId: string;
    title: string;
    data: any;
    isSaved: boolean;
};

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
    return fetchWithAuth(API_ENDPOINTS.CL.TEMPLATE_BY_ID(id));
};

/**
 * Create a new Cover Letter
 * @param cl - The CL data to create
 * @returns Promise with created CL data
 */
export const createCL = async (cl: CreateCLDto): Promise<CL> => {
    return fetchWithAuth(API_ENDPOINTS.CL.CREATE, {
        method: "POST",
        body: JSON.stringify(cl),
    });
};

/**
 * Update a Cover Letter
 * @param id - The ID of the CL to update
 * @param cl - The updated CL data
 * @returns Promise with updated CL data
 */
export const updateCL = async (id: string, cl: Partial<CL>): Promise<CL> => {
    return fetchWithAuth(API_ENDPOINTS.CL.UPDATE(id), {
        method: "PATCH",
        body: JSON.stringify(cl),
    });
};

/**
 * Delete a Cover Letter
 * @param id - The ID of the CL to delete
 * @returns Promise with deleted CL data
 */
export const deleteCL = async (id: string): Promise<void> => {
    return fetchWithAuth(API_ENDPOINTS.CL.DELETE(id), {
        method: "DELETE",
    });
};

/**
 * Get a Cover Letter by ID
 * @param id - The ID of the CL to fetch
 * @returns Promise with CL data
 */
export const getCLById = async (id: string): Promise<CL> => {
    return fetchWithAuth(API_ENDPOINTS.CL.GET_BY_ID(id));
};