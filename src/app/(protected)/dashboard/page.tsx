"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import DashboardChart from "@/components/DashboardChart"
import { DashboardChartResponse } from "@/types/dashboard"

interface DashboardSummary {
  total_income: number
  total_expense: number
  balance: number
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [chart, setChart] = useState<DashboardChartResponse | null>(null)

  useEffect(() => {
    api.get("/dashboard/summary").then((res) => setSummary(res.data))
    api.get("/dashboard/chart?year=2025").then((res) => setChart(res.data))
  }, [])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {summary && (
        <div className="grid grid-cols-3 gap-4">
          <div className="border p-4 rounded">
            Income
            <br />
            <b>{summary.total_income}</b>
          </div>
          <div className="border p-4 rounded">
            Expense
            <br />
            <b>{summary.total_expense}</b>
          </div>
          <div className="border p-4 rounded">
            Balance
            <br />
            <b>{summary.balance}</b>
          </div>
        </div>
      )}

      {chart && <DashboardChart data={chart.data} />}
    </div>
  )
}
