"use client"

import type React from "react"

import { API_ENDPOINTS } from "@/api/apiConfig"
import { login as apiLogin, register as apiRegister } from "@/api/authApi"
import type { User } from "@/types/auth"
import { useRouter } from "next/navigation"
import { createContext, useContext, useEffect, useState } from "react"
import { getUserIdFromToken } from "@/api/userApi"
import { fetchWithAuth } from "@/api/apiClient"

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
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()

  // Function to get user data from token
  const getUserFromToken = async () => {
    const userId = getUserIdFromToken()
    if (!userId) return null

    try {
      const userData = await fetchWithAuth(API_ENDPOINTS.USER.GET_BY_ID(userId))
      return userData as User
    } catch (error) {
      console.error("Failed to fetch user data", error)
      return null
    }
  }

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

    checkAuth()

    // Kiểm tra token định kỳ để đồng bộ với cookies
    const tokenCheckInterval = setInterval(async () => {
      const userId = getUserIdFromToken()
      if (userId && !user) {
        // Có token nhưng chưa có user data
        try {
          const userData = await getUserFromToken()
          setUser(userData)
        } catch (error) {
          console.error("Token check failed", error)
        }
      } else if (!userId && user) {
        // Không có token nhưng vẫn có user data
        setUser(null)
      }
    }, 3000) // Kiểm tra mỗi 3 giây

    return () => {
      clearInterval(tokenCheckInterval)
    }
  }, [user])

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login with:', { email, password })
      console.log('API endpoint:', API_ENDPOINTS.AUTH.LOGIN)

      const data = await apiLogin(email, password)
      console.log('Login successful:', data)

      // Token is already saved in cookies by the login form
      // Just fetch and set user data
      const userData = await getUserFromToken()
      setUser(userData)
    } catch (error) {
      console.error("Login failed", error)
      throw error
    }
  }

  const register = async (first_name: string, email: string, password: string, last_name: string) => {
    try {
      console.log('Attempting registration with:', { first_name, email, last_name })
      console.log('API endpoint:', API_ENDPOINTS.AUTH.REGISTER)

      // Step 1: Register user
      const data = await apiRegister(first_name, email, password, last_name)
      console.log('Registration successful:', data)

      // Token is already saved in cookies by the register form
      // Just fetch and set user data
      const userData = await getUserFromToken()
      setUser(userData)

      // Step 2: Redirect to confirm email page
      router.push('/verify-email/confirm')
    } catch (error) {
      console.error("Registration failed:", error)
      throw error
    }
  }

  const logout = () => {
    // Remove token from cookies
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;"
    setUser(null)

    // Emit custom events để trigger re-render của icon components
    window.dispatchEvent(new CustomEvent('logout'));
    window.dispatchEvent(new CustomEvent('authChange'));
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return null
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
