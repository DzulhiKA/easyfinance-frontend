"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"

type TransactionItem = {
  date: string
  type: string
  amount: string
  description: string
  category: string
}

type MonthlyReport = {
  month: number
  year: number
  data: TransactionItem[]
}

export default function ReportsPage() {
  const [month, setMonth] = useState(1)
  const [year, setYear] = useState(new Date().getFullYear())

  const [report, setReport] = useState<MonthlyReport>({
    month: 1,
    year: new Date().getFullYear(),
    data: [],
  })

  const fetchReport = async () => {
    const res = await api.get("/reports/monthly", {
      params: { month, year },
    })

    // API kamu return: { month, year, data: [...] }
    setReport(res.data)
  }

  const exportExcel = () => {
    window.open(
      `http://127.0.0.1:8000/api/v1/reports/monthly/excel?month=${month}&year=${year}`,
      "_blank"
    )
  }

  const exportPdf = () => {
    window.open(
      `http://127.0.0.1:8000/api/v1/reports/monthly/pdf?month=${month}&year=${year}`,
      "_blank"
    )
  }

  useEffect(() => {
    const load = async () => {
      await fetchReport()
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>

      {/* Filter */}
      <div className="flex gap-4 items-end">
        <div>
          <label>Bulan</label>
          <input
            type="number"
            min={1}
            max={12}
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border p-2 w-24"
          />
        </div>

        <div>
          <label>Tahun</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border p-2 w-32"
          />
        </div>

        <button
          onClick={fetchReport}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Filter
        </button>

        <button onClick={exportExcel} className="border px-4 py-2 rounded">
          Export Excel
        </button>

        <button onClick={exportPdf} className="border px-4 py-2 rounded">
          Export PDF
        </button>
      </div>

      {/* Table */}
      <div className="overflow-auto border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Tanggal</th>
              <th className="p-2 text-left">Kategori</th>
              <th className="p-2 text-left">Tipe</th>
              <th className="p-2 text-right">Jumlah</th>
              <th className="p-2 text-left">Deskripsi</th>
            </tr>
          </thead>

          <tbody>
            {report.data.map((item, index) => (
              <tr key={index} className="border-t">
                <td className="p-2">{item.date}</td>
                <td className="p-2">{item.category}</td>
                <td className="p-2">{item.type}</td>
                <td className="p-2 text-right">
                  {Number(item.amount).toLocaleString()}
                </td>
                <td className="p-2">{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {report.data.length === 0 && (
          <div className="p-4 text-center text-gray-500">Tidak ada data</div>
        )}
      </div>
    </div>
  )
}
