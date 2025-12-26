"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import api from "@/lib/api"
import {
  PlusCircle,
  Trash2,
  Calendar,
  DollarSign,
  FileText,
  TrendingUp,
  TrendingDown,
  Receipt,
  RefreshCw,
  Search,
  X,
  Upload,
  Eye,
  Edit,
  Save,
  Image as ImageIcon,
} from "lucide-react"

/* =======================
   TYPES
======================= */
interface Category {
  id: number
  name: string
  type: "income" | "expense"
}

interface Transaction {
  id: number
  category_id: number
  type: "income" | "expense"
  amount: number
  date: string
  description: string | null
  category: Category
  image?: string | null
  image_url?: string | null
}

/* =======================
   IMAGE PREVIEW MODAL
======================= */
function ImagePreviewModal({
  imageUrl,
  onClose,
}: {
  imageUrl: string
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>
        <img
          src={imageUrl}
          alt="Transaction"
          className="max-w-full max-h-[90vh] object-contain"
        />
      </div>
    </div>
  )
}

/* =======================
   MAIN COMPONENT
======================= */
export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const [categoryId, setCategoryId] = useState<number | "">("")
  const [type, setType] = useState<"income" | "expense">("income")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState("")
  const [description, setDescription] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  // Filter states
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all"
  )
  const [searchTerm, setSearchTerm] = useState("")

  // Modal state
  const [viewingImage, setViewingImage] = useState<string | null>(null)

  /* =======================
     FETCH DATA (REAL API)
  ======================= */
  const fetchData = async () => {
    try {
      setLoading(true)

      const [trxRes, catRes] = await Promise.all([
        api.get<Transaction[]>("/transactions"),
        api.get<Category[]>("/categories"),
      ])

      setTransactions(trxRes.data || [])
      setCategories(catRes.data || [])
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

  /* =======================
     HANDLE IMAGE UPLOAD
  ======================= */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file maksimal 5MB")
        return
      }

      if (!file.type.startsWith("image/")) {
        alert("File harus berupa gambar")
        return
      }

      setImageFile(file)

      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  /* =======================
     EDIT TRANSACTION
  ======================= */
  const edit = (trx: Transaction) => {
    setEditingId(trx.id)
    setCategoryId(trx.category_id)
    setType(trx.type)
    setAmount(trx.amount.toString())
    setDate(trx.date)
    setDescription(trx.description || "")

    // Set image preview if exists
    if (trx.image_url) {
      setImagePreview(trx.image_url)
      setImageFile(null)
    }

    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setCategoryId("")
    setAmount("")
    setDate("")
    setDescription("")
    removeImage()
  }

  /* =======================
     HANDLE CARD CLICK - OPEN IMAGE
  ======================= */
  const handleCardClick = (trx: Transaction, e: React.MouseEvent) => {
    // Check if click is on button (edit/delete)
    const target = e.target as HTMLElement
    if (target.closest("button")) {
      return // Don't open image if clicking on buttons
    }

    // Open image if exists
    if (trx.image_url) {
      setViewingImage(trx.image_url)
    }
  }

  /* =======================
     SUBMIT TRANSACTION (CREATE OR UPDATE)
  ======================= */
  const submit = async () => {
    if (!categoryId || !amount || !date) {
      return alert("Kategori, tanggal, dan jumlah wajib diisi")
    }

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append("category_id", categoryId.toString())
      formData.append("type", type)
      formData.append("amount", amount)
      formData.append("date", date)
      if (description) formData.append("description", description)
      if (imageFile) formData.append("image", imageFile)

      if (editingId !== null) {
        await api.put(`/transactions/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        alert("Transaksi berhasil diupdate!")
      } else {
        await api.post("/transactions", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        alert("Transaksi berhasil ditambahkan!")
      }

      setCategoryId("")
      setAmount("")
      setDate("")
      setDescription("")
      setEditingId(null)
      removeImage()

      await fetchData()
    } catch (error: unknown) {
      console.error("Submit error:", error)

      let errorMsg =
        editingId !== null
          ? "Gagal mengupdate transaksi"
          : "Gagal menambah transaksi"

      if (axios.isAxiosError(error)) {
        errorMsg = error.response?.data?.message || errorMsg
      }

      alert(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  /* =======================
     DELETE TRANSACTION
  ======================= */
  const remove = async (id: number) => {
    if (!confirm("Hapus transaksi?")) return

    try {
      setLoading(true)
      await api.delete(`/transactions/${id}`)
      await fetchData()
      alert("Transaksi berhasil dihapus!")
    } catch (error: unknown) {
      console.error("Delete error:", error)

      let errorMsg = "Gagal menghapus transaksi"
      if (axios.isAxiosError(error)) {
        errorMsg = error.response?.data?.message || errorMsg
      }

      alert(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  /* =======================
     FILTER LOGIC
  ======================= */
  const filteredTransactions = transactions.filter((trx) => {
    const matchesType = filterType === "all" || trx.type === filterType
    const matchesSearch =
      searchTerm === "" ||
      trx.category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (trx.description &&
        trx.description.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesType && matchesSearch
  })

  /* =======================
     SUMMARY
  ======================= */
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0)

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Summary */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl" />
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                  <Receipt className="w-8 h-8 text-purple-400" />
                  Transactions
                </h1>
                <p className="text-gray-400">
                  Kelola semua transaksi keuangan Anda
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-emerald-400 font-medium">
                      Total Income
                    </span>
                  </div>
                  <p className="text-lg font-bold text-white">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>
                <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="w-4 h-4 text-rose-400" />
                    <span className="text-xs text-rose-400 font-medium">
                      Total Expense
                    </span>
                  </div>
                  <p className="text-lg font-bold text-white">
                    {formatCurrency(totalExpense)}
                  </p>
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
                        Edit Transaksi
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-5 h-5 text-purple-400" />
                        Tambah Transaksi
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
                  {/* Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tipe Transaksi
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

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Kategori
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => {
                        const val = e.target.value
                        setCategoryId(val === "" ? "" : Number(val))
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    >
                      <option value="" className="bg-slate-800">
                        Pilih Kategori
                      </option>
                      {categories
                        .filter((cat) => cat.type === type)
                        .map((cat) => (
                          <option
                            key={cat.id}
                            value={cat.id}
                            className="bg-slate-800"
                          >
                            {cat.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Jumlah
                    </label>
                    <input
                      type="number"
                      placeholder="Masukkan jumlah..."
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Tanggal
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Deskripsi (Opsional)
                    </label>
                    <textarea
                      placeholder="Tambahkan catatan..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none"
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <Receipt className="w-4 h-4" />
                      Lampiran Gambar (Opsional)
                    </label>

                    {!imagePreview ? (
                      <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 cursor-pointer transition-all group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 text-gray-400 mb-2 group-hover:text-purple-400 transition-colors" />
                          <p className="text-sm text-gray-400 group-hover:text-gray-300">
                            <span className="font-semibold">
                              Klik untuk upload
                            </span>{" "}
                            atau drag & drop
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, max 5MB
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    ) : (
                      <div className="relative rounded-xl overflow-hidden border border-white/10">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover"
                        />
                        <button
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={submit}
                    disabled={loading || !categoryId || !amount || !date}
                    className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : editingId ? (
                      <>
                        <Save className="w-5 h-5" />
                        Update Transaksi
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-5 h-5" />
                        Tambah Transaksi
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl" />
              <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 shadow-2xl">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari transaksi..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Type Filter */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilterType("all")}
                      className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                        filterType === "all"
                          ? "bg-purple-600 text-white"
                          : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilterType("income")}
                      className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                        filterType === "income"
                          ? "bg-emerald-600 text-white"
                          : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      Income
                    </button>
                    <button
                      onClick={() => setFilterType("expense")}
                      className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                        filterType === "expense"
                          ? "bg-rose-600 text-white"
                          : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      Expense
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions Cards */}
            <div className="space-y-3">
              {filteredTransactions.map((trx) => (
                <div
                  key={trx.id}
                  className="relative group"
                  onClick={(e) => handleCardClick(trx, e)}
                >
                  <div
                    className={`absolute inset-0 rounded-2xl blur-xl transition-all ${
                      trx.type === "income"
                        ? "bg-gradient-to-r from-emerald-500/10 to-emerald-600/10"
                        : "bg-gradient-to-r from-rose-500/10 to-rose-600/10"
                    }`}
                  />
                  <div
                    className={`relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all group-hover:bg-white/10 ${
                      trx.image_url ? "cursor-pointer" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: Icon & Info */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div
                          className={`p-3 rounded-xl border flex-shrink-0 ${
                            trx.type === "income"
                              ? "bg-emerald-500/10 border-emerald-500/20"
                              : "bg-rose-500/10 border-rose-500/20"
                          }`}
                        >
                          {trx.type === "income" ? (
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-rose-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white truncate">
                              {trx.category.name}
                            </h3>
                            {trx.image_url && (
                              <div className="flex-shrink-0 p-1 rounded bg-purple-500/20 border border-purple-500/30">
                                <ImageIcon className="w-3 h-3 text-purple-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(trx.date)}
                            </span>
                            {trx.description && (
                              <span className="truncate">
                                • {trx.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount & Actions */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p
                            className={`text-lg font-bold ${
                              trx.type === "income"
                                ? "text-emerald-400"
                                : "text-rose-400"
                            }`}
                          >
                            {trx.type === "income" ? "+" : "-"}{" "}
                            {formatCurrency(Number(trx.amount))}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => edit(trx)}
                            className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => remove(trx.id)}
                            className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading State */}
              {loading && (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-12 shadow-2xl text-center">
                  <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
                  <p className="text-gray-300">Memuat transaksi...</p>
                </div>
              )}

              {/* Empty State */}
              {!loading && filteredTransactions.length === 0 && (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-12 shadow-2xl text-center">
                  <Receipt className="w-16 h-16 text-gray--600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">
                    {searchTerm || filterType !== "all"
                      ? "Tidak ada transaksi yang sesuai"
                      : "Belum ada transaksi"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {viewingImage && (
        <ImagePreviewModal
          imageUrl={viewingImage}
          onClose={() => setViewingImage(null)}
        />
      )}
    </div>
  )
}
