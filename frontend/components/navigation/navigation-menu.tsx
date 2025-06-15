"use client"

import { cn } from "@/api/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export function NavigationMenu() {
  const pathname = usePathname()

  return (
    <nav className="hidden md:flex gap-6">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === link.href ? "text-primary" : "text-muted-foreground",
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
