"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  FileDown,
  BarChart3,
  Receipt,
} from "lucide-react"

/* =======================
   TYPES
======================= */
type TransactionItem = {
  date: string
  type: "income" | "expense"
  amount: string
  description: string | null
  category: string
}

type ReportResponse = {
  month?: number
  year: number
  data: TransactionItem[]
}

/* =======================
   MAIN COMPONENT
======================= */
export default function ReportsPage() {
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1)
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [loading, setLoading] = useState(false)

  const [report, setReport] = useState<ReportResponse>({
    month,
    year,
    data: [],
  })

  /* =======================
     FETCH REPORT
  ======================= */
  const fetchReport = async () => {
    try {
      setLoading(true)

      const endpoint = month === 0 ? "/reports/yearly" : "/reports/monthly"
      const params = month === 0 ? { year } : { month, year }

      const res = await api.get(endpoint, { params })

      setReport({
        month: month === 0 ? undefined : res.data.month,
        year: res.data.year,
        data: Array.isArray(res.data.data) ? res.data.data : [],
      })
    } catch (error) {
      console.error("Failed to fetch report:", error)
      setReport({ year, data: [] })
      alert("Gagal memuat laporan")
    } finally {
      setLoading(false)
    }
  }

  /* =======================
     DOWNLOAD HANDLER
  ======================= */
  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await api.get(url, {
        responseType: "blob",
      })

      const blob = new Blob([response.data])
      const link = document.createElement("a")

      link.href = window.URL.createObjectURL(blob)
      link.download = filename
      link.click()
      link.remove()
    } catch (error) {
      console.error("Download failed:", error)
      alert("Gagal mengunduh file")
    }
  }

  /* =======================
     EXPORT
  ======================= */
  const exportExcel = () => {
    const url =
      month === 0
        ? `/reports/yearly/excel?year=${year}`
        : `/reports/monthly/excel?month=${month}&year=${year}`

    downloadFile(url, "laporan.xlsx")
  }

const exportPdf = () => {
  const url =
    month === 0
      ? `http://127.0.0.1:8000/api/v1/reports/yearly/pdf?year=${year}`
      : `http://127.0.0.1:8000/api/v1/reports/monthly/pdf?month=${month}&year=${year}`

  window.open(url, "_blank")
}

  /* =======================
     FIRST LOAD
  ======================= */
  useEffect(() => {
    fetchReport()
  }, [])

  /* =======================
     SUMMARY
  ======================= */
  const totalIncome = report.data
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(item.amount), 0)

  const totalExpense = report.data
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + Number(item.amount), 0)

  const balance = totalIncome - totalExpense

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value)

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })

  const getMonthName = (m?: number) => {
    if (!m) return "Semua Bulan"
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ]
    return months[m - 1]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl" />
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-purple-400" />
                  Monthly Reports
                </h1>
                <p className="text-gray-400">
                  Laporan keuangan bulanan lengkap dengan detail transaksi
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <p className="text-sm text-purple-300 font-medium">Period</p>
                  <p className="text-white font-bold">
                    {getMonthName(report.month)} {report.year}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Export Section */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl" />
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Filters */}
              <div className="flex-1 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bulan
                  </label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-200 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  >
                    {Array.from({ length: 12 }).map((_, i) => (
                      <option
                        key={i + 1}
                        value={i + 1}
                        className="bg-slate-800"
                      >
                        {getMonthName(i + 1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 min-w-[150px]">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tahun
                  </label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-200 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={fetchReport}
                    disabled={loading}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                    />
                    Filter
                  </button>
                </div>
              </div>

              {/* Export Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={exportExcel}
                  className="px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-medium rounded-xl transition-all flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Excel
                </button>
                <button
                  onClick={exportPdf}
                  className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 font-medium rounded-xl transition-all flex items-center gap-2"
                >
                  <FileDown className="w-4 h-4" />
                  PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {report.data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Income */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/20">
                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-400 mb-1">
                  Total Income
                </p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(totalIncome)}
                </p>
                <p className="text-xs text-emerald-400 mt-2">
                  {report.data.filter((i) => i.type === "income").length}{" "}
                  transaksi
                </p>
              </div>
            </div>

            {/* Total Expense */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-rose-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500/20 to-rose-600/20 border border-rose-500/20">
                    <TrendingDown className="w-6 h-6 text-rose-400" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-400 mb-1">
                  Total Expense
                </p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(totalExpense)}
                </p>
                <p className="text-xs text-rose-400 mt-2">
                  {report.data.filter((i) => i.type === "expense").length}{" "}
                  transaksi
                </p>
              </div>
            </div>

            {/* Net Balance */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-purple-500/20">
                    <Receipt className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-400 mb-1">
                  Net Balance
                </p>
                <p
                  className={`text-2xl font-bold ${
                    balance >= 0 ? "text-white" : "text-rose-400"
                  }`}
                >
                  {formatCurrency(balance)}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Total {report.data.length} transaksi
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl" />
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-white/10 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                Transaction Details
              </h3>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Tipe
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Jumlah
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Deskripsi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {report.data.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-200 font-medium">
                            {formatDate(item.date)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-200">{item.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            item.type === "income"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {item.type === "income" ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {item.type === "income" ? "Income" : "Expense"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`font-bold ${
                            item.type === "income"
                              ? "text-emerald-400"
                              : "text-rose-400"
                          }`}
                        >
                          {item.type === "income" ? "+" : "-"}{" "}
                          {formatCurrency(Number(item.amount))}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-400 text-sm">
                          {item.description || "-"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="p-12 text-center">
                <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-300">Memuat laporan...</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && report.data.length === 0 && (
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  Tidak ada data untuk periode ini
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Coba pilih bulan dan tahun yang berbeda
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
