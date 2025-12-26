"use client"

import { useEffect, useState } from "react"
import { useCallback } from "react"
import api from "@/lib/api"
import axios from "axios"

import {
  TrendingUp,
  TrendingDown,
  Wallet,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
} from "lucide-react"

/* =======================
    TYPES
======================= */
interface DashboardSummary {
  total_income: number
  total_expense: number
  balance: number
}

interface DashboardChartItem {
  month: string
  income: number
  expense: number
}

interface DashboardChartResponse {
  data: DashboardChartItem[]
}

interface SummaryCardProps {
  title: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  trendIcon: React.ComponentType<{ className?: string }>
  trendColor: string
  bg: string
}

interface FilterBarProps {
  month: number | ""
  setMonth: React.Dispatch<React.SetStateAction<number | "">>
  year: number
  setYear: React.Dispatch<React.SetStateAction<number>>
  loading: boolean
  fetchDashboard: () => void
}

/* =======================
    COMPACT TOP FILTER
======================= */
function FilterBar({
  month,
  setMonth,
  year,
  setYear,
  loading,
  fetchDashboard,
}: FilterBarProps) {
  return (
    <div className="flex items-center justify-end gap-3 p-2.5 bg-white/5 border border-white/10 rounded-xl shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-300" />
        <select
          value={month}
          onChange={(e) =>
            setMonth(e.target.value ? Number(e.target.value) : "")
          }
          className="px-2.5 py-1.5 rounded-lg bg-white/10 text-gray-100 text-xs border border-white/10 focus:ring-purple-500"
        >
          <option value="">Semua</option>
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i + 1} value={i + 1} className="text-black">
              {new Date(2000, i).toLocaleString("id-ID", { month: "short" })}
            </option>
          ))}
        </select>
      </div>

      <input
        type="number"
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
        className="px-2.5 py-1.5 rounded-lg bg-white/10 text-gray-100 text-xs border border-white/10 w-20 focus:ring-purple-500"
      />

      <button
        onClick={fetchDashboard}
        disabled={loading}
        className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg flex items-center gap-2 text-xs disabled:opacity-50"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        Terapkan
      </button>
    </div>
  )
}

/* =======================
    FIXED BAR CHART WITH PROPER HEIGHT
======================= */
function DashboardChart({ data }: { data: DashboardChartItem[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="relative group h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl" />
        <div className="relative h-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 shadow-2xl flex items-center justify-center">
          <p className="text-gray-400 text-sm">
            Tidak ada data untuk ditampilkan
          </p>
        </div>
      </div>
    )
  }

  const maxValue = Math.max(...data.flatMap((d) => [d.income, d.expense]), 1)

  return (
    <div className="relative group h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl" />

      <div className="relative h-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600/40 to-pink-600/40 border border-white/10">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Income vs Expense Chart
              </h3>
              <p className="text-[10px] text-gray-400">Monthly comparison</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-gray-300">Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-[10px] text-gray-300">Expense</span>
            </div>
          </div>
        </div>

        {/* Chart Container - This is the key part */}
        <div className="flex-1 px-5 pb-5 flex flex-col min-h-0">
          {/* Chart Area with fixed height */}
          <div className="flex-1 relative min-h-0">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="border-t border-white/5" />
              ))}
            </div>

            {/* Y-Axis Labels */}
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-gray-400 -ml-12 w-10 text-right">
              {[100, 75, 50, 25, 0].map((percent, i) => (
                <span key={i}>
                  {((maxValue * percent) / 100 / 1_000_000).toFixed(0)}M
                </span>
              ))}
            </div>

            {/* Bars Container */}
            <div className="absolute inset-0 pb-6 flex items-end gap-2">
              {data.map((item, idx) => {
                const incomePercent = (item.income / maxValue) * 100
                const expensePercent = (item.expense / maxValue) * 100

                return (
                  <div
                    key={idx}
                    className="flex-1 h-full flex items-end justify-center gap-1.5 group/bar"
                  >
                    {/* Income Bar */}
                    <div className="relative w-full max-w-[40px] h-full flex flex-col justify-end">
                      <div
                        className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all duration-300 group-hover/bar:shadow-lg group-hover/bar:shadow-emerald-500/50 relative"
                        style={{ height: `${incomePercent}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent rounded-t-lg" />
                        {/* Tooltip */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity z-20">
                          <div className="bg-emerald-500 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                            Rp {(item.income / 1_000_000).toFixed(1)}M
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expense Bar */}
                    <div className="relative w-full max-w-[40px] h-full flex flex-col justify-end">
                      <div
                        className="w-full bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-lg transition-all duration-300 group-hover/bar:shadow-lg group-hover/bar:shadow-rose-500/50 relative"
                        style={{ height: `${expensePercent}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent rounded-t-lg" />
                        {/* Tooltip */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity z-20">
                          <div className="bg-rose-500 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                            Rp {(item.expense / 1_000_000).toFixed(1)}M
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* X-Axis Labels */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2">
              {data.map((item, idx) => (
                <div key={idx} className="flex-1 text-center">
                  <span className="text-[11px] text-gray-300 font-medium">
                    {item.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* =======================
    SUMMARY CARD
======================= */
function SummaryCard({
  title,
  value,
  icon: Icon,
  trendIcon: Trend,
  trendColor,
  bg,
}: SummaryCardProps) {
  return (
    <div className="relative group">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${bg} rounded-2xl blur-xl`}
      />

      <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex items-start justify-between mb-3">
          <div
            className={`p-2.5 rounded-xl bg-gradient-to-br ${bg} border border-white/10`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>

          <div
            className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}
          >
            <Trend className="w-3.5 h-3.5" />
            12%
          </div>
        </div>

        <p className="text-xs text-gray-300 mb-1">{title}</p>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
    </div>
  )
}

/* =======================
    MAIN PAGE
======================= */
export default function DashboardPage() {
  const [month, setMonth] = useState<number | "">("")
  const [year, setYear] = useState(new Date().getFullYear())

  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [chart, setChart] = useState<DashboardChartItem[]>([])
  const [loading, setLoading] = useState(false)

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true)

      const [summaryRes, chartRes] = await Promise.all([
        api.get<DashboardSummary>("/dashboard/summary", {
          params: { month: month || undefined, year },
        }),
        api.get<DashboardChartResponse>("/dashboard/chart", {
          params: { year },
        }),
      ])

      setSummary(summaryRes.data)
      setChart(chartRes.data.data)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          alert("Sesi habis, silakan login ulang.")
        }
        console.error("Dashboard axios error:", err.response?.data)
      } else {
        console.error("Unexpected error:", err)
      }
    } finally {
      setLoading(false)
    }
  }, [month, year])

  useEffect(() => {
    fetchDashboard()
  }, [])

  const formatIDR = (v: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(v)

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 overflow-hidden">
      <div className="h-full max-w-7xl mx-auto flex flex-col gap-5">
        {/* HEADER */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 text-xs">Financial Overview</p>
          </div>

          <FilterBar
            month={month}
            setMonth={setMonth}
            year={year}
            setYear={setYear}
            loading={loading}
            fetchDashboard={fetchDashboard}
          />
        </div>

        {/* SUMMARY CARDS */}
        {summary && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
            <SummaryCard
              title="Total Income"
              value={formatIDR(summary.total_income)}
              icon={TrendingUp}
              trendIcon={ArrowUpRight}
              trendColor="text-emerald-400"
              bg="from-emerald-500/20 to-emerald-600/20"
            />

            <SummaryCard
              title="Total Expense"
              value={formatIDR(summary.total_expense)}
              icon={TrendingDown}
              trendIcon={ArrowDownRight}
              trendColor="text-rose-400"
              bg="from-rose-500/20 to-rose-600/20"
            />

            <SummaryCard
              title="Balance"
              value={formatIDR(summary.balance)}
              icon={Wallet}
              trendIcon={summary.balance >= 0 ? ArrowUpRight : ArrowDownRight}
              trendColor={
                summary.balance >= 0 ? "text-purple-400" : "text-rose-400"
              }
              bg="from-blue-500/20 to-purple-600/20"
            />
          </div>
        )}

        {/* CHART - Takes remaining space */}
        <div className="flex-1 min-h-0">
          <DashboardChart data={chart} />
        </div>
      </div>
    </div>
  )
}
