import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, differenceInCalendarDays } from 'date-fns'
import { Trash2, RotateCcw, X, Target, FileText } from 'lucide-react'
import { useDiaryStore } from '@/store/diary.store'
import type { DiaryEntry, EntryType } from '@/types/diary'
import { getEntryShortTitle } from '@/types/diary'
import { cn } from '@/lib/utils'

const TYPE_LABEL: Record<EntryType, string> = {
  study: '공부',
  reading: '독서',
  free: '자유',
  goal: '목표',
  exam: '시험',
}

const TYPE_BADGE: Record<EntryType, string> = {
  study: 'bg-blue-100 text-blue-700',
  reading: 'bg-emerald-100 text-emerald-700',
  free: 'bg-amber-100 text-amber-700',
  goal: 'bg-violet-100 text-violet-700',
  exam: 'bg-rose-100 text-rose-700',
}

function TypeBadge({ type }: { type: EntryType }) {
  return (
    <span className={cn('inline-block text-xs font-medium px-2 py-0.5 rounded-full', TYPE_BADGE[type])}>
      {TYPE_LABEL[type]}
    </span>
  )
}

function EntryCard({ entry, isTrash }: { entry: DiaryEntry; isTrash: boolean }) {
  const { softDelete, restore, permanentDelete, toggleStep } = useDiaryStore()
  const title = getEntryShortTitle(entry)

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <TypeBadge type={entry.type} />
            <span className="text-xs text-zinc-400">
              {entry.type === 'goal'
                ? `목표 ~${format(new Date(entry.targetDate), 'M/d')}`
                : entry.type === 'exam'
                ? `시험 ${format(new Date(entry.examDate), 'M/d')}`
                : format(new Date(entry.date), 'yyyy년 M월 d일')}
            </span>
            {entry.type === 'study' && (
              <span className="text-xs text-zinc-400">{entry.durationMinutes}분</span>
            )}
            {entry.type === 'reading' && entry.rating && (
              <span className="text-xs text-amber-500">{'★'.repeat(entry.rating)}</span>
            )}
            {(entry.type === 'goal' || entry.type === 'exam') && (
              <CountdownBadge date={entry.type === 'goal' ? entry.targetDate : entry.examDate} />
            )}
          </div>
          <h3 className="font-medium text-zinc-900 text-sm truncate mb-1">
            {entry.type === 'goal' && <Target className="inline h-3.5 w-3.5 mr-1 -mt-0.5 text-violet-500" />}
            {entry.type === 'exam' && <FileText className="inline h-3.5 w-3.5 mr-1 -mt-0.5 text-rose-500" />}
            {title}
          </h3>

          {/* Type-specific body */}
          {entry.type === 'study' && entry.note && (
            <p className="text-xs text-zinc-500 line-clamp-2">{entry.note}</p>
          )}
          {entry.type === 'reading' && (entry.thought || entry.quote) && (
            <p className="text-xs text-zinc-500 line-clamp-2">{entry.thought || entry.quote}</p>
          )}
          {entry.type === 'free' && entry.body && (
            <p className="text-xs text-zinc-500 line-clamp-2 whitespace-pre-wrap">
              {entry.body.slice(0, 200)}
            </p>
          )}
          {entry.type === 'goal' && (
            <div className="mt-2 space-y-1.5">
              {entry.description && <p className="text-xs text-zinc-500">{entry.description}</p>}
              {entry.steps.length > 0 && (
                <>
                  <ProgressBar
                    done={entry.steps.filter((s) => s.done).length}
                    total={entry.steps.length}
                    color="violet"
                  />
                  <ul className="space-y-0.5 mt-1">
                    {entry.steps.map((s) => (
                      <li key={s.id}>
                        <label className="flex items-center gap-2 text-xs text-zinc-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={s.done}
                            onChange={() => toggleStep(entry.id, s.id)}
                            className="rounded text-violet-600 focus:ring-violet-500"
                          />
                          <span className={cn(s.done && 'line-through text-zinc-400')}>{s.text}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
          {entry.type === 'exam' && (
            <div className="mt-2 space-y-1.5">
              {entry.scope && <p className="text-xs text-zinc-500">{entry.scope}</p>}
              {entry.prepSteps.length > 0 && (
                <>
                  <ProgressBar
                    done={entry.prepSteps.filter((s) => s.done).length}
                    total={entry.prepSteps.length}
                    color="rose"
                  />
                  <ul className="space-y-0.5 mt-1">
                    {entry.prepSteps.map((s) => (
                      <li key={s.id}>
                        <label className="flex items-center gap-2 text-xs text-zinc-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={s.done}
                            onChange={() => toggleStep(entry.id, s.id)}
                            className="rounded text-rose-600 focus:ring-rose-500"
                          />
                          <span className={cn(s.done && 'line-through text-zinc-400')}>{s.text}</span>
                          {s.dueDate && !s.done && (
                            <span className="text-[10px] text-zinc-400 ml-auto">
                              ~{format(new Date(s.dueDate), 'M/d')}
                            </span>
                          )}
                        </label>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-1 flex-shrink-0">
          {isTrash ? (
            <>
              <button
                onClick={() => restore(entry.id)}
                title="복원"
                className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => permanentDelete(entry.id)}
                title="영구 삭제"
                className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => softDelete(entry.id)}
              title="삭제"
              className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function CountdownBadge({ date }: { date: string }) {
  const days = differenceInCalendarDays(new Date(date), new Date())
  if (days < 0) return <span className="text-xs text-zinc-400">지남</span>
  if (days === 0) return <span className="text-xs font-medium text-rose-600">D-day</span>
  if (days <= 7) return <span className="text-xs font-medium text-amber-600">D-{days}</span>
  return <span className="text-xs text-zinc-500">D-{days}</span>
}

function ProgressBar({ done, total, color }: { done: number; total: number; color: 'violet' | 'rose' }) {
  const pct = total > 0 ? (done / total) * 100 : 0
  return (
    <div className="flex items-center gap-2 text-xs text-zinc-500">
      <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full', color === 'violet' ? 'bg-violet-500' : 'bg-rose-500')}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span>
        {done}/{total}
      </span>
    </div>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const { entries, loading, filterType, searchQuery, loadEntries, setSearchQuery } = useDiaryStore()

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  const displayed = useMemo(() => {
    const isTrash = filterType === 'trash'
    let list = isTrash ? entries.filter((e) => !!e.deletedAt) : entries.filter((e) => !e.deletedAt)

    if (!isTrash && filterType !== 'all') {
      if (filterType === 'planning') {
        list = list.filter((e) => e.type === 'goal' || e.type === 'exam')
      } else {
        list = list.filter((e) => e.type === (filterType as EntryType))
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter((e) => {
        if (e.type === 'study') return `${e.subject} ${e.topic} ${e.note ?? ''}`.toLowerCase().includes(q)
        if (e.type === 'reading')
          return `${e.bookTitle} ${e.author ?? ''} ${e.thought ?? ''} ${e.quote ?? ''}`.toLowerCase().includes(q)
        if (e.type === 'free') return `${e.title ?? ''} ${e.body}`.toLowerCase().includes(q)
        if (e.type === 'goal') return `${e.title} ${e.description ?? ''}`.toLowerCase().includes(q)
        if (e.type === 'exam') return `${e.title} ${e.subject} ${e.scope ?? ''}`.toLowerCase().includes(q)
        return false
      })
    }

    // Goals/Exams sort by their target/exam date (upcoming first), others by date desc
    return [...list].sort((a, b) => {
      const aIsPlan = a.type === 'goal' || a.type === 'exam'
      const bIsPlan = b.type === 'goal' || b.type === 'exam'
      if (aIsPlan && !bIsPlan) return -1
      if (!aIsPlan && bIsPlan) return 1
      if (aIsPlan && bIsPlan) {
        const aDate = a.type === 'goal' ? a.targetDate : a.examDate
        const bDate = b.type === 'goal' ? b.targetDate : b.examDate
        return aDate.localeCompare(bDate)
      }
      return b.date.localeCompare(a.date)
    })
  }, [entries, filterType, searchQuery])

  const isTrash = filterType === 'trash'

  const pageTitle =
    filterType === 'all'
      ? '모든 일기'
      : filterType === 'study'
      ? '공부 일기'
      : filterType === 'reading'
      ? '독서 일기'
      : filterType === 'free'
      ? '자유 일기'
      : filterType === 'goal'
      ? '공부 목표'
      : filterType === 'exam'
      ? '시험 / 수행평가'
      : filterType === 'planning'
      ? '목표 & 시험'
      : '삭제됨'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-zinc-400 text-sm">불러오는 중...</div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-zinc-900">{pageTitle}</h1>
        {!isTrash && (
          <button
            onClick={() => navigate('/write')}
            className="text-sm bg-zinc-900 text-white px-3 py-1.5 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            + 새 일기
          </button>
        )}
      </div>

      <div className="mb-4">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="검색..."
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300 bg-white"
        />
      </div>

      {displayed.length === 0 ? (
        <div className="text-center py-16 text-zinc-400">
          <div className="text-4xl mb-3">{isTrash ? '🗑️' : '📝'}</div>
          <p className="text-sm">
            {searchQuery ? '검색 결과가 없어요' : isTrash ? '삭제된 일기가 없어요' : '아직 일기가 없어요. 첫 일기를 써볼까요?'}
          </p>
          {!isTrash && !searchQuery && (
            <button
              onClick={() => navigate('/write')}
              className="mt-4 text-sm bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              일기 쓰기
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((entry) => (
            <EntryCard key={entry.id} entry={entry} isTrash={isTrash} />
          ))}
        </div>
      )}
    </div>
  )
}
