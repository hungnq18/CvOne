"use client"

import type React from "react"

import type { User } from "@/types/auth"
import { createContext, useEffect, useState } from "react"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
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
    // This is a mock implementation. Replace with your actual API call
    try {
      // Example API call:
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // })
      // const data = await response.json()
      // if (!response.ok) throw new Error(data.message)

      // Mock successful response 
      const mockResponse = {
        token: "mock-jwt-token",
        user: {
          id: "1",
          name: "Test User",
          email,
        },
      }

      // Save token and user data
      localStorage.setItem("token", mockResponse.token)
      localStorage.setItem("user", JSON.stringify(mockResponse.user))

      setUser(mockResponse.user)
    } catch (error) {
      console.error("Login failed", error)
      throw error
    }
  }

  const register = async (name: string, email: string, password: string) => {
    // This is a mock implementation. Replace with your actual API call
    try {
      // Example API call:
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name, email, password }),
      // })
      // const data = await response.json()
      // if (!response.ok) throw new Error(data.message)

      // Mock successful response
      const mockResponse = {
        token: "mock-jwt-token",
        user: {
          id: "1",
          name,
          email,
        },
      }

      // Save token and user data
      localStorage.setItem("token", mockResponse.token)
      localStorage.setItem("user", JSON.stringify(mockResponse.user))

      setUser(mockResponse.user)
    } catch (error) {
      console.error("Registration failed", error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>{children}</AuthContext.Provider>
}
