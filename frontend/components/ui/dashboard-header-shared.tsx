"use client"

import { LogOut, SunMedium, Languages } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useLanguage } from "@/providers/global_provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface DashboardHeaderSharedProps {
  // role dùng để xác định đường dẫn sau khi logout
  role: "admin" | "marketing"
  roleLabel: string
  avatarSrc: string
  avatarFallback: string
}

export function DashboardHeaderShared({
  role,
  roleLabel,
  avatarSrc,
  avatarFallback,
}: DashboardHeaderSharedProps) {
  const { logout } = useAuth()
  const { language, setLanguage } = useLanguage()
  const router = useRouter();
  const now = new Date();
  const formattedDate = now.toLocaleDateString(language === 'vi' ? "vi-VN" : "en-US", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const handleLogout = () => {
    logout()
    document.cookie = "token=; path=/; max-age=0"
    const redirectPath = role === "admin" ? "/admin/login" : "/marketing/login"
    router.push(redirectPath)
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between bg-slate-800 px-6 text-white shadow">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
          <SunMedium className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold">Welcome {roleLabel}!</span>
          <span className="text-xs opacity-90">
            {language === 'vi'
              ? `Hôm nay là ${formattedDate}. Chúc bạn một ngày làm việc hiệu quả!`
              : `Today is ${formattedDate}. Have a productive day!`}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-white/60 bg-white/10 hover:bg-white/20 text-white transition-colors">
              <Languages className="h-4 w-4" />
              <span className="sr-only">Switch Language</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setLanguage('vi')}>
              Tiếng Việt
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('en')}>
              English
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Avatar className="h-8 w-8 border border-white/60">
          <AvatarImage src={avatarSrc} />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        <button
          onClick={handleLogout}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
