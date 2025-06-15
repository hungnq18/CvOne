import { API_URL } from "./apiConfig"

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Check if we're in browser environment
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const fullUrl = `${API_URL}${url}`
  console.log('Fetching URL:', fullUrl)

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  })

  const data = await response.json()
  console.log('API Response:', { url: fullUrl, status: response.status, data })

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong")
  }

  return data
} 