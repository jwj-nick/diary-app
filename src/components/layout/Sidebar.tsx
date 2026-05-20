import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Collapsible from '@radix-ui/react-collapsible'
import { ChevronDown, ChevronRight, Calendar, Download, PenLine, X, Target, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { useDiaryStore } from '@/store/diary.store'
import type { DiaryEntry, EntryType } from '@/types/diary'
import { getEntryShortTitle } from '@/types/diary'
import { exportToJSON } from '@/lib/export'
import { cn } from '@/lib/utils'

interface Props {
  onClose?: () => void
}

function TypeDot({ type }: { type: EntryType }) {
  return (
    <span
      className={cn(
        'inline-block w-2 h-2 rounded-full flex-shrink-0',
        type === 'study' && 'bg-blue-500',
        type === 'reading' && 'bg-emerald-500',
        type === 'free' && 'bg-amber-500',
        type === 'goal' && 'bg-violet-500',
        type === 'exam' && 'bg-rose-500'
      )}
    />
  )
}

export function Sidebar({ onClose }: Props) {
  const navigate = useNavigate()
  const { entries, filterType, setFilterType } = useDiaryStore()
  const [libraryOpen, setLibraryOpen] = useState(true)
  const [planningOpen, setPlanningOpen] = useState(true)

  const active = entries.filter((e) => !e.deletedAt)
  const trashed = entries.filter((e) => !!e.deletedAt)
  const studyCount = active.filter((e) => e.type === 'study').length
  const readingCount = active.filter((e) => e.type === 'reading').length
  const freeCount = active.filter((e) => e.type === 'free').length
  const goalCount = active.filter((e) => e.type === 'goal').length
  const examCount = active.filter((e) => e.type === 'exam').length
  const journalCount = studyCount + readingCount + freeCount
  const planningCount = goalCount + examCount

  const recentEntries = [...active]
    .filter((e) => e.type !== 'goal' && e.type !== 'exam')
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)

  const handleFilterClick = (type: typeof filterType) => {
    setFilterType(type)
    navigate('/')
    onClose?.()
  }

  const handleNavClick = (path: string) => {
    navigate(path)
    onClose?.()
  }

  return (
    <div className="flex flex-col h-full w-64 bg-white border-r border-zinc-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <span className="text-xl">📓</span>
          <span className="font-semibold text-zinc-800">내 일기장</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded hover:bg-zinc-100 text-zinc-500">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* New Entry Button */}
      <div className="px-3 py-3">
        <button
          onClick={() => handleNavClick('/write')}
          className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-zinc-700 transition-colors"
        >
          <PenLine className="h-4 w-4" />
          새 일기 작성
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {/* All */}
        <button
          onClick={() => handleFilterClick('all')}
          className={cn(
            'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
            filterType === 'all'
              ? 'bg-zinc-100 text-zinc-900 font-medium'
              : 'hover:bg-zinc-50 text-zinc-700'
          )}
        >
          <span className="text-sm">📋</span>
          <span>모든 일기</span>
          <span className="ml-auto text-xs text-zinc-400">{active.length}</span>
        </button>

        {/* Library Section */}
        <div className="mt-3 mb-1 px-2">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
            Library
          </span>
        </div>

        <Collapsible.Root open={libraryOpen} onOpenChange={setLibraryOpen}>
          <Collapsible.Trigger asChild>
            <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-zinc-50 text-zinc-700">
              {libraryOpen ? (
                <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
              )}
              <span>일기</span>
              <span className="ml-auto text-xs text-zinc-400">{journalCount}</span>
            </button>
          </Collapsible.Trigger>
          <Collapsible.Content>
            <div className="ml-4 mt-0.5 space-y-0.5">
              {([
                { type: 'study', label: '공부 일기', count: studyCount },
                { type: 'reading', label: '독서 일기', count: readingCount },
                { type: 'free', label: '자유 일기', count: freeCount },
              ] as const).map(({ type, label, count }) => (
                <button
                  key={type}
                  onClick={() => handleFilterClick(type)}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
                    filterType === type
                      ? 'bg-zinc-100 text-zinc-900 font-medium'
                      : 'hover:bg-zinc-50 text-zinc-600'
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
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
            Planning
          </span>
        </div>

        <Collapsible.Root open={planningOpen} onOpenChange={setPlanningOpen}>
          <Collapsible.Trigger asChild>
            <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-zinc-50 text-zinc-700">
              {planningOpen ? (
                <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
              )}
              <span>목표 & 시험</span>
              <span className="ml-auto text-xs text-zinc-400">{planningCount}</span>
            </button>
          </Collapsible.Trigger>
          <Collapsible.Content>
            <div className="ml-4 mt-0.5 space-y-0.5">
              <button
                onClick={() => handleFilterClick('goal')}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
                  filterType === 'goal'
                    ? 'bg-zinc-100 text-zinc-900 font-medium'
                    : 'hover:bg-zinc-50 text-zinc-600'
                )}
              >
                <Target className="h-3 w-3 text-violet-500" />
                <span>공부 목표</span>
                <span className="ml-auto text-xs text-zinc-400">{goalCount}</span>
              </button>
              <button
                onClick={() => handleFilterClick('exam')}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
                  filterType === 'exam'
                    ? 'bg-zinc-100 text-zinc-900 font-medium'
                    : 'hover:bg-zinc-50 text-zinc-600'
                )}
              >
                <FileText className="h-3 w-3 text-rose-500" />
                <span>시험 / 수행평가</span>
                <span className="ml-auto text-xs text-zinc-400">{examCount}</span>
              </button>
            </div>
          </Collapsible.Content>
        </Collapsible.Root>

        {/* Trash */}
        <button
          onClick={() => handleFilterClick('trash')}
          className={cn(
            'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors mt-3',
            filterType === 'trash'
              ? 'bg-zinc-100 text-zinc-900 font-medium'
              : 'hover:bg-zinc-50 text-zinc-600'
          )}
        >
          <span className="text-base">🗑️</span>
          <span>삭제됨</span>
          <span className="ml-auto text-xs text-zinc-400">{trashed.length}</span>
        </button>

        {/* Recent Section */}
        {recentEntries.length > 0 && (
          <div className="mt-4">
            <div className="px-2 mb-1">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
                최근 일기
              </span>
            </div>
            <div className="space-y-0.5">
              {recentEntries.map((entry: DiaryEntry) => (
                <button
                  key={entry.id}
                  onClick={() => handleNavClick('/')}
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

      {/* Bottom actions */}
      <div className="border-t border-zinc-100 px-2 py-2 space-y-0.5">
        <button
          onClick={() => handleNavClick('/calendar')}
          className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm hover:bg-zinc-50 text-zinc-600 transition-colors"
        >
          <Calendar className="h-4 w-4" />
          캘린더
        </button>
        <button
          onClick={() => exportToJSON()}
          className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm hover:bg-zinc-50 text-zinc-600 transition-colors"
        >
          <Download className="h-4 w-4" />
          내보내기
        </button>
      </div>
    </div>
  )
}
