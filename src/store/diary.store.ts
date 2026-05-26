import { create } from 'zustand'
import { toast } from 'sonner'
import type { DiaryEntry, EntryType } from '@/types/diary'
import { getAllEntries, saveEntry, deleteEntry } from '@/lib/storage'
import { useAuthStore } from './auth.store'

const TYPE_KOREAN: Record<EntryType, string> = {
  study: '공부 일기',
  reading: '독서 일기',
  free: '자유 일기',
  goal: '목표',
  exam: '시험',
  schedule: '일정',
  todo: '할일',
  anniversary: '기념일',
}

type FilterType = EntryType | 'all' | 'trash' | 'planning' | 'family'

interface DiaryState {
  entries: DiaryEntry[]
  loading: boolean
  filterType: FilterType
  searchQuery: string
  loadEntries: () => Promise<void>
  addEntry: (entry: DiaryEntry) => Promise<void>
  updateEntry: (entry: DiaryEntry) => Promise<void>
  softDelete: (id: string) => Promise<void>
  restore: (id: string) => Promise<void>
  permanentDelete: (id: string) => Promise<void>
  toggleStep: (entryId: string, stepId: string) => Promise<void>
  setFilterType: (type: FilterType) => void
  setSearchQuery: (q: string) => void
}

function getAuth() {
  const { user, profile, viewMode, viewAsUserId } = useAuthStore.getState()
  const myUserId = user?.id ?? ''
  const isAdmin = profile?.role === 'admin'
  const viewAll = isAdmin && viewMode === 'admin' && !viewAsUserId
  const userId = isAdmin && viewAsUserId ? viewAsUserId : myUserId
  return { userId, viewAll }
}

export const useDiaryStore = create<DiaryState>((set, get) => ({
  entries: [],
  loading: false,
  filterType: 'all',
  searchQuery: '',

  loadEntries: async () => {
    const { userId, viewAll } = getAuth()
    if (!userId) return
    set({ loading: true })
    const entries = await getAllEntries(userId, viewAll)
    set({ entries, loading: false })
  },

  addEntry: async (entry: DiaryEntry) => {
    const { userId } = getAuth()
    if (!userId) return
    try {
      await saveEntry(entry, userId)
      set((state) => ({ entries: [entry, ...state.entries] }))
      toast.success(`${TYPE_KOREAN[entry.type]} 저장됨`)
    } catch (err) {
      toast.error('저장 실패', { description: err instanceof Error ? err.message : String(err) })
      throw err
    }
  },

  updateEntry: async (entry: DiaryEntry) => {
    const { userId } = getAuth()
    if (!userId) return
    try {
      await saveEntry(entry, userId)
      set((state) => ({
        entries: state.entries.map((e) => (e.id === entry.id ? entry : e)),
      }))
      toast.success(`${TYPE_KOREAN[entry.type]} 수정됨`)
    } catch (err) {
      toast.error('수정 실패', { description: err instanceof Error ? err.message : String(err) })
      throw err
    }
  },

  softDelete: async (id: string) => {
    const entry = get().entries.find((e) => e.id === id)
    if (!entry) return
    const { userId } = getAuth()
    if (!userId) return
    const updated: DiaryEntry = { ...entry, deletedAt: new Date().toISOString() }
    try {
      await saveEntry(updated, userId)
      set((state) => ({
        entries: state.entries.map((e) => (e.id === id ? updated : e)),
      }))
      toast('삭제됨', {
        description: '휴지통에서 복원할 수 있어요',
        action: { label: '복원', onClick: () => get().restore(id) },
      })
    } catch (err) {
      toast.error('삭제 실패', { description: err instanceof Error ? err.message : String(err) })
    }
  },

  restore: async (id: string) => {
    const entry = get().entries.find((e) => e.id === id)
    if (!entry) return
    const { userId } = getAuth()
    if (!userId) return
    const updated: DiaryEntry = { ...entry }
    delete updated.deletedAt
    try {
      await saveEntry(updated, userId)
      set((state) => ({
        entries: state.entries.map((e) => (e.id === id ? updated : e)),
      }))
      toast.success('복원됨')
    } catch (err) {
      toast.error('복원 실패', { description: err instanceof Error ? err.message : String(err) })
    }
  },

  permanentDelete: async (id: string) => {
    try {
      await deleteEntry(id)
      set((state) => ({
        entries: state.entries.filter((e) => e.id !== id),
      }))
      toast.success('영구 삭제됨')
    } catch (err) {
      toast.error('삭제 실패', { description: err instanceof Error ? err.message : String(err) })
    }
  },

  toggleStep: async (entryId: string, stepId: string) => {
    const entry = get().entries.find((e) => e.id === entryId)
    if (!entry) return
    const { userId } = getAuth()
    if (!userId) return
    const now = new Date().toISOString()
    let updated: DiaryEntry | null = null

    if (entry.type === 'goal') {
      const steps = entry.steps.map((s) =>
        s.id === stepId ? { ...s, done: !s.done, doneAt: !s.done ? now : undefined } : s
      )
      const allDone = steps.length > 0 && steps.every((s) => s.done)
      updated = {
        ...entry, steps,
        status: allDone ? 'completed' : 'in_progress',
        completedAt: allDone ? now : undefined,
        updatedAt: now,
      }
    } else if (entry.type === 'exam') {
      const prepSteps = entry.prepSteps.map((s) =>
        s.id === stepId ? { ...s, done: !s.done, doneAt: !s.done ? now : undefined } : s
      )
      updated = { ...entry, prepSteps, updatedAt: now }
    } else if (entry.type === 'todo') {
      const items = entry.items.map((item) =>
        item.id === stepId ? { ...item, done: !item.done, doneAt: !item.done ? now : undefined } : item
      )
      const allDone = items.length > 0 && items.every((i) => i.done)
      updated = {
        ...entry, items,
        completedAt: allDone ? now : undefined,
        updatedAt: now,
      }
    }

    if (!updated) return
    await saveEntry(updated, userId)
    const finalUpdated = updated
    set((state) => ({
      entries: state.entries.map((e) => (e.id === entryId ? finalUpdated : e)),
    }))
  },

  setFilterType: (type: FilterType) => set({ filterType: type }),
  setSearchQuery: (q: string) => set({ searchQuery: q }),
}))
