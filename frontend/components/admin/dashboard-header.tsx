"use client"

import { Search, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export function DashboardHeader() {
  const { logout } = useAuth()
  const router = useRouter();
  const handleLogout = () => {
    logout();
    document.cookie = "token=; path=/; max-age=0";
    window.location.href = '/login';
  }
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-white px-6">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative flex-1 max-w-md"></div>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback>TA</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-medium">Thomas Anree</p>
                <p className="text-xs text-muted-foreground">UX Designer</p>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}