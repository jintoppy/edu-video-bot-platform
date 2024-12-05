"use client"

import { UserButton } from "@clerk/nextjs"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { 
  LayoutDashboard, 
  Video, 
  GraduationCap, 
  UserCircle,
  Menu
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils"

const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin',
    color: "text-sky-500"
  }, 
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isSidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 bg-gray-900">
        <div className="flex flex-col h-full">
          <div className="flex h-14 items-center px-4 border-b border-gray-800">
            <Link href="/" className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-white" />
              <span className="text-xl font-bold text-white">EduBot</span>
            </Link>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-2">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-x-2 text-sm font-medium px-3 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10",
                    pathname === route.href 
                      ? "text-white bg-white/10" 
                      : "text-zinc-400"
                  )}
                >
                  <route.icon className={cn("h-5 w-5", route.color)} />
                  {route.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="md:pl-72">
        <div className="flex h-14 items-center px-4 border-b">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="ml-auto flex items-center gap-x-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}