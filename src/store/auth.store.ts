import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile, ViewMode } from '@/types/auth'

interface AuthState {
  user: User | null
  profile: Profile | null
  allProfiles: Profile[]
  viewMode: ViewMode
  viewAsUserId: string | null
  authLoading: boolean
  init: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  setViewMode: (mode: ViewMode) => void
  setViewAsUser: (userId: string | null) => void
  updateAvatar: (emoji: string) => Promise<void>
  updateProfile: (name: string, grade: string | null) => Promise<{ error?: string }>
  updatePassword: (newPassword: string) => Promise<{ error?: string }>
  updateUserProfile: (userId: string, data: { name?: string; grade?: string | null; avatar_emoji?: string }) => Promise<void>
  fetchAllProfiles: () => Promise<void>
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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  allProfiles: [],
  viewMode: 'personal',
  viewAsUserId: null,
  authLoading: true,

  init: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const profile = await fetchProfile(session.user.id)
      set({ user: session.user, profile, authLoading: false })
      if (profile?.role === 'admin') {
        get().fetchAllProfiles()
      }
    } else {
      set({ authLoading: false })
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        set({ user: session.user, profile })
        if (profile?.role === 'admin') {
          get().fetchAllProfiles()
        }
      } else {
        set({ user: null, profile: null, viewMode: 'personal', viewAsUserId: null, allProfiles: [] })
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
    set({ user: null, profile: null, viewMode: 'personal', viewAsUserId: null, allProfiles: [] })
  },

  setViewMode: (mode) => set({ viewMode: mode }),
  setViewAsUser: (userId) => set({ viewAsUserId: userId }),

  fetchAllProfiles: async () => {
    const { data } = await supabase.from('profiles').select('*')
    if (data) set({ allProfiles: data as unknown as Profile[] })
  },

  updateAvatar: async (emoji) => {
    const { user, profile } = get()
    if (!user || !profile) return
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_emoji: emoji })
      .eq('id', user.id)
    if (!error) set({ profile: { ...profile, avatar_emoji: emoji } })
  },

  updateProfile: async (name, grade) => {
    const { user, profile } = get()
    if (!user || !profile) return { error: '로그인 필요' }
    const { error } = await supabase
      .from('profiles')
      .update({ name, grade })
      .eq('id', user.id)
    if (error) return { error: error.message }
    set({ profile: { ...profile, name, grade: grade as Profile['grade'] } })
    return {}
  },

  updatePassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) return { error: error.message }
    return {}
  },

  updateUserProfile: async (userId, data) => {
    const { allProfiles } = get()
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId)
    if (!error) {
      set({
        allProfiles: allProfiles.map((p) =>
          p.id === userId ? { ...p, ...data } as Profile : p
        ),
      })
    }
  },
}))
