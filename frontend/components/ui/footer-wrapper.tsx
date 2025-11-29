"use client"

import { usePathname } from 'next/navigation'
import { jwtDecode } from "jwt-decode"
import type { DecodedToken } from "@/middleware"
import { Footer } from './footer'

function getRoleFromToken() {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  if (!token) return null;
  try {
    const decoded: DecodedToken = jwtDecode(token);
    return decoded.role;
  } catch {
    return null;
  }
}

export default function FooterWrapper() {
  const pathname = usePathname()
  const role = getRoleFromToken();

  const showFooter =
    !pathname?.startsWith('/chat') &&
    role !== "admin" &&
    role !== "mkt";

  return <Footer show={showFooter} />
}