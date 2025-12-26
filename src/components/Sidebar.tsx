"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { logout } from "@/lib/auth"

import {
  LayoutDashboard,
  FolderKanban,
  Receipt,
  BarChart3,
  LogOut,
} from "lucide-react"

const Sidebar = () => {
  const pathname = usePathname()

  const menu = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Categories", href: "/categories", icon: FolderKanban },
    { label: "Transactions", href: "/transactions", icon: Receipt },
    { label: "Reports", href: "/reports", icon: BarChart3 },
  ]

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-gradient-to-b from-slate-900 via-purple-900/50 to-slate-900 border-r border-white/10 px-4 py-6 flex flex-col backdrop-blur-xl z-40">
      {/* Logo */}
      <div className="pb-8 px-3 relative shrink-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur-xl" />
        <h1 className="relative text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 text-transparent bg-clip-text">
          easyFinance
        </h1>
        <p className="relative text-xs text-gray-400 mt-1">
          Financial Management
        </p>
      </div>

      {/* Menu - Scrollable if needed */}
      <nav className="flex-1 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {menu.map((item) => {
          const active = pathname === item.href
          const Icon = item.icon

          return (
            <div key={item.href} className="relative group">
              {active && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-xl blur-md" />
              )}

              <Link
                href={item.href}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all
                  ${
                    active
                      ? "bg-white/5 text-white border border-white/10 shadow-lg backdrop-blur-md"
                      : "text-gray-300 hover:bg-white/5 hover:text-white hover:border hover:border-white/10"
                  }
                `}
              >
                <div
                  className={`p-2 rounded-lg ${
                    active
                      ? "bg-gradient-to-br from-purple-600/40 to-pink-600/40"
                      : "bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {item.label}
              </Link>
            </div>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div className="relative group shrink-0 mt-4">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-600/20 to-red-600/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity" />

        <button
          onClick={logout}
          className="relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-red-400 hover:bg-white/5 hover:border hover:border-red-500/20 transition-all backdrop-blur-md"
        >
          <div className="p-2 rounded-lg bg-white/5 group-hover:bg-red-500/10">
            <LogOut className="w-4 h-4" />
          </div>
          Logout
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
