export interface Profile {
  id: string
  name: string
  role: 'admin' | 'user'
  grade: 'adult' | 'high' | 'mid' | null
  avatar_emoji: string
  created_at: string
}

export type ViewMode = 'personal' | 'admin'
