"use client"

import { useEffect, useState } from "react"
import {
  PlusCircle,
  Save,
  Trash2,
  Edit,
  X,
  Tag,
  TrendingUp,
  TrendingDown,
  Folder,
  RefreshCw,
} from "lucide-react"

/* =======================
   TYPES
======================= */
interface Category {
  id: number
  name: string
  type: "income" | "expense"
}

/* =======================
   MOCK API (Replace with your actual api)
======================= */
const api = {
  get: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return {
      data: [
        { id: 1, name: "Gaji", type: "income" as const },
        { id: 2, name: "Freelance", type: "income" as const },
        { id: 3, name: "Makanan", type: "expense" as const },
        { id: 4, name: "Transport", type: "expense" as const },
        { id: 5, name: "Belanja", type: "expense" as const },
      ],
    }
  },
  post: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { data: {} }
  },
  put: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { data: {} }
  },
  delete: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { data: {} }
  },
}

/* =======================
   MAIN COMPONENT
======================= */
export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState("")
  const [type, setType] = useState<"income" | "expense">("income")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await api.get()
      setCategories(Array.isArray(res.data) ? res.data : [])
    } catch (error) {
      console.error("Failed to fetch categories:", error)
      alert("Gagal memuat kategori")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const submit = async () => {
    if (!name.trim()) return alert("Nama wajib diisi")

    try {
      setLoading(true)

      if (editingId !== null) {
        await api.put()
      } else {
        await api.post()
      }

      setName("")
      setType("income")
      setEditingId(null)

      await fetchCategories()
    } catch (error) {
      console.error("Failed to submit:", error)
      alert("Gagal menyimpan kategori")
    } finally {
      setLoading(false)
    }
  }

  const edit = (cat: Category) => {
    setEditingId(cat.id)
    setName(cat.name)
    setType(cat.type)
  }

  const remove = async (id: number) => {
    if (!confirm("Hapus kategori?")) return

    try {
      setLoading(true)
      await api.delete()
      await fetchCategories()
    } catch (error) {
      console.error("Failed to delete:", error)
      alert("Gagal menghapus kategori")
    } finally {
      setLoading(false)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setName("")
    setType("income")
  }

  const incomeCategories = categories.filter((c) => c.type === "income")
  const expenseCategories = categories.filter((c) => c.type === "expense")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl" />
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                  <Tag className="w-8 h-8 text-purple-400" />
                  Categories
                </h1>
                <p className="text-gray-400">
                  Kelola kategori pemasukan & pengeluaran Anda
                </p>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">
                    {incomeCategories.length} Income
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                  <span className="text-rose-400 font-semibold">
                    {expenseCategories.length} Expense
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="relative group sticky top-6">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {editingId ? (
                      <>
                        <Edit className="w-5 h-5 text-blue-400" />
                        Edit Kategori
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-5 h-5 text-purple-400" />
                        Tambah Kategori
                      </>
                    )}
                  </h2>
                  {editingId && (
                    <button
                      onClick={cancelEdit}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nama Kategori
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: Gaji, Makanan, Transport..."
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tipe Kategori
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setType("income")}
                        className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                          type === "income"
                            ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                            : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
                        }`}
                      >
                        <TrendingUp className="w-4 h-4" />
                        Income
                      </button>
                      <button
                        onClick={() => setType("expense")}
                        className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                          type === "expense"
                            ? "bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg shadow-rose-500/30"
                            : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
                        }`}
                      >
                        <TrendingDown className="w-4 h-4" />
                        Expense
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={submit}
                    disabled={loading || !name.trim()}
                    className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : editingId ? (
                      <>
                        <Save className="w-5 h-5" />
                        Update Kategori
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-5 h-5" />
                        Tambah Kategori
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Categories List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Income Categories */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-2xl blur-xl" />
              <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border-b border-white/10 px-6 py-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    Income Categories
                    <span className="ml-auto text-sm bg-emerald-500/20 px-3 py-1 rounded-full text-emerald-300">
                      {incomeCategories.length}
                    </span>
                  </h3>
                </div>

                <div className="divide-y divide-white/5">
                  {incomeCategories.map((cat) => (
                    <div
                      key={cat.id}
                      className="px-6 py-4 hover:bg-white/5 transition-all group/item"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <Folder className="w-5 h-5 text-emerald-400" />
                          </div>
                          <span className="text-gray-200 font-medium">
                            {cat.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <button
                            onClick={() => edit(cat)}
                            className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => remove(cat.id)}
                            className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {incomeCategories.length === 0 && !loading && (
                    <div className="px-6 py-12 text-center text-gray-400">
                      <Folder className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>Belum ada kategori income</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Expense Categories */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-rose-600/10 rounded-2xl blur-xl" />
              <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-rose-500/20 to-rose-600/20 border-b border-white/10 px-6 py-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-rose-400" />
                    Expense Categories
                    <span className="ml-auto text-sm bg-rose-500/20 px-3 py-1 rounded-full text-rose-300">
                      {expenseCategories.length}
                    </span>
                  </h3>
                </div>

                <div className="divide-y divide-white/5">
                  {expenseCategories.map((cat) => (
                    <div
                      key={cat.id}
                      className="px-6 py-4 hover:bg-white/5 transition-all group/item"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                            <Folder className="w-5 h-5 text-rose-400" />
                          </div>
                          <span className="text-gray-200 font-medium">
                            {cat.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <button
                            onClick={() => edit(cat)}
                            className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => remove(cat.id)}
                            className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {expenseCategories.length === 0 && !loading && (
                    <div className="px-6 py-12 text-center text-gray-400">
                      <Folder className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>Belum ada kategori expense</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-12 shadow-2xl text-center">
                <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-300">Memuat kategori...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
