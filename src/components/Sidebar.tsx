"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { logout } from "@/lib/auth"

export default function Sidebar() {
  const pathname = usePathname()

  const menu = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Reports", href: "/reports" },
  ]

  return (
    <aside className="w-64 min-h-screen border-r p-6 flex flex-col">
      {/* Logo */}
      <div className="text-xl font-bold mb-10">easyFinance</div>

      {/* Menu */}
      <nav className="flex-1 space-y-2">
        {menu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-3 py-2 rounded ${
              pathname === item.href
                ? "bg-black text-white"
                : "hover:bg-gray-100"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={logout}
        className="text-red-600 text-left hover:underline"
      >
        Logout
      </button>
    </aside>
  )
}
