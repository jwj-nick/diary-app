import { getAllEntries } from './storage'
import { useAuthStore } from '@/store/auth.store'

export async function exportToJSON(): Promise<void> {
  const { user, profile, viewMode } = useAuthStore.getState()
  if (!user) return
  const viewAll = profile?.role === 'admin' && viewMode === 'admin'
  const entries = await getAllEntries(user.id, viewAll)
  const json = JSON.stringify(entries, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `diary-export-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
