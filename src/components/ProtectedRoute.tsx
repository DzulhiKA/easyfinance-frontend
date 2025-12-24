"use client"

import { useEffect } from "react"
import { getToken } from "@/lib/auth"

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    if (!getToken()) {
      window.location.href = "/login"
    }
  }, [])

  return <>{children}</>
}
