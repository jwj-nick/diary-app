import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Collapsible from '@radix-ui/react-collapsible'
import {
  ChevronDown, ChevronRight, Calendar, Download, PenLine,
  Target, FileText, CalendarClock, CheckSquare, LogOut, ShieldCheck, User,
} from 'lucide-react'
import { format } from 'date-fns'
import { useDiaryStore } from '@/store/diary.store'
import { useAuthStore } from '@/store/auth.store'
import type { DiaryEntry, EntryType } from '@/types/diary'
import { getEntryShortTitle } from '@/types/diary'
import { exportToJSON } from '@/lib/export'
import { cn } from '@/lib/utils'

interface Props {
  onClose?: () => void
}

function TypeDot({ type }: { type: EntryType }) {
  const colors: Record<EntryType, string> = {
    study: 'bg-blue-500',
    reading: 'bg-emerald-500',
    free: 'bg-amber-500',
    goal: 'bg-violet-500',
    exam: 'bg-rose-500',
    schedule: 'bg-sky-500',
    todo: 'bg-orange-500',
  }
  return <span className={cn('inline-block w-2 h-2 rounded-full flex-shrink-0', colors[type])} />
}

export function Sidebar({ onClose }: Props) {
  const navigate = useNavigate()
  const { entries, filterType, setFilterType } = useDiaryStore()
  const { profile, viewMode, viewAsUserId, setViewMode, signOut } = useAuthStore()
  const canWrite = !viewAsUserId
  const [libraryOpen, setLibraryOpen] = useState(true)
  const [planningOpen, setPlanningOpen] = useState(true)

  const active = entries.filter((e) => !e.deletedAt)
  const trashed = entries.filter((e) => !!e.deletedAt)

  const counts = {
    study: active.filter((e) => e.type === 'study').length,
    reading: active.filter((e) => e.type === 'reading').length,
    free: active.filter((e) => e.type === 'free').length,
    goal: active.filter((e) => e.type === 'goal').length,
    exam: active.filter((e) => e.type === 'exam').length,
    schedule: active.filter((e) => e.type === 'schedule').length,
    todo: active.filter((e) => e.type === 'todo').length,
  }
  const journalCount = counts.study + counts.reading + counts.free
  const planningCount = counts.goal + counts.exam + counts.schedule + counts.todo

  const recentEntries = [...active]
    .filter((e) => e.type !== 'goal' && e.type !== 'exam')
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)

  const handleFilterClick = (type: typeof filterType) => {
    setFilterType(type)
    navigate('/home')
    onClose?.()
  }

  const handleNavClick = (path: string) => {
    navigate(path)
    onClose?.()
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex flex-col h-full w-64 bg-white border-r border-zinc-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <span className="text-xl">📓</span>
          <span className="font-semibold text-zinc-800">가족 일기장</span>
        </div>
      </div>

      {/* New Entry Button */}
      <div className="px-3 py-3">
        <button
          onClick={() => canWrite && handleNavClick('/write')}
          disabled={!canWrite}
          title={canWrite ? '' : '조회 전용 모드에서는 작성할 수 없습니다'}
          className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-zinc-700 transition-colors disabled:bg-zinc-300 disabled:cursor-not-allowed"
        >
          <PenLine className="h-4 w-4" />
          새 항목 작성
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        <button
          onClick={() => handleFilterClick('all')}
          className={cn(
            'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
            filterType === 'all' ? 'bg-zinc-100 text-zinc-900 font-medium' : 'hover:bg-zinc-50 text-zinc-700'
          )}
        >
          <span className="text-sm">📋</span>
          <span>모든 항목</span>
          <span className="ml-auto text-xs text-zinc-400">{active.length}</span>
        </button>

        {/* Library Section */}
        <div className="mt-3 mb-1 px-2">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Library</span>
        </div>

        <Collapsible.Root open={libraryOpen} onOpenChange={setLibraryOpen}>
          <Collapsible.Trigger asChild>
            <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-zinc-50 text-zinc-700">
              {libraryOpen ? <ChevronDown className="h-3.5 w-3.5 text-zinc-400" /> : <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />}
              <span>일기</span>
              <span className="ml-auto text-xs text-zinc-400">{journalCount}</span>
            </button>
          </Collapsible.Trigger>
          <Collapsible.Content>
            <div className="ml-4 mt-0.5 space-y-0.5">
              {([
                { type: 'study', label: '공부 일기', count: counts.study },
                { type: 'reading', label: '독서 일기', count: counts.reading },
                { type: 'free', label: '자유 일기', count: counts.free },
              ] as const).map(({ type, label, count }) => (
                <button
                  key={type}
                  onClick={() => handleFilterClick(type)}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
                    filterType === type ? 'bg-zinc-100 text-zinc-900 font-medium' : 'hover:bg-zinc-50 text-zinc-600'
                  )}
                >
                  <TypeDot type={type} />
                  <span>{label}</span>
                  <span className="ml-auto text-xs text-zinc-400">{count}</span>
                </button>
              ))}
            </div>
          </Collapsible.Content>
        </Collapsible.Root>

        {/* Planning Section */}
        <div className="mt-3 mb-1 px-2">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Planning</span>
        </div>

        <Collapsible.Root open={planningOpen} onOpenChange={setPlanningOpen}>
          <Collapsible.Trigger asChild>
            <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-zinc-50 text-zinc-700">
              {planningOpen ? <ChevronDown className="h-3.5 w-3.5 text-zinc-400" /> : <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />}
              <span>목표 & 일정</span>
              <span className="ml-auto text-xs text-zinc-400">{planningCount}</span>
            </button>
          </Collapsible.Trigger>
          <Collapsible.Content>
            <div className="ml-4 mt-0.5 space-y-0.5">
              {([
                { type: 'goal', label: '목표', icon: Target, color: 'text-violet-500', count: counts.goal },
                { type: 'exam', label: '시험 / 수행평가', icon: FileText, color: 'text-rose-500', count: counts.exam },
                { type: 'schedule', label: '일정 / 약속', icon: CalendarClock, color: 'text-sky-500', count: counts.schedule },
                { type: 'todo', label: '할일', icon: CheckSquare, color: 'text-orange-500', count: counts.todo },
              ] as const).map(({ type, label, icon: Icon, color, count }) => (
                <button
                  key={type}
                  onClick={() => handleFilterClick(type)}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
                    filterType === type ? 'bg-zinc-100 text-zinc-900 font-medium' : 'hover:bg-zinc-50 text-zinc-600'
                  )}
                >
                  <Icon className={cn('h-3 w-3', color)} />
                  <span>{label}</span>
                  <span className="ml-auto text-xs text-zinc-400">{count}</span>
                </button>
              ))}
            </div>
          </Collapsible.Content>
        </Collapsible.Root>

        {/* Trash */}
        <button
          onClick={() => handleFilterClick('trash')}
          className={cn(
            'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors mt-3',
            filterType === 'trash' ? 'bg-zinc-100 text-zinc-900 font-medium' : 'hover:bg-zinc-50 text-zinc-600'
          )}
        >
          <span className="text-base">🗑️</span>
          <span>삭제됨</span>
          <span className="ml-auto text-xs text-zinc-400">{trashed.length}</span>
        </button>

        {/* Recent */}
        {recentEntries.length > 0 && (
          <div className="mt-4">
            <div className="px-2 mb-1">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">최근</span>
            </div>
            <div className="space-y-0.5">
              {recentEntries.map((entry: DiaryEntry) => (
                <button
                  key={entry.id}
                  onClick={() => handleNavClick('/home')}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-zinc-50 text-left"
                >
                  <TypeDot type={entry.type} />
                  <span className="text-xs text-zinc-400 flex-shrink-0">
                    {format(new Date(entry.date), 'MM/dd')}
                  </span>
                  <span className="text-zinc-700 truncate text-xs">{getEntryShortTitle(entry)}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom: nav + user */}
      <div className="border-t border-zinc-100 px-2 py-2 space-y-0.5">
        <button
          onClick={() => handleNavClick('/calendar')}
          className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm hover:bg-zinc-50 text-zinc-600 transition-colors"
        >
          <Calendar className="h-4 w-4" />캘린더
        </button>
        <button
          onClick={() => exportToJSON()}
          className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm hover:bg-zinc-50 text-zinc-600 transition-colors"
        >
          <Download className="h-4 w-4" />내보내기
        </button>

        {/* Admin mode toggle */}
        {profile?.role === 'admin' && (
          <button
            onClick={() => setViewMode(viewMode === 'admin' ? 'personal' : 'admin')}
            className={cn(
              'w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors',
              viewMode === 'admin'
                ? 'bg-violet-50 text-violet-700 font-medium'
                : 'hover:bg-zinc-50 text-zinc-600'
            )}
          >
            <ShieldCheck className="h-4 w-4" />
            {viewMode === 'admin' ? '관리자 모드 ON' : '관리자 모드'}
          </button>
        )}

        {/* User info + logout */}
        <div className="flex items-center gap-2 px-2 py-2 mt-1 border-t border-zinc-100 pt-2">
          <span className="text-lg">{profile?.avatar_emoji ?? '🙂'}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-800 truncate">{profile?.name ?? '...'}</p>
            <p className="text-[10px] text-zinc-400">
              {profile?.role === 'admin' ? '관리자' : '사용자'}
            </p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => handleNavClick('/profile')}
              className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-400"
              title="내 정보"
            >
              <User className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-400"
              title="로그아웃"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
