import { useMemo } from 'react'
import { format, isSameDay, differenceInCalendarDays } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Sparkles, CalendarClock, CheckSquare, Cake, FileText, Target } from 'lucide-react'
import { motion } from 'motion/react'
import type { DiaryEntry } from '@/types/diary'
import { getEntryDisplayDate, getEntryShortTitle } from '@/types/diary'
import { cn } from '@/lib/utils'

interface Props {
  entries: DiaryEntry[]
  greetingName?: string
}

/**
 * Family Journal layout 의 "Today" 헤더 패널.
 * - 큰 날짜 typography
 * - 오늘의 일정/할일/임박 시험·목표 미니 요약
 * - 기념일이 있으면 따로 강조 카드
 */
export function TodayPanel({ entries, greetingName }: Props) {
  const today = new Date()

  const todays = useMemo(() => {
    const list = entries.filter((e) => {
      if (e.deletedAt) return false
      const d = getEntryDisplayDate(e)
      return isSameDay(new Date(d), today)
    })
    return list
  }, [entries, today])

  // Anniversary가 today에 떨어지면 recurring 처리 (MonthCalendar 와 동일 로직, 간단 버전)
  const anniversariesToday = useMemo(() => {
    const month = today.getMonth() + 1
    const day = today.getDate()
    return entries.filter((e) => {
      if (e.deletedAt) return false
      if (e.type !== 'anniversary') return false
      const d = new Date(e.anniversaryDate)
      return d.getMonth() + 1 === month && d.getDate() === day
    })
  }, [entries, today])

  // 다가오는 일정/시험 (앞으로 7일)
  const upcoming = useMemo(() => {
    return entries
      .filter((e) => {
        if (e.deletedAt) return false
        if (e.type !== 'exam' && e.type !== 'schedule' && e.type !== 'goal' && e.type !== 'todo') return false
        const d = getEntryDisplayDate(e)
        const days = differenceInCalendarDays(new Date(d), today)
        return days > 0 && days <= 7
      })
      .sort((a, b) =>
        getEntryDisplayDate(a).localeCompare(getEntryDisplayDate(b))
      )
      .slice(0, 3)
  }, [entries, today])

  const todayScheduleCount = todays.filter((e) => e.type === 'schedule').length
  const todayTodoCount = todays.filter((e) => e.type === 'todo').length

  return (
    <motion.div
      className="mb-8 md:mb-10 space-y-5 md:space-y-6"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
      }}
    >
      {/* 큰 헤더 — Day One/Things 3 style hero */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 6 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
            }}
            className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 flex items-center gap-1.5 font-medium"
          >
            <Sparkles className="h-3 w-3" />
            오늘
            {greetingName && <span>· {greetingName}</span>}
          </motion.p>
          <motion.h1
            variants={{
              hidden: { opacity: 0, y: 14 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
              },
            }}
            className="text-5xl md:text-7xl font-bold tracking-[-0.04em] text-foreground leading-[1.02]"
          >
            {format(today, 'M월 d일', { locale: ko })}
          </motion.h1>
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
            }}
            className="mt-2 text-lg md:text-xl font-medium text-muted-foreground tracking-tight"
          >
            {format(today, 'EEEE', { locale: ko })}
          </motion.p>
        </div>
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.5, delay: 0.2 } },
          }}
          className="flex items-center gap-3 text-xs text-muted-foreground"
        >
          {todays.length > 0 && (
            <span>오늘 {todays.length}개 기록</span>
          )}
          {todays.length === 0 && (
            <span>오늘 아직 기록이 없어요</span>
          )}
        </motion.div>
      </div>

      {/* 기념일 강조 (있을 때만) */}
      {anniversariesToday.length > 0 && (
        <div className="rounded-xl border border-pink-500/30 bg-pink-500/10 px-4 py-3 flex items-center gap-3">
          <Cake className="h-5 w-5 text-pink-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-pink-700 dark:text-pink-300 font-medium mb-0.5">오늘은…</p>
            <p className="text-sm text-foreground font-medium truncate">
              {anniversariesToday.map((a) => a.type === 'anniversary' ? a.title : '').join(' · ')}
            </p>
          </div>
        </div>
      )}

      {/* 상황 요약 + upcoming */}
      {(todayScheduleCount > 0 || todayTodoCount > 0 || upcoming.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(todayScheduleCount > 0 || todayTodoCount > 0) && (
            <div className="rounded-xl border border-border bg-card px-5 py-4">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-3">
                오늘
              </p>
              <div className="space-y-1.5">
                {todays
                  .filter((e) => e.type === 'schedule' || e.type === 'todo')
                  .slice(0, 4)
                  .map((e) => (
                    <div key={e.id} className="flex items-center gap-2 text-sm text-foreground">
                      {e.type === 'schedule' && <CalendarClock className="h-3.5 w-3.5 text-sky-500 flex-shrink-0" />}
                      {e.type === 'todo' && <CheckSquare className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />}
                      <span className="truncate">{getEntryShortTitle(e)}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {upcoming.length > 0 && (
            <div className="rounded-xl border border-border bg-card px-5 py-4">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-3">
                다가오는 7일
              </p>
              <div className="space-y-1.5">
                {upcoming.map((e) => {
                  const d = getEntryDisplayDate(e)
                  const days = differenceInCalendarDays(new Date(d), today)
                  return (
                    <div key={e.id} className="flex items-center gap-2 text-sm">
                      {e.type === 'exam' && <FileText className="h-3.5 w-3.5 text-rose-500 flex-shrink-0" />}
                      {e.type === 'goal' && <Target className="h-3.5 w-3.5 text-violet-500 flex-shrink-0" />}
                      {e.type === 'schedule' && <CalendarClock className="h-3.5 w-3.5 text-sky-500 flex-shrink-0" />}
                      {e.type === 'todo' && <CheckSquare className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />}
                      <span className="text-foreground truncate flex-1">{getEntryShortTitle(e)}</span>
                      <span className={cn(
                        'text-[10px] font-medium px-1.5 py-0.5 rounded',
                        days <= 1 ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300' :
                        days <= 3 ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300' :
                        'bg-muted text-muted-foreground'
                      )}>
                        D-{days}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

