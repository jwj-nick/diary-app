import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'

const HomePage = lazy(() =>
  import('@/pages/HomePage').then((m) => ({ default: m.HomePage }))
)
const WritePage = lazy(() =>
  import('@/pages/WritePage').then((m) => ({ default: m.WritePage }))
)
const CalendarPage = lazy(() =>
  import('@/pages/CalendarPage').then((m) => ({ default: m.CalendarPage }))
)

function PageLoading() {
  return (
    <div className="flex items-center justify-center h-40 text-zinc-400 text-sm">
      불러오는 중...
    </div>
  )
}

function App() {
  return (
    <AppShell>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/write" element={<WritePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
        </Routes>
      </Suspense>
    </AppShell>
  )
}

export default App
