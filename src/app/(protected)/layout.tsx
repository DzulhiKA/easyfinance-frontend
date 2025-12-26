import Sidebar from "@/components/Sidebar"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full bg-slate-900 text-white">
      {/* SIDEBAR FIX */}
      <aside className="w-64 bg-black/95 border-r border-white/10">
        <Sidebar />
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-0 m-0">{children}</main>
    </div>
  )
}
