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
    console.log('[auth] init called — build v4')

    // Safety: never leave user stuck on the spinner forever, no matter what
    setTimeout(() => {
      if (get().authLoading) {
        console.warn('[auth] SAFETY TIMEOUT — forcing authLoading=false after 5s')
        set({ authLoading: false })
      }
    }, 5000)

    // Avoid Supabase auth-lock deadlock by deferring queries with setTimeout(0).
    // ref: https://github.com/supabase/auth-js/issues/762
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('[auth] event:', event, 'uid:', session?.user?.id)
      if (session?.user) {
        const user = session.user
        setTimeout(async () => {
          // DIAGNOSTIC: confirm what the DB sees as auth.uid() for this request
          try {
            const { data: who, error: whoErr } = await supabase.rpc('whoami')
            console.log('[auth] whoami →', JSON.stringify(who), 'err:', whoErr?.message ?? null)
          } catch (e) {
            console.log('[auth] whoami threw:', e)
          }

          console.log('[auth] deferred fetchProfile starting')
          fetchProfile(user.id)
            .then((profile) => {
              console.log('[auth] profile loaded:', profile?.name, 'role:', profile?.role)
              set({ user, profile, authLoading: false })
              if (profile?.role === 'admin') get().fetchAllProfiles()
            })
            .catch((err) => {
              console.error('[auth] profile fetch threw:', err)
              set({ user, profile: null, authLoading: false })
            })
        }, 0)
      } else {
        set({ user: null, profile: null, authLoading: false, viewMode: 'personal', viewAsUserId: null, allProfiles: [] })
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
