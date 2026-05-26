import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { ViewAsBanner } from './ViewAsBanner'

interface Props {
  children: React.ReactNode
}

export function AppShell({ children }: Props) {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 overflow-y-auto z-30">
        <Sidebar />
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen overflow-y-auto bg-background">
        <ViewAsBanner />
        <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
          {children}
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <BottomNav />
    </div>
  )
}
