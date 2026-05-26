import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { ViewAsBanner } from './ViewAsBanner'

interface Props {
  children: React.ReactNode
}

export function AppShell({ children }: Props) {
  const { pathname } = useLocation()
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 overflow-y-auto z-30">
        <Sidebar />
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen overflow-y-auto bg-background">
        <ViewAsBanner />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="flex-1 p-4 md:p-6 pb-24 md:pb-6"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile bottom navigation */}
      <BottomNav />
    </div>
  )
}
