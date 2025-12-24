"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Category } from "@/types/category"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState("")
  const [type, setType] = useState<"income" | "expense">("income")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  // --- FETCH DATA (API RETURN ARRAY) ---
  const fetchCategories = async () => {
    try {
      setLoading(true)

      const res = await api.get<Category[]>("/categories")

      // VALIDATE: HARUS ARRAY
      if (Array.isArray(res.data)) {
        setCategories(res.data)
      } else {
        console.error("Invalid categories response:", res.data)
        setCategories([])
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
      alert("Gagal memuat kategori")
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // --- SUBMIT ---
  const submit = async () => {
    if (!name.trim()) return alert("Nama wajib diisi")

    try {
      setLoading(true)

      if (editingId !== null) {
        await api.put(`/categories/${editingId}`, { name, type })
      } else {
        await api.post("/categories", { name, type })
      }

      // Reset form
      setName("")
      setType("income")
      setEditingId(null)

      await fetchCategories()
    } catch (error) {
      console.error("Failed to submit category:", error)
      alert("Gagal menyimpan kategori")
    } finally {
      setLoading(false)
    }
  }

  // --- EDIT MODE ---
  const edit = (cat: Category) => {
    setEditingId(cat.id)
    setName(cat.name)
    setType(cat.type)
  }

  // --- DELETE ---
  const remove = async (id: number) => {
    if (!confirm("Hapus kategori?")) return

    try {
      setLoading(true)
      await api.delete(`/categories/${id}`)
      await fetchCategories()
    } catch (error) {
      console.error("Failed to delete category:", error)
      alert("Gagal menghapus kategori")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Categories</h1>

      {/* Form */}
      <div className="border p-4 rounded space-y-4 max-w-md">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama kategori"
          className="border p-2 w-full"
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value as "income" | "expense")}
          className="border p-2 w-full"
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <button
          onClick={submit}
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {editingId ? "Update" : "Tambah"}
        </button>
      </div>

      {/* Table */}
      <div className="border rounded overflow-auto max-w-xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Nama</th>
              <th className="p-2 text-left">Tipe</th>
              <th className="p-2 text-right">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-t">
                <td className="p-2">{cat.name}</td>
                <td className="p-2 capitalize">{cat.type}</td>
                <td className="p-2 text-right space-x-2">
                  <button
                    onClick={() => edit(cat)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(cat.id)}
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

        {!loading && categories.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            Belum ada kategori
          </div>
        )}
      </div>
    </div>
  )
}
