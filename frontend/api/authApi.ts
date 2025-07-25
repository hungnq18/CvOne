import type { AuthResponse } from "@/types/auth"
import { fetchWithAuth } from "./apiClient"
import { API_ENDPOINTS } from "./apiConfig"

export async function login(email: string, password: string): Promise<AuthResponse> {
  return fetchWithAuth(API_ENDPOINTS.AUTH.LOGIN, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

export async function register(first_name: string, email: string, password: string, last_name: string): Promise<AuthResponse> {
  return fetchWithAuth(API_ENDPOINTS.AUTH.REGISTER, {
    method: "POST",
    body: JSON.stringify({ first_name, email, password, last_name }),
  })
}

export async function getProfile() {
  return fetchWithAuth(API_ENDPOINTS.AUTH.PROFILE)
}

export async function verifyEmail(email: string): Promise<{ token: string }> {
  console.log('Calling verify email API with:', { email })
  console.log('API endpoint:', '/accounts/verify-email')
  
  const response = await fetchWithAuth('/accounts/verify-email', {
    method: "POST",
    body: JSON.stringify({ email })
  })
  
  console.log('Verify email response:', response)
  return response
}

export async function resendVerification(email: string) {
  return fetchWithAuth(API_ENDPOINTS.ACCOUNTS.RESEND_VERIFICATION, {
    method: "POST",
    body: JSON.stringify({ email })
  })
}

export async function verifyToken(token: string) {
  return fetchWithAuth(API_ENDPOINTS.ACCOUNTS.VERIFY_TOKEN(token), {
    method: "GET"
  })
}

export async function forgotPassword(email: string) {
  return fetchWithAuth('/api/auth/forgot-password', {
    method: "POST",
    body: JSON.stringify({ email })
  })
}

