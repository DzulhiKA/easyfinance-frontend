"use client"

import { useState } from "react"
import api from "@/lib/api"
import { saveToken } from "@/lib/auth"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await api.post("/login", { email, password })
    saveToken(res.data.token)
    window.location.href = "/dashboard"
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={submit} className="w-96 space-y-4">
        <h1 className="text-2xl font-bold">Login</h1>
        <input
          className="border p-2 w-full"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border p-2 w-full"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="bg-black text-white w-full py-2">Login</button>
      </form>
    </div>
  )
}
