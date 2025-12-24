"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Transaction } from "@/types/transaction"
import { Category } from "@/types/category"

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const [categoryId, setCategoryId] = useState<number | "">("")
  const [type, setType] = useState<"income" | "expense">("income")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  // Fetch semua data
  const fetchData = async () => {
    try {
      setLoading(true)

      // Jika API bentuknya { data: [...] }, pakai ini:
      // const [trxRes, catRes] = await Promise.all([
      //   api.get<{ data: Transaction[] }>("/transactions"),
      //   api.get<{ data: Category[] }>("/categories"),
      // ])
      // setTransactions(trxRes.data.data)
      // setCategories(catRes.data.data)

      // Jika API return array langsung (umum di Laravel)
      const [trxRes, catRes] = await Promise.all([
        api.get<Transaction[]>("/transactions"),
        api.get<Category[]>("/categories"),
      ])
      setTransactions(trxRes.data)
      setCategories(catRes.data)
    } catch (error) {
      console.error("Fetch error:", error)
      alert("Gagal memuat data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const submit = async () => {
    if (!categoryId || !amount || !date) {
      return alert("Kategori, tanggal, dan jumlah wajib diisi")
    }

    try {
      setLoading(true)

      await api.post("/transactions", {
        category_id: categoryId,
        type,
        amount: Number(amount),
        date,
        description: description.trim() ? description : null,
      })

      // Reset form
      setCategoryId("")
      setAmount("")
      setDate("")
      setDescription("")

      await fetchData()
    } catch (error) {
      console.error("Submit error:", error)
      alert("Gagal menambah transaksi")
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id: number) => {
    if (!confirm("Hapus transaksi?")) return

    try {
      setLoading(true)
      await api.delete(`/transactions/${id}`)
      await fetchData()
    } catch (error) {
      console.error("Delete error:", error)
      alert("Gagal menghapus transaksi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Transactions</h1>

      {/* Form */}
      <div className="border p-4 rounded space-y-4 max-w-lg">
        <select
          value={categoryId}
          onChange={(e) => {
            const val = e.target.value
            setCategoryId(val === "" ? "" : Number(val))
          }}
          className="border p-2 w-full"
        >
          <option value="">Pilih Kategori</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name} ({cat.type})
            </option>
          ))}
        </select>

        <select
          value={type}
          onChange={(e) => setType(e.target.value as "income" | "expense")}
          className="border p-2 w-full"
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <input
          type="number"
          placeholder="Jumlah"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 w-full"
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 w-full"
        />

        <input
          placeholder="Deskripsi (opsional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 w-full"
        />

        <button
          onClick={submit}
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Tambah Transaksi
        </button>
      </div>

      {/* Table */}
      <div className="border rounded overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Tanggal</th>
              <th className="p-2">Kategori</th>
              <th className="p-2">Tipe</th>
              <th className="p-2 text-right">Jumlah</th>
              <th className="p-2">Deskripsi</th>
              <th className="p-2 text-right">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((trx) => (
              <tr key={trx.id} className="border-t">
                <td className="p-2">{trx.date}</td>
                <td className="p-2">{trx.category.name}</td>
                <td className="p-2">{trx.type}</td>
                <td className="p-2 text-right">
                  {Number(trx.amount).toLocaleString()}
                </td>
                <td className="p-2">{trx.description}</td>
                <td className="p-2 text-right">
                  <button
                    onClick={() => remove(trx.id)}
                    className="text-red-600 hover:underline"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <div className="p-4 text-center text-gray-500">Memuat...</div>
        )}

        {!loading && transactions.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            Belum ada transaksi
          </div>
        )}
      </div>
    </div>
  )
}
