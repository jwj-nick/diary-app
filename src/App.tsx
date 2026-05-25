import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/pages/LoginPage'
import { useAuthStore } from '@/store/auth.store'

const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })))
const WritePage = lazy(() => import('@/pages/WritePage').then((m) => ({ default: m.WritePage })))
const CalendarPage = lazy(() => import('@/pages/CalendarPage').then((m) => ({ default: m.CalendarPage })))
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const AdminPage = lazy(() => import('@/pages/AdminPage').then((m) => ({ default: m.AdminPage })))

function PageLoading() {
  return (
    <div className="flex items-center justify-center h-40 text-zinc-400 text-sm">
      불러오는 중...
    </div>
  )
}

function AuthLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center gap-3">
      <div className="text-4xl">📓</div>
      <p className="text-sm text-zinc-400">잠깐만요...</p>
    </div>
  )
}

function PrivateRoutes() {
  const { user, authLoading } = useAuthStore()
  if (authLoading) return <AuthLoading />
  if (!user) return <Navigate to="/login" replace />

  return (
    <AppShell>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<Navigate to="/calendar" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/write" element={<WritePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/calendar" replace />} />
        </Routes>
      </Suspense>
    </AppShell>
  )
}

function App() {
  const { init } = useAuthStore()

  useEffect(() => {
    init()
  }, [init])

  return (
    <Routes>
      <Route path="/login" element={<LoginPublic />} />
      <Route path="/*" element={<PrivateRoutes />} />
    </Routes>
  )
}

function LoginPublic() {
  const { user, authLoading } = useAuthStore()
  if (authLoading) return <AuthLoading />
  if (user) return <Navigate to="/calendar" replace />
  return <LoginPage />
}

export default App
