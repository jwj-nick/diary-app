import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, isSameDay, differenceInCalendarDays, startOfMonth } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { useDiaryStore } from '@/store/diary.store'
import { useAuthStore } from '@/store/auth.store'
import type { DiaryEntry, EntryType } from '@/types/diary'
import { getEntryDisplayDate, getEntryShortTitle } from '@/types/diary'
import { MonthCalendar } from '@/components/shared/MonthCalendar'
import { MultiMonthCalendar } from '@/components/shared/MultiMonthCalendar'
import { cn } from '@/lib/utils'

type ViewMode = '1' | '3' | '6' | '12'

const VIEW_TABS: { id: ViewMode; label: string }[] = [
  { id: '1', label: '월' },
  { id: '3', label: '3개월' },
  { id: '6', label: '6개월' },
  { id: '12', label: '1년' },
]

const TYPE_LABEL: Record<EntryType, string> = {
  study: '공부',
  reading: '독서',
  free: '자유',
  goal: '목표',
  exam: '시험',
  schedule: '일정',
  todo: '할일',
  anniversary: '기념일',
}

const TYPE_DOT: Record<EntryType, string> = {
  study: 'bg-blue-500',
  reading: 'bg-emerald-500',
  free: 'bg-amber-500',
  goal: 'bg-violet-500',
  exam: 'bg-rose-500',
  schedule: 'bg-sky-500',
  todo: 'bg-orange-500',
  anniversary: 'bg-pink-500',
}

export function CalendarPage() {
  const navigate = useNavigate()
  const { entries, loadEntries, softDelete, toggleStep } = useDiaryStore()
  const { viewMode, viewAsUserId } = useAuthStore()
  const canWrite = !viewAsUserId
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewModeTab, setViewModeTab] = useState<ViewMode>('1')

  useEffect(() => {
    loadEntries()
  }, [loadEntries, viewMode, viewAsUserId])

  const activeEntries = useMemo(() => entries.filter((e) => !e.deletedAt), [entries])

  const selectedDayEntries = useMemo(
    () =>
      activeEntries.filter((e) =>
        isSameDay(new Date(getEntryDisplayDate(e)), selectedDate)
      ),
    [activeEntries, selectedDate]
  )

  // 멀티월 뷰의 시작 월: 현재 월 기준
  const multiStart = useMemo(() => startOfMonth(currentMonth), [currentMonth])
  const monthCount = viewModeTab === '3' ? 3 : viewModeTab === '6' ? 6 : viewModeTab === '12' ? 12 : 1

  return (
    <div className="h-full flex flex-col gap-4 max-w-6xl mx-auto">
      {/* View toggle */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="inline-flex gap-1 bg-muted p-1 rounded-xl">
          {VIEW_TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setViewModeTab(id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                viewModeTab === id
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {label}
            </button>
          ))}
        </div>
        {viewModeTab !== '1' && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - monthCount, 1))}
              className="px-2 py-1 text-xs rounded-md border border-border hover:bg-muted text-muted-foreground"
            >
              ‹
            </button>
            <span className="text-xs text-muted-foreground px-2">
              {format(multiStart, 'yyyy.M', { locale: ko })} ~ {format(new Date(multiStart.getFullYear(), multiStart.getMonth() + monthCount - 1, 1), 'yyyy.M', { locale: ko })}
            </span>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthCount, 1))}
              className="px-2 py-1 text-xs rounded-md border border-border hover:bg-muted text-muted-foreground"
            >
              ›
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-2 py-1 text-xs rounded-md border border-border hover:bg-muted text-muted-foreground ml-1"
            >
              오늘
            </button>
          </div>
        )}
        <div className="ml-auto" />
        {canWrite && (
          <button
            onClick={() => navigate('/write')}
            className="inline-flex items-center gap-1 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" />
            새 일기
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center flex-wrap gap-3 text-xs text-muted-foreground">
        {viewModeTab === '12'
          ? (['exam', 'goal', 'anniversary'] as EntryType[]).map((t) => (
              <span key={t} className="flex items-center gap-1">
                <span className={cn('w-2 h-2 rounded-full inline-block', TYPE_DOT[t])} />
                {TYPE_LABEL[t]}
              </span>
            ))
          : (['study', 'reading', 'free', 'goal', 'exam', 'schedule', 'todo', 'anniversary'] as EntryType[]).map((t) => (
              <span key={t} className="flex items-center gap-1">
                <span className={cn('w-2 h-2 rounded-full inline-block', TYPE_DOT[t])} />
                {TYPE_LABEL[t]}
              </span>
            ))}
        {viewModeTab === '12' && (
          <span className="text-[10px] text-muted-foreground/70">(1년 뷰는 시험·목표·기념일만 표시)</span>
        )}
      </div>

      {/* Calendar */}
      {viewModeTab === '1' ? (
        <MonthCalendar
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          entries={activeEntries}
          onAddOnDate={canWrite ? (date) => navigate(`/write?date=${format(date, 'yyyy-MM-dd')}`) : undefined}
        />
      ) : (
        <MultiMonthCalendar
          startMonth={multiStart}
          monthCount={monthCount as 3 | 6 | 12}
          entries={activeEntries}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          onAddOnDate={canWrite ? (date) => navigate(`/write?date=${format(date, 'yyyy-MM-dd')}`) : undefined}
          planningOnly={viewModeTab === '12'}
        />
      )}

      {/* Selected day detail */}
      <div className="bg-card rounded-2xl border border-border p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base md:text-lg font-semibold text-foreground tracking-tight">
            {format(selectedDate, 'M월 d일 (eee)', { locale: ko })}
          </h2>
          <span className="text-xs text-muted-foreground">{selectedDayEntries.length}개 기록</span>
        </div>
        {selectedDayEntries.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            이 날은 기록이 없어요
            {canWrite && (
              <div className="mt-2">
                <button
                  onClick={() => navigate('/write')}
                  className="text-xs text-foreground underline hover:text-foreground"
                >
                  새 일기 작성하기
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {selectedDayEntries.map((entry) => (
              <DayEntryRow
                key={entry.id}
                entry={entry}
                canWrite={canWrite}
                onEdit={() => navigate(`/write?id=${entry.id}`)}
                onDelete={() => softDelete(entry.id)}
                onToggleStep={(stepId) => toggleStep(entry.id, stepId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface RowProps {
  entry: DiaryEntry
  canWrite: boolean
  onEdit: () => void
  onDelete: () => void
  onToggleStep: (stepId: string) => void
}

function DayEntryRow({ entry, canWrite, onEdit, onDelete, onToggleStep }: RowProps) {
  const title = getEntryShortTitle(entry)
  const daysUntil =
    entry.type === 'exam'
      ? differenceInCalendarDays(new Date(entry.examDate), new Date())
      : entry.type === 'goal'
      ? differenceInCalendarDays(new Date(entry.targetDate), new Date())
      : null

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-border transition-colors">
      <span className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', TYPE_DOT[entry.type])} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground uppercase">{TYPE_LABEL[entry.type]}</span>
          {daysUntil !== null && daysUntil >= 0 && (
            <span
              className={cn(
                'text-xs px-1.5 py-0.5 rounded font-medium',
                daysUntil === 0 && 'bg-rose-500/15    text-rose-700 dark:text-rose-300',
                daysUntil > 0 && daysUntil <= 7 && 'bg-amber-500/15   text-amber-700 dark:text-amber-300',
                daysUntil > 7 && 'bg-muted text-muted-foreground'
              )}
            >
              {daysUntil === 0 ? 'D-day' : `D-${daysUntil}`}
            </span>
          )}
          <span className="text-sm text-foreground truncate">{title}</span>
        </div>

        {/* Type-specific extra info */}
        {entry.type === 'study' && (
          <div className="text-xs text-muted-foreground mt-0.5">
            {entry.durationMinutes}분 · 이해도{' '}
            {entry.understanding === 4 ? '😎' : entry.understanding === 3 ? '🙂' : entry.understanding === 2 ? '🤔' : '😵'}
            {entry.note && ` · ${entry.note.slice(0, 40)}`}
          </div>
        )}
        {entry.type === 'reading' && (
          <div className="text-xs text-muted-foreground mt-0.5">
            {entry.author && `${entry.author} · `}
            {entry.pagesFrom != null && entry.pagesTo != null && `p.${entry.pagesFrom}-${entry.pagesTo}`}
            {entry.rating && ` · ${'★'.repeat(entry.rating)}`}
          </div>
        )}
        {entry.type === 'free' && entry.body && (
          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {entry.body.slice(0, 80)}
          </div>
        )}
        {entry.type === 'goal' && entry.steps.length > 0 && (
          <GoalProgress entry={entry} onToggle={onToggleStep} />
        )}
        {entry.type === 'exam' && entry.prepSteps.length > 0 && (
          <PrepProgress entry={entry} onToggle={onToggleStep} />
        )}
      </div>
      {canWrite && (
        <div className="flex gap-0.5 flex-shrink-0">
          <button
            onClick={onEdit}
            title="수정"
            className="p-1 rounded hover:bg-muted text-muted-foreground/60 hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            title="삭제"
            className="p-1 rounded hover:bg-red-500/10 text-muted-foreground/60 hover:text-red-500"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

function GoalProgress({
  entry,
  onToggle,
}: {
  entry: Extract<DiaryEntry, { type: 'goal' }>
  onToggle: (stepId: string) => void
}) {
  const doneCount = entry.steps.filter((s) => s.done).length
  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-500"
            style={{ width: `${(doneCount / entry.steps.length) * 100}%` }}
          />
        </div>
        <span>
          {doneCount}/{entry.steps.length}
        </span>
      </div>
      <div className="space-y-0.5">
        {entry.steps.map((s) => (
          <label key={s.id} className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={s.done}
              onChange={() => onToggle(s.id)}
              className="rounded text-violet-600 focus:ring-violet-500"
            />
            <span className={cn(s.done && 'line-through text-muted-foreground')}>{s.text}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function PrepProgress({
  entry,
  onToggle,
}: {
  entry: Extract<DiaryEntry, { type: 'exam' }>
  onToggle: (stepId: string) => void
}) {
  const doneCount = entry.prepSteps.filter((s) => s.done).length
  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-rose-500"
            style={{ width: `${(doneCount / entry.prepSteps.length) * 100}%` }}
          />
        </div>
        <span>
          {doneCount}/{entry.prepSteps.length}
        </span>
      </div>
      <div className="space-y-0.5">
        {entry.prepSteps.map((s) => (
          <label key={s.id} className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={s.done}
              onChange={() => onToggle(s.id)}
              className="rounded text-rose-600 focus:ring-rose-500"
            />
            <span className={cn(s.done && 'line-through text-muted-foreground')}>{s.text}</span>
            {s.dueDate && !s.done && (
              <span className="text-[10px] text-muted-foreground ml-auto">
                ~{format(new Date(s.dueDate), 'M/d')}
              </span>
            )}
          </label>
        ))}
      </div>
    </div>
  )
}
