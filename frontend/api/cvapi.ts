/**
 * CV API Module
 * author: HungNQ
 *
 * This module provides functions for managing CV data:
 * - Getting CV templates
 * - Getting CV by ID
 * - Creating new CV
 * - Updating CV
 * - Deleting CV
 * - Sharing CV
 */

import { fetchWithAuth, fetchWithoutAuth } from "./apiClient";
import { API_ENDPOINTS } from "./apiConfig";

export type CVTemplate = {
  id: string;
  imageUrl: string;
  title: string;
  isRecommended?: boolean;
  data?: any;
};


export interface CV {
  id: string; 
  userId: string;
  title?: string;
  content: {
    userData: any;
  };
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  templateId: string; 
  isSaved: boolean;
  isFinalized: boolean;
}

/**
 * Get all CV templates
 * @returns Promise with array of CV templates
 */
export const getCVTemplates = async (): Promise<CVTemplate[]> => {
  return fetchWithoutAuth(API_ENDPOINTS.CV.TEMPLATES);
};

/**
 * Get CV template by ID
 * @param id - The template ID to fetch
 * @returns Promise with CV template data
 */
export const getCVTemplateById = async (id: string): Promise<CVTemplate | undefined> => {
  return fetchWithoutAuth(`${API_ENDPOINTS.CV.TEMPLATES}/${id}`);
};

/**
 * Get all CVs
 * @returns Promise with array of CVs
 */
export async function getAllCVs() {
  return fetchWithAuth(API_ENDPOINTS.CV.GET_ALL);
}

/**
 * Get CV by ID
 * @param id - The CV ID to fetch
 * @returns Promise with CV data
 */
export async function getCVById(id: string) {
  return fetchWithAuth(API_ENDPOINTS.CV.GET_BY_ID(id));
}

/**
 * Create new CV
 * @param data - CV data to create
 * @returns Promise with created CV
 */
export async function createCV(data: Omit<CV, "id">) {
  return fetchWithAuth(API_ENDPOINTS.CV.CREATE, {
    method: "POST",
    body: JSON.stringify(data)  
  });
}

/**
 * Update CV
 * @param id - The CV ID to update
 * @param data - CV data to update
 * @returns Promise with updated CV
 */
export async function updateCV(id: string, data: Partial<CV>) {
  return fetchWithAuth(API_ENDPOINTS.CV.UPDATE(id), {
    method: "PATCH",
    body: JSON.stringify(data)
  });
}

/**
 * Delete CV
 * @param id - The CV ID to delete
 * @returns Promise with deletion result
 */
export async function deleteCV(id: string) {
  return fetchWithAuth(API_ENDPOINTS.CV.DELETE(id), {
    method: "DELETE"
  });
}

/**
 * Share CV
 * @param id - The CV ID to share
 * @returns Promise with sharing result
 */
export async function shareCV(id: string) {
  return fetchWithAuth(API_ENDPOINTS.CV.SHARE(id), {
    method: "POST"
  });
}