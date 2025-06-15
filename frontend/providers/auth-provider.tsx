"use client"

import type React from "react"

import { API_ENDPOINTS } from "@/api/apiConfig"
import { login as apiLogin, register as apiRegister } from "@/api/authApi"
import type { User } from "@/types/auth"
import { useRouter } from "next/navigation"
import { createContext, useContext, useEffect, useState } from "react"

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
  login: async () => {},
  register: async () => {},
  logout: () => {},
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

  useEffect(() => {
    setIsMounted(true)
    // Check if user is logged in on initial load
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error("Failed to parse user data", error)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }

    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login with:', { email, password })
      console.log('API endpoint:', API_ENDPOINTS.AUTH.LOGIN)
      
      const data = await apiLogin(email, password)
      console.log('Login successful:', data)
      
      // Save token and user data
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      setUser(data.user)
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
      
      // Save user data and token
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      setUser(data.user)

      // Step 2: Redirect to confirm email page
      router.push('/verify-email/confirm')
    } catch (error) {
      console.error("Registration failed:", error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
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
