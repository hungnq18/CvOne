"use client"

import Image from "next/image"
import Link from "next/link"
import React from "react"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { useLoginForm } from "@/components/forms/use-login-form"
import logoImg from "../../../public/logo/logoCVOne.svg"

export default function AdminLoginPage() {
  const {
    formData,
    showPassword,
    error,
    isLoading,
    t,
    handleInputChange,
    handleSubmit,
    setShowPassword
  } = useLoginForm(["admin"])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-md p-8">

        <div className="flex justify-center mb-6">
          <div className="relative w-24 h-24">
            <Image
              src={logoImg}
              alt="Logo"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-sky-600 mb-8">
          Admin Portal
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {t.email}
            </label>
            <input
              type="text"
              id="email"
              placeholder={t.emailPlaceholder}
              value={formData.email}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors disabled:bg-gray-100"
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              {t.password}
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder={t.passwordPlaceholder}
              value={formData.password}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors disabled:bg-gray-100 pr-10"
            />
             <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
          </div>

          {error && (
            <div className="text-red-600 text-sm mt-1">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full bg-gradient-to-r from-sky-400 to-sky-600 text-white font-semibold py-2 px-4 rounded-md shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            {isLoading ? t.loading : t.loginButton}
          </button>
        </form>
      </div>
    </div>
  )
}
