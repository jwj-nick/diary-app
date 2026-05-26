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
  anniversary: 'bg-pink-500',
}

const TYPE_BG: Record<EntryType, string> = {
  study: 'bg-blue-500/15    text-blue-700 dark:text-blue-300   border-blue-500/20',
  reading: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  free: 'bg-amber-500/15   text-amber-700 dark:text-amber-300  border-amber-500/20',
  goal: 'bg-violet-500/15  text-violet-700 dark:text-violet-300 border-violet-500/20',
  exam: 'bg-rose-500/20    text-rose-700 dark:text-rose-300   border-rose-500/25 font-medium',
  schedule: 'bg-sky-500/15     text-sky-700 dark:text-sky-300     border-sky-500/20',
  todo: 'bg-orange-500/15  text-orange-700 dark:text-orange-300 border-orange-500/20',
  anniversary: 'bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/20 font-medium',
}

const TYPE_EMOJI: Record<EntryType, string> = {
  study: '📚',
  reading: '📖',
  free: '✏️',
  goal: '🎯',
  exam: '📝',
  schedule: '📅',
  todo: '☑️',
  anniversary: '🎂',
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

  // Group entries by display date. Recurring anniversaries also appear on the
  // same month-day in adjacent years so users see "엄마 생일" in 2026, 2027, etc.
  const entriesByDate = useMemo(() => {
    const map = new Map<string, DiaryEntry[]>()
    for (const entry of entries) {
      if (entry.deletedAt) continue
      const key = getEntryDisplayDate(entry)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(entry)
      if (entry.type === 'anniversary' && entry.recurring) {
        const [origY, m, d] = key.split('-').map(Number)
        if (origY && m && d) {
          for (const yearOffset of [-1, 0, 1, 2]) {
            const y = origY + yearOffset
            if (y === origY) continue
            const projected = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
            if (!map.has(projected)) map.set(projected, [])
            map.get(projected)!.push(entry)
          }
        }
      }
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
    <div className="flex flex-col w-full bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 md:px-4 py-3 border-b border-border">
        <div className="flex items-center gap-1">
          <button
            onClick={goPrev}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
            aria-label="이전 달"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="font-semibold text-foreground px-2 text-sm md:text-base">
            {format(currentMonth, 'yyyy년 M월', { locale: ko })}
          </h2>
          <button
            onClick={goNext}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
            aria-label="다음 달"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={goToday}
          className="text-xs px-2.5 py-1 rounded-md border border-border hover:bg-muted text-muted-foreground"
        >
          오늘
        </button>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAYS.map((d, i) => (
          <div
            key={d}
            className={cn(
              'py-2 text-center text-[11px] md:text-xs font-medium',
              i === 0 && 'text-rose-500',
              i === 6 && 'text-blue-500',
              i !== 0 && i !== 6 && 'text-muted-foreground'
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
    const priority: Record<EntryType, number> = { anniversary: 0, exam: 1, goal: 2, schedule: 3, todo: 4, study: 5, reading: 6, free: 7 }
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
        'border-r border-b border-border last:border-r-0',
        'p-1 md:p-1.5 min-h-[64px] md:min-h-[100px] lg:min-h-[120px]',
        'transition-colors overflow-hidden',
        !inMonth && 'bg-muted/30 text-muted-foreground/60',
        inMonth && 'hover:bg-muted',
        selected && 'bg-blue-500/15 ring-2 ring-blue-500/40 ring-inset z-10'
      )}
    >
      {/* Day number */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'text-[11px] md:text-xs font-medium leading-none',
            today &&
              'inline-flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary text-white text-[10px] md:text-xs',
            !today && inMonth && dayOfWeek === 0 && 'text-rose-500',
            !today && inMonth && dayOfWeek === 6 && 'text-blue-500',
            !today && inMonth && dayOfWeek !== 0 && dayOfWeek !== 6 && 'text-foreground'
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
          <span className="text-[9px] text-muted-foreground leading-none">+{sorted.length - 4}</span>
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
          <span className="text-[10px] text-muted-foreground px-1.5">+{moreCountDesktop}</span>
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
