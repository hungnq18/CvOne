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

import { fetchWithAuth } from "./apiClient";
import { API_ENDPOINTS } from "./apiConfig";

export type CVTemplate = {
  _id: string;
  imageUrl: string;
  title: string;
  isRecommended?: boolean;
  data?: any;
};


export interface CV {
  _id: string; 
  userId: string;
  title?: string;
  content: {
    userData: any;
  };
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  cvTemplateId: string;
  isSaved: boolean;
  isFinalized: boolean;
}

/**
 * Get all CV templates
 * @returns Promise with array of CV templates
 */
export const getCVTemplates = async (): Promise<CVTemplate[]> => {
  // Đổi fetchWithoutAuth thành fetchWithAuth để luôn truyền token
  return fetchWithAuth(API_ENDPOINTS.CV.TEMPLATES);
};

/**
 * Get CV template by ID
 * @param id - The template ID to fetch
 * @returns Promise with CV template data
 */
export const getCVTemplateById = async (id: string): Promise<CVTemplate | undefined> => {
  // Đổi fetchWithoutAuth thành fetchWithAuth để luôn truyền token
  return fetchWithAuth(`${API_ENDPOINTS.CV.TEMPLATES}/${id}`);
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
export async function createCV(data: Omit<CV, "_id">) {
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

/**
 * Unshare CV
 * @param id - The CV ID to unshare
 * @returns Promise with unsharing result
 */
export async function unshareCV(id: string) {
  return fetchWithAuth(API_ENDPOINTS.CV.UNSHARE(id), {
    method: "POST"
  });
}

/**
 * Save CV
 * @param id - The CV ID to save
 * @returns Promise with saving result
 */
export async function saveCV(id: string) {
  return fetchWithAuth(API_ENDPOINTS.CV.SAVE(id), {
    method: "POST"
  });
}

/**
 * Unsave CV
 * @param id - The CV ID to unsave
 * @returns Promise with unsaving result
 */
export async function unsaveCV(id: string) {
  return fetchWithAuth(API_ENDPOINTS.CV.UNSAVE(id), {
    method: "POST"
  });
}

/**
 * Get all saved CVs
 * @returns Promise with array of saved CVs
 */
export async function getSavedCVs() {
  return fetchWithAuth(API_ENDPOINTS.CV.GET_SAVED);
}

/**
 * Analyze Job Description (JD) with AI
 * @param jobDescription - The job description text
 * @returns Promise with analysis result
 */
export async function analyzeJD(jobDescription: string) {
  return fetchWithAuth(API_ENDPOINTS.CV.ANALYZE_JD, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobDescription })
  });
}

/**
 * Generate CV with AI based on job analysis
 * @param jobAnalysis - The job analysis object
 * @param additionalRequirements - Optional additional requirements
 * @returns Promise with generated CV
 */
export async function generateCVWithAI(jobAnalysis: any, additionalRequirements?: string) {
  return fetchWithAuth(API_ENDPOINTS.CV.GENERATE_WITH_AI, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobAnalysis, additionalRequirements })
  });
}

/**
 * Generate and save CV with AI
 * @param data - Data for generating and saving CV
 * @returns Promise with result
 */
export async function generateAndSaveCV(data: any) {
  return fetchWithAuth(API_ENDPOINTS.CV.GENERATE_AND_SAVE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

/**
 * Suggest Professional Summary with AI
 * @param user - User info
 * @param jobAnalysis - Job analysis object
 * @param additionalRequirements - Optional additional requirements
 * @returns Promise with summary suggestion
 */
export async function suggestSummary(user: any, jobAnalysis: any, additionalRequirements?: string) {
  return fetchWithAuth(API_ENDPOINTS.CV.SUGGEST_SUMMARY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user, jobAnalysis, additionalRequirements })
  });
}

/**
 * Suggest Skills Section with AI
 * @param jobAnalysis - Job analysis object
 * @param userSkills - Optional user skills
 * @returns Promise with skills suggestion
 */
export async function suggestSkills(jobAnalysis: any, userSkills?: Array<{ name: string; rating: number }>) {
  return fetchWithAuth(API_ENDPOINTS.CV.SUGGEST_SKILLS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobAnalysis, userSkills })
  });
}

/**
 * Suggest Work Experience with AI
 * @param jobAnalysis - Job analysis object
 * @param experienceLevel - Experience level string
 * @returns Promise with work experience suggestion
 */
export async function suggestWorkExperience(jobAnalysis: any, experienceLevel: string) {
  return fetchWithAuth(API_ENDPOINTS.CV.SUGGEST_WORK_EXPERIENCE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobAnalysis, experienceLevel })
  });
}

/**
 * Upload and analyze CV PDF (AI returns JSON)
 * @param file - The PDF file
 * @param jobDescription - Job description string
 * @returns Promise with analysis result
 */
export async function uploadAndAnalyzeCV(file: File, jobDescription: string) {
  const formData = new FormData();
  formData.append("cvFile", file);
  formData.append("jobDescription", jobDescription);
  return fetchWithAuth(API_ENDPOINTS.CV.UPLOAD_AND_ANALYZE, {
    method: "POST",
    body: formData
    // KHÔNG thêm headers Content-Type ở đây!
  });
}

/**
 * Upload CV PDF + JD, AI returns optimized PDF
 * @param file - The PDF file
 * @param jobDescription - Job description string
 * @param additionalNotes - Optional notes
 * @returns Promise with result (includes pdfPath)
 */
export async function uploadAnalyzeGeneratePDF(file: File, jobDescription: string, additionalNotes?: string) {
  const formData = new FormData();
  formData.append("cvFile", file);
  formData.append("jobDescription", jobDescription);
  if (additionalNotes) formData.append("additionalNotes", additionalNotes);
  return fetchWithAuth(API_ENDPOINTS.CV.UPLOAD_ANALYZE_GENERATE_PDF, {
    method: "POST",
    body: formData
  });
}

/**
 * Check AI status
 * @returns Promise with AI status
 */
export async function checkAIStatus() {
  return fetchWithAuth(API_ENDPOINTS.CV.AI_STATUS);
}