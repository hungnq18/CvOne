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
    data: {
        firstName: string;
        lastName: string;
        profession: string;
        city: string;
        state: string;
        phone: string;
        email: string;
        date: string;
        recipientFirstName: string;
        recipientLastName: string;
        companyName: string;
        recipientCity: string;
        recipientState: string;
        recipientPhone: string;
        recipientEmail: string;
        subject: string;
        greeting: string;
        opening: string;
        body: string;
        callToAction: string;
        closing: string;
        signature: string;
    };
}

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