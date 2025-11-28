import { fetchWithAuth } from "./apiClient";
import { API_ENDPOINTS } from "./apiConfig";

export type FeedbackFeature =
  | "translate_cv"
  | "generate_cv"
  | "generate_cl"
  | "rebuild_cv_pdf"
  | "ai_interview";

export interface FeedbackAnswer {
  title: string;
  // Câu trả lời có thể là string, number, object... từ Google Form
  answer: any;
}

export interface Feedback {
  _id: string;
  feature: FeedbackFeature;
  answers: FeedbackAnswer[];
  submittedAt?: string | Date;
  createdAt?: string | Date;
}

export const getAllFeedback = async (): Promise<Feedback[]> => {
  const response = await fetchWithAuth(API_ENDPOINTS.FEEDBACK.GET_ALL);
  return response as Feedback[];
};

export const getFeedbackByFeature = async (
  feature: FeedbackFeature,
): Promise<Feedback[]> => {
  const response = await fetchWithAuth(
    API_ENDPOINTS.FEEDBACK.GET_BY_FEATURE(feature),
  );
  return response as Feedback[];
};



