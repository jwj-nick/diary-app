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
  addMonths,
} from 'date-fns'
import { ko } from 'date-fns/locale'
import type { DiaryEntry, EntryType } from '@/types/diary'
import { getEntryDisplayDate } from '@/types/diary'
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

type Density = 'compact' | 'tiny'

interface Props {
  /** 시작 월 (보통 today의 month) */
  startMonth: Date
  /** 표시할 개월 수 (3 / 6 / 12) */
  monthCount: 3 | 6 | 12
  entries: DiaryEntry[]
  selectedDate: Date
  setSelectedDate: (d: Date) => void
  onAddOnDate?: (date: Date) => void
  /** 12개월은 너무 빽빽 → planning(시험/목표/기념일)만 표시 옵션 */
  planningOnly?: boolean
}

export function MultiMonthCalendar({
  startMonth,
  monthCount,
  entries,
  selectedDate,
  setSelectedDate,
  onAddOnDate,
  planningOnly,
}: Props) {
  const filtered = useMemo(() => {
    if (!planningOnly) return entries
    return entries.filter(
      (e) => e.type === 'exam' || e.type === 'goal' || e.type === 'anniversary'
    )
  }, [entries, planningOnly])

  // anniversary recurring projection (MonthCalendar 와 동일 로직)
  const entriesByDate = useMemo(() => {
    const map = new Map<string, DiaryEntry[]>()
    for (const entry of filtered) {
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
  }, [filtered])

  const months = useMemo(() => {
    return Array.from({ length: monthCount }, (_, i) => addMonths(startMonth, i))
  }, [startMonth, monthCount])

  // 그리드 cols: 3=3, 6=3, 12=4 (모바일은 1~2)
  const gridCols =
    monthCount === 3
      ? 'grid-cols-1 sm:grid-cols-3'
      : monthCount === 6
      ? 'grid-cols-2 sm:grid-cols-3'
      : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'

  const density: Density = monthCount === 12 ? 'tiny' : 'compact'

  return (
    <div className={cn('grid gap-3', gridCols)}>
      {months.map((monthDate) => (
        <MiniMonth
          key={format(monthDate, 'yyyy-MM')}
          monthDate={monthDate}
          entriesByDate={entriesByDate}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          onAddOnDate={onAddOnDate}
          density={density}
        />
      ))}
    </div>
  )
}

interface MiniMonthProps {
  monthDate: Date
  entriesByDate: Map<string, DiaryEntry[]>
  selectedDate: Date
  setSelectedDate: (d: Date) => void
  onAddOnDate?: (date: Date) => void
  density: Density
}

function MiniMonth({
  monthDate,
  entriesByDate,
  selectedDate,
  setSelectedDate,
  onAddOnDate,
  density,
}: MiniMonthProps) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 0 })
    const end = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
  }, [monthDate])

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* 월 헤더 */}
      <div className="px-2 py-1.5 border-b border-border bg-muted/40">
        <h3 className="text-xs font-semibold text-foreground">
          {format(monthDate, 'yyyy년 M월', { locale: ko })}
        </h3>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAYS.map((d, i) => (
          <div
            key={d}
            className={cn(
              'py-0.5 text-center text-[9px] font-medium',
              i === 0 && 'text-rose-500',
              i === 6 && 'text-blue-500',
              i !== 0 && i !== 6 && 'text-muted-foreground'
            )}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd')
          const dayEntries = entriesByDate.get(key) || []
          const inMonth = isSameMonth(day, monthDate)
          const today = isToday(day)
          const selected = isSameDay(day, selectedDate)
          const dow = day.getDay()
          // 중복 타입은 dedupe — 같은 type 여러개여도 dot 한 개
          const uniqueTypes = Array.from(new Set(dayEntries.map((e) => e.type)))

          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedDate(day)}
              onDoubleClick={() => onAddOnDate?.(day)}
              className={cn(
                'flex flex-col items-center justify-start gap-0.5 relative',
                'border-r border-b border-border last:border-r-0',
                density === 'tiny' ? 'py-0.5 min-h-[26px]' : 'py-1 min-h-[36px]',
                !inMonth && 'bg-muted/30 text-muted-foreground/50',
                inMonth && 'hover:bg-muted transition-colors',
                selected && 'bg-blue-500/15 ring-1 ring-blue-500/40 ring-inset z-10'
              )}
            >
              <span
                className={cn(
                  density === 'tiny' ? 'text-[9px]' : 'text-[10px]',
                  'font-medium leading-none',
                  today &&
                    'inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white',
                  !today && inMonth && dow === 0 && 'text-rose-500',
                  !today && inMonth && dow === 6 && 'text-blue-500',
                  !today && inMonth && dow !== 0 && dow !== 6 && 'text-foreground'
                )}
              >
                {format(day, 'd')}
              </span>

              {/* dots — 최대 3 또는 4 */}
              {uniqueTypes.length > 0 && (
                <div className="flex flex-wrap gap-[1px] justify-center px-0.5">
                  {uniqueTypes.slice(0, density === 'tiny' ? 3 : 4).map((t) => (
                    <span
                      key={t}
                      className={cn(
                        'inline-block rounded-full',
                        density === 'tiny' ? 'w-1 h-1' : 'w-1.5 h-1.5',
                        TYPE_DOT[t]
                      )}
                    />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
