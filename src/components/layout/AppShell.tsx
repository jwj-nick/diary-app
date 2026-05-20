import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Sidebar } from './Sidebar'

interface Props {
  children: React.ReactNode
}

export function AppShell({ children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 overflow-y-auto z-30">
        <Sidebar />
      </aside>

      {/* Mobile overlay sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white overflow-y-auto">
            <Sidebar onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen overflow-y-auto">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b bg-white sticky top-0 z-10">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1 rounded hover:bg-zinc-100 text-zinc-600"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold text-zinc-800 flex items-center gap-1.5">
            <span>📓</span>
            내 일기장
          </span>
        </div>

        <div className="flex-1 p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
