"use client";

import type React from "react";

import { fetchWithAuth } from "@/api/apiClient";
import { API_ENDPOINTS } from "@/api/apiConfig";
import { login as apiLogin, register as apiRegister } from "@/api/authApi";
import { getUserIdFromToken } from "@/api/userApi";
import type { User } from "@/types/auth";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (first_name: string, email: string, password: string, last_name: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => { },
  register: async () => { },
  logout: () => { },
})

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  const getUserFromToken = useCallback(async () => {
    const userId = getUserIdFromToken();
    if (!userId) return null;

    try {
      const userData = await fetchWithAuth(API_ENDPOINTS.USER.GET_BY_ID(userId))
      return userData as User
    } catch (error) {
      console.error("Failed to fetch user data", error)
      return null
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const userData = await getUserFromToken();
    setUser(userData);
  }, [getUserFromToken]);

  // chỉ chạy 1 lần khi component mount
  useEffect(() => {
    setIsMounted(true)

    // Check if user is logged in on initial load using cookies
    const checkAuth = async () => {
      try {
        const userData = await getUserFromToken()
        setUser(userData)
      } catch (error) {
        console.error("Auth check failed", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth();
  }, [getUserFromToken]); // dependency getUserFromToken (đã được memoize)

  const login = useCallback(async (email: string, password: string) => {
    await apiLogin(email, password);
    const userData = await getUserFromToken();
    setUser(userData);
  }, [getUserFromToken]);

  const register = useCallback(async (
    first_name: string,
    email: string,
    password: string,
    last_name: string
  ) => {
    await apiRegister(first_name, email, password, last_name);
    const userData = await getUserFromToken();
    setUser(userData);
    router.push("/verify-email");
  }, [getUserFromToken, router]);

  const logout = useCallback(() => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    setUser(null);
    window.dispatchEvent(new CustomEvent("logout"));
    window.dispatchEvent(new CustomEvent("authChange"));
  }, []);

  const contextValue = useMemo(
    () => ({ user, isLoading, login, register, logout, refreshUser }),
    [user, isLoading, login, register, logout, refreshUser]
  );

  if (!isMounted) return null;

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}