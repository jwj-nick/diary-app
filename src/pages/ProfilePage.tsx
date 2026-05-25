import { useNavigate } from 'react-router-dom'
import { LogOut, ShieldCheck, User } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useDiaryStore } from '@/store/diary.store'
import { cn } from '@/lib/utils'
import { format, startOfMonth, endOfMonth } from 'date-fns'

const AVATARS = ['🙂', '😎', '🧑', '👧', '👦', '👨', '👩', '🦁', '🐯', '🐼', '🐸', '🌟', '🚀', '📚', '⚡']

export function ProfilePage() {
  const navigate = useNavigate()
  const { profile, viewMode, setViewMode, signOut, updateAvatar } = useAuthStore()
  const { entries } = useDiaryStore()

  const active = entries.filter((e) => !e.deletedAt)
  const now = new Date()
  const thisMonthStart = format(startOfMonth(now), 'yyyy-MM-dd')
  const thisMonthEnd = format(endOfMonth(now), 'yyyy-MM-dd')
  const thisMonth = active.filter((e) => e.date >= thisMonthStart && e.date <= thisMonthEnd)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="max-w-md mx-auto space-y-4 pb-4">
      <h1 className="text-lg font-bold text-zinc-900">내 정보</h1>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-5">
        <div className="flex items-center gap-4">
          <div className="text-5xl">{profile?.avatar_emoji ?? '🙂'}</div>
          <div>
            <p className="text-xl font-bold text-zinc-900">{profile?.name ?? '...'}</p>
            <span className={cn(
              'inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-1',
              profile?.role === 'admin'
                ? 'bg-violet-100 text-violet-700'
                : 'bg-zinc-100 text-zinc-600'
            )}>
              {profile?.role === 'admin' ? '👑 관리자' : profile?.grade === 'high' ? '고등학생' : profile?.grade === 'mid' ? '중학생' : '사용자'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-zinc-200 p-4 text-center">
          <p className="text-3xl font-bold text-zinc-900">{active.length}</p>
          <p className="text-xs text-zinc-500 mt-1">전체 항목</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-200 p-4 text-center">
          <p className="text-3xl font-bold text-zinc-900">{thisMonth.length}</p>
          <p className="text-xs text-zinc-500 mt-1">이번 달</p>
        </div>
      </div>

      {/* Avatar picker */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4">
        <p className="text-sm font-semibold text-zinc-700 mb-3">아바타 변경</p>
        <div className="flex flex-wrap gap-2">
          {AVATARS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => updateAvatar(emoji)}
              className={cn(
                'text-2xl w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                profile?.avatar_emoji === emoji
                  ? 'bg-zinc-900 scale-110'
                  : 'bg-zinc-50 hover:bg-zinc-100'
              )}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Admin mode toggle */}
      {profile?.role === 'admin' && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-4">
          <p className="text-sm font-semibold text-zinc-700 mb-3 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-violet-500" />관리자 기능
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-700">관리자 모드</p>
              <p className="text-xs text-zinc-400">ON: 가족 전체 항목 보기</p>
            </div>
            <button
              onClick={() => setViewMode(viewMode === 'admin' ? 'personal' : 'admin')}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                viewMode === 'admin' ? 'bg-violet-600' : 'bg-zinc-200'
              )}
            >
              <span className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow',
                viewMode === 'admin' ? 'translate-x-6' : 'translate-x-1'
              )} />
            </button>
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="mt-3 w-full text-sm text-violet-600 hover:text-violet-700 font-medium text-left"
          >
            관리자 대시보드 →
          </button>
        </div>
      )}

      {/* Account */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 space-y-1">
        <p className="text-sm font-semibold text-zinc-700 mb-2 flex items-center gap-2">
          <User className="h-4 w-4" />계정
        </p>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          로그아웃
        </button>
      </div>
    </div>
  )
}
