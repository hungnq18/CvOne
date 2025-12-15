import { fetchWithAuth } from "./apiClient";
import { API_ENDPOINTS } from "./apiConfig";

export interface RevenueSummary {
  totalRevenue: number;
  count: number;
  byType: Record<string, { count: number; total: number }>;
}

export interface ProfitSummary {
  totalRevenue: number;
  totalCosts: number;
  totalProfit: number;
  averageProfitMargin: number;
  byCostType: Record<string, { count: number; total: number }>;
}

export interface RevenueData {
  _id: string;
  userId: string;
  orderId?: string;
  revenueType: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
  revenueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfitData {
  _id: string;
  period: string;
  periodType: string;
  revenueId: string;
  totalRevenue: number;
  costs: Array<{
    costType: string;
    amount: number;
    description: string;
    status: string;
    costDate: string;
    notes?: string;
  }>;
  totalCosts: number;
  profit: number;
  profitMargin: number;
  currency: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get revenue summary with optional filters
 */
export async function getRevenueSummary(params?: {
  revenueType?: string;
  startDate?: string;
  endDate?: string;
}): Promise<RevenueSummary> {
  const queryParams = new URLSearchParams();
  if (params?.revenueType) queryParams.append("revenueType", params.revenueType);
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);

  const url = `${API_ENDPOINTS.REVENUE_PROFIT.REVENUE_SUMMARY}${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  return fetchWithAuth(url, { method: "GET" });
}

/**
 * Get all revenues with optional filters
 */
export async function getAllRevenues(params?: {
  revenueType?: string;
  status?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<RevenueData[]> {
  const queryParams = new URLSearchParams();
  if (params?.revenueType) queryParams.append("revenueType", params.revenueType);
  if (params?.status) queryParams.append("status", params.status);
  if (params?.userId) queryParams.append("userId", params.userId);
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);

  const url = `${API_ENDPOINTS.REVENUE_PROFIT.LIST_REVENUE}${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const data = await fetchWithAuth(url, { method: "GET" });
  return Array.isArray(data) ? data : [];
}

/**
 * Get profit summary with optional filters
 */
export async function getProfitSummary(params?: {
  period?: string;
  periodType?: string;
}): Promise<ProfitSummary> {
  const queryParams = new URLSearchParams();
  if (params?.period) queryParams.append("period", params.period);
  if (params?.periodType) queryParams.append("periodType", params.periodType);

  const url = `${API_ENDPOINTS.REVENUE_PROFIT.PROFIT_SUMMARY}${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  return fetchWithAuth(url, { method: "GET" });
}

/**
 * Get all profits with optional filters
 */
export async function getAllProfits(params?: {
  period?: string;
  periodType?: string;
}): Promise<ProfitData[]> {
  const queryParams = new URLSearchParams();
  if (params?.period) queryParams.append("period", params.period);
  if (params?.periodType) queryParams.append("periodType", params.periodType);

  const url = `${API_ENDPOINTS.REVENUE_PROFIT.LIST_PROFIT}${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const data = await fetchWithAuth(url, { method: "GET" });
  return Array.isArray(data) ? data : [];
}
