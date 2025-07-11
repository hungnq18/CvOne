import Cookies from "js-cookie";
import { API_URL } from "./apiConfig";

// For authenticated APIs
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Get token from cookies
  const token = Cookies.get("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const fullUrl = `${API_URL}${url}`;

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  if (response.status === 204 || response.headers.get("content-length") === "0") {
    if (!response.ok) {
      throw new Error("Request failed with status " + response.status);
    }
    return;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

// For public APIs that don't need authentication
export async function fetchWithoutAuth(url: string, options: RequestInit = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const fullUrl = `${API_URL}${url}`;

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}