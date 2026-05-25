import { useMemo } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  format,
  differenceInCalendarDays,
} from 'date-fns'
import { ko } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { DiaryEntry, EntryType } from '@/types/diary'
import { getEntryDisplayDate, getEntryShortTitle } from '@/types/diary'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

const TYPE_DOT: Record<EntryType, string> = {
  study: 'bg-blue-500',
  reading: 'bg-emerald-500',
  free: 'bg-amber-500',
  goal: 'bg-violet-500',
  exam: 'bg-rose-500',
  schedule: 'bg-sky-500',
  todo: 'bg-orange-500',
}

const TYPE_BG: Record<EntryType, string> = {
  study: 'bg-blue-50 text-blue-700 border-blue-100',
  reading: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  free: 'bg-amber-50 text-amber-700 border-amber-100',
  goal: 'bg-violet-50 text-violet-700 border-violet-100',
  exam: 'bg-rose-100 text-rose-700 border-rose-200 font-medium',
  schedule: 'bg-sky-50 text-sky-700 border-sky-100',
  todo: 'bg-orange-50 text-orange-700 border-orange-100',
}

const TYPE_EMOJI: Record<EntryType, string> = {
  study: '📚',
  reading: '📖',
  free: '✏️',
  goal: '🎯',
  exam: '📝',
  schedule: '📅',
  todo: '☑️',
}

interface Props {
  currentMonth: Date
  setCurrentMonth: (d: Date) => void
  selectedDate: Date
  setSelectedDate: (d: Date) => void
  entries: DiaryEntry[]
  onAddOnDate?: (date: Date) => void
}

export function MonthCalendar({
  currentMonth,
  setCurrentMonth,
  selectedDate,
  setSelectedDate,
  entries,
  onAddOnDate,
}: Props) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 })
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  // Group entries by display date
  const entriesByDate = useMemo(() => {
    const map = new Map<string, DiaryEntry[]>()
    for (const entry of entries) {
      if (entry.deletedAt) continue
      const key = getEntryDisplayDate(entry)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(entry)
    }
    return map
  }, [entries])

  const goPrev = () => {
    const d = new Date(currentMonth)
    d.setMonth(d.getMonth() - 1)
    setCurrentMonth(d)
  }
  const goNext = () => {
    const d = new Date(currentMonth)
    d.setMonth(d.getMonth() + 1)
    setCurrentMonth(d)
  }
  const goToday = () => {
    const today = new Date()
    setCurrentMonth(today)
    setSelectedDate(today)
  }

  return (
    <div className="flex flex-col w-full bg-white rounded-xl border border-zinc-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 md:px-4 py-3 border-b border-zinc-100">
        <div className="flex items-center gap-1">
          <button
            onClick={goPrev}
            className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-600"
            aria-label="이전 달"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="font-semibold text-zinc-900 px-2 text-sm md:text-base">
            {format(currentMonth, 'yyyy년 M월', { locale: ko })}
          </h2>
          <button
            onClick={goNext}
            className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-600"
            aria-label="다음 달"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={goToday}
          className="text-xs px-2.5 py-1 rounded-md border border-zinc-200 hover:bg-zinc-50 text-zinc-600"
        >
          오늘
        </button>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b border-zinc-100">
        {WEEKDAYS.map((d, i) => (
          <div
            key={d}
            className={cn(
              'py-2 text-center text-[11px] md:text-xs font-medium',
              i === 0 && 'text-rose-500',
              i === 6 && 'text-blue-500',
              i !== 0 && i !== 6 && 'text-zinc-500'
            )}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days grid — 6 rows */}
      <div className="grid grid-cols-7 grid-rows-6 flex-1">
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd')
          const dayEntries = entriesByDate.get(key) || []
          const inMonth = isSameMonth(day, currentMonth)
          const today = isToday(day)
          const selected = isSameDay(day, selectedDate)
          const dow = day.getDay()

          return (
            <DayCell
              key={key}
              day={day}
              dayOfWeek={dow}
              entries={dayEntries}
              inMonth={inMonth}
              today={today}
              selected={selected}
              onClick={() => setSelectedDate(day)}
              onDoubleClick={() => onAddOnDate?.(day)}
            />
          )
        })}
      </div>
    </div>
  )
}

interface DayCellProps {
  day: Date
  dayOfWeek: number
  entries: DiaryEntry[]
  inMonth: boolean
  today: boolean
  selected: boolean
  onClick: () => void
  onDoubleClick: () => void
}

function DayCell({
  day,
  dayOfWeek,
  entries,
  inMonth,
  today,
  selected,
  onClick,
  onDoubleClick,
}: DayCellProps) {
  // Sort entries: exam > goal > others
  const sorted = useMemo(() => {
    const priority: Record<EntryType, number> = { exam: 0, goal: 1, schedule: 2, todo: 3, study: 4, reading: 5, free: 6 }
    return [...entries].sort((a, b) => priority[a.type] - priority[b.type])
  }, [entries])

  const visibleDesktop = sorted.slice(0, 3)
  const moreCountDesktop = Math.max(0, sorted.length - visibleDesktop.length)
  const visibleMobile = sorted.slice(0, 4)

  return (
    <button
      type="button"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={cn(
        'group relative flex flex-col gap-1 text-left',
        'border-r border-b border-zinc-100 last:border-r-0',
        'p-1 md:p-1.5 min-h-[64px] md:min-h-[100px] lg:min-h-[120px]',
        'transition-colors overflow-hidden',
        !inMonth && 'bg-zinc-50/30 text-zinc-300',
        inMonth && 'hover:bg-zinc-50',
        selected && 'bg-blue-50 ring-2 ring-blue-300 ring-inset z-10'
      )}
    >
      {/* Day number */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'text-[11px] md:text-xs font-medium leading-none',
            today &&
              'inline-flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full bg-zinc-900 text-white text-[10px] md:text-xs',
            !today && inMonth && dayOfWeek === 0 && 'text-rose-500',
            !today && inMonth && dayOfWeek === 6 && 'text-blue-500',
            !today && inMonth && dayOfWeek !== 0 && dayOfWeek !== 6 && 'text-zinc-800'
          )}
        >
          {format(day, 'd')}
        </span>
      </div>

      {/* Mobile: dots only (compact) */}
      <div className="flex flex-wrap gap-0.5 md:hidden">
        {visibleMobile.map((e) => (
          <span
            key={e.id}
            className={cn('inline-block w-1.5 h-1.5 rounded-full', TYPE_DOT[e.type])}
            title={getEntryShortTitle(e)}
          />
        ))}
        {sorted.length > 4 && (
          <span className="text-[9px] text-zinc-400 leading-none">+{sorted.length - 4}</span>
        )}
      </div>

      {/* Desktop: pill-shaped entries */}
      <div className="hidden md:flex md:flex-col gap-0.5 flex-1 min-h-0">
        {visibleDesktop.map((e) => (
          <span
            key={e.id}
            className={cn(
              'inline-flex items-center gap-1 text-[10px] lg:text-[11px] px-1.5 py-0.5 rounded',
              'border truncate leading-tight',
              TYPE_BG[e.type]
            )}
            title={getEntryShortTitle(e)}
          >
            <span className="flex-shrink-0">{TYPE_EMOJI[e.type]}</span>
            <span className="truncate">{getEntryShortTitle(e)}</span>
            {e.type === 'exam' && (
              <ExamCountdown examDate={e.examDate} />
            )}
          </span>
        ))}
        {moreCountDesktop > 0 && (
          <span className="text-[10px] text-zinc-400 px-1.5">+{moreCountDesktop}</span>
        )}
      </div>
    </button>
  )
}

function ExamCountdown({ examDate }: { examDate: string }) {
  const days = differenceInCalendarDays(new Date(examDate), new Date())
  if (days < 0) return null
  if (days === 0) return <span className="ml-auto text-[9px] font-bold text-rose-700">D-day</span>
  if (days <= 7) return <span className="ml-auto text-[9px] font-bold">D-{days}</span>
  return null
}
