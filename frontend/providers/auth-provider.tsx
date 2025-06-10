"use client"

import type React from "react"

import type { User } from "@/types/auth"
import { createContext, useEffect, useState } from "react"

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

// Update API URL to match your NestJS backend
const API_URL = 'http://localhost:8000/api'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

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
      console.log('API URL:', `${API_URL}/auth/login`)

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })
      
      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }))
        console.error('Login error:', errorData)
        throw new Error(errorData.message || 'Login failed')
      }

      const data = await response.json()
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
      console.log('Attempting registration with:', { first_name, email, password, last_name })
      console.log('API URL:', `${API_URL}/auth/register`)

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ first_name, email, password, last_name })
      })
      
      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Registration failed' }))
        console.error('Registration error:', errorData)
        throw new Error(errorData.message || 'Registration failed')
      }

      const data = await response.json()
      console.log('Registration successful:', data)
      
      // Save user data
      localStorage.setItem("user", JSON.stringify(data))

      setUser(data)
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
