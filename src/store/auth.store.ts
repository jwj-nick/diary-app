import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile, ViewMode } from '@/types/auth'

interface AuthState {
  user: User | null
  profile: Profile | null
  viewMode: ViewMode
  authLoading: boolean
  init: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  setViewMode: (mode: ViewMode) => void
  updateAvatar: (emoji: string) => Promise<void>
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) {
    console.warn('[auth] profile fetch failed:', error.message)
    return null
  }
  return data as Profile | null
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  viewMode: 'personal',
  authLoading: true,

  init: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const profile = await fetchProfile(session.user.id)
      set({ user: session.user, profile, authLoading: false })
    } else {
      set({ authLoading: false })
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        set({ user: session.user, profile })
      } else {
        set({ user: null, profile: null, viewMode: 'personal' })
      }
    })
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return {}
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null, viewMode: 'personal' })
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  updateAvatar: async (emoji) => {
    const { user, profile } = useAuthStore.getState()
    if (!user || !profile) return
    await supabase.from('profiles').update({ avatar_emoji: emoji }).eq('id', user.id)
    set({ profile: { ...profile, avatar_emoji: emoji } })
  },
}))
