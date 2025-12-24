"use client"

import Sidebar from "@/components/Sidebar"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 bg-gray-50 min-h-screen">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}
