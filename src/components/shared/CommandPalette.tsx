import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Command } from 'cmdk'
import * as Dialog from '@radix-ui/react-dialog'
import {
  Search, PenLine, Calendar, BookOpen, Pencil, Target, FileText,
  CalendarClock, CheckSquare, Cake, Home, ShieldCheck, LogOut, Users, Sun, Moon, Monitor, User,
} from 'lucide-react'
import { useDiaryStore } from '@/store/diary.store'
import { useAuthStore } from '@/store/auth.store'
import { useTheme } from '@/lib/theme'
import { getEntryDisplayDate, getEntryShortTitle } from '@/types/diary'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

/**
 * Cmd/Ctrl + K 로 열리는 명령 팔레트.
 * - 검색: 모든 active entry의 title/body
 * - 빠른 액션: 새 일기 / 새 일정 / 새 목표 / 새 할일 / 캘린더 / 가족 공동 / 테마 / 로그아웃
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { entries, setFilterType } = useDiaryStore()
  const { profile, viewAsUserId, signOut } = useAuthStore()
  const { setTheme } = useTheme()
  const canWrite = !viewAsUserId
  const isAdmin = profile?.role === 'admin'

  // Cmd/Ctrl + K 토글
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
  }, [])

  const run = useCallback((fn: () => void) => {
    fn()
    close()
  }, [close])

  // 검색 매칭 — 활성 entries
  const matchingEntries = useMemo(() => {
    if (!query.trim()) return [] as typeof entries
    const q = query.toLowerCase()
    return entries
      .filter((e) => !e.deletedAt)
      .filter((e) => {
        const title = getEntryShortTitle(e).toLowerCase()
        if (title.includes(q)) return true
        if (e.type === 'free' && e.body?.toLowerCase().includes(q)) return true
        if (e.type === 'study' && e.note?.toLowerCase().includes(q)) return true
        if (e.type === 'reading' && (e.thought || e.quote || '').toLowerCase().includes(q)) return true
        return false
      })
      .slice(0, 8)
  }, [entries, query])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <Dialog.Content
          className="fixed left-1/2 top-[15%] -translate-x-1/2 z-50 w-[92vw] max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">명령 팔레트</Dialog.Title>
          <Command label="명령 팔레트" shouldFilter={!query.trim()}>
            <div className="flex items-center gap-2 px-4 border-b border-border">
              <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder="검색 또는 명령 실행..."
                className="flex-1 py-4 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                autoFocus
              />
              <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                ESC
              </kbd>
            </div>

            <Command.List className="max-h-[60vh] overflow-y-auto p-2">
              <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
                결과 없음
              </Command.Empty>

              {/* 검색 매칭 — 쿼리 있을 때만 */}
              {matchingEntries.length > 0 && (
                <Command.Group heading="검색 결과" className="cmd-group">
                  {matchingEntries.map((e) => (
                    <Item
                      key={e.id}
                      onSelect={() => run(() => navigate(`/write?id=${e.id}`))}
                      icon={
                        e.type === 'study' ? <BookOpen className="h-4 w-4" /> :
                        e.type === 'reading' ? <BookOpen className="h-4 w-4" /> :
                        e.type === 'free' ? <Pencil className="h-4 w-4" /> :
                        e.type === 'goal' ? <Target className="h-4 w-4" /> :
                        e.type === 'exam' ? <FileText className="h-4 w-4" /> :
                        e.type === 'schedule' ? <CalendarClock className="h-4 w-4" /> :
                        e.type === 'todo' ? <CheckSquare className="h-4 w-4" /> :
                        <Cake className="h-4 w-4" />
                      }
                      label={getEntryShortTitle(e)}
                      hint={format(new Date(getEntryDisplayDate(e)), 'M/d (eee)', { locale: ko })}
                    />
                  ))}
                </Command.Group>
              )}

              {/* 빠른 액션 — 쓰기 가능할 때만 */}
              {canWrite && (
                <Command.Group heading="새로 만들기" className="cmd-group">
                  <Item icon={<BookOpen className="h-4 w-4 text-blue-500" />} label="공부 일기" shortcut="공부" onSelect={() => run(() => navigate('/write?type=study'))} />
                  <Item icon={<BookOpen className="h-4 w-4 text-emerald-500" />} label="독서 일기" shortcut="기록" onSelect={() => run(() => navigate('/write?type=reading'))} />
                  <Item icon={<Pencil className="h-4 w-4 text-amber-500" />} label="자유 일기" shortcut="기록" onSelect={() => run(() => navigate('/write?type=free'))} />
                  <Item icon={<Target className="h-4 w-4 text-violet-500" />} label="목표" shortcut="목표" onSelect={() => run(() => navigate('/write?type=goal'))} />
                  <Item icon={<FileText className="h-4 w-4 text-rose-500" />} label="시험" shortcut="목표" onSelect={() => run(() => navigate('/write?type=exam'))} />
                  <Item icon={<CalendarClock className="h-4 w-4 text-sky-500" />} label="일정" shortcut="일정" onSelect={() => run(() => navigate('/write?type=schedule'))} />
                  <Item icon={<Cake className="h-4 w-4 text-pink-500" />} label="기념일" shortcut="일정" onSelect={() => run(() => navigate('/write?type=anniversary'))} />
                  <Item icon={<CheckSquare className="h-4 w-4 text-orange-500" />} label="할일" shortcut="할일" onSelect={() => run(() => navigate('/write?type=todo'))} />
                </Command.Group>
              )}

              <Command.Group heading="이동" className="cmd-group">
                <Item icon={<Home className="h-4 w-4" />} label="홈 — 모든 항목" onSelect={() => run(() => { setFilterType('all'); navigate('/home') })} />
                <Item icon={<Calendar className="h-4 w-4" />} label="캘린더" onSelect={() => run(() => navigate('/calendar'))} />
                <Item icon={<Users className="h-4 w-4 text-pink-500" />} label="가족 공동 항목" onSelect={() => run(() => { setFilterType('family'); navigate('/home') })} />
                <Item icon={<Target className="h-4 w-4" />} label="목표 & 시험" onSelect={() => run(() => { setFilterType('planning'); navigate('/home') })} />
                <Item icon={<PenLine className="h-4 w-4" />} label="새 항목 작성" onSelect={() => run(() => canWrite && navigate('/write'))} />
                <Item icon={<User className="h-4 w-4" />} label="내 정보" onSelect={() => run(() => navigate('/profile'))} />
                {isAdmin && <Item icon={<ShieldCheck className="h-4 w-4" />} label="관리자" onSelect={() => run(() => navigate('/admin'))} />}
              </Command.Group>

              <Command.Group heading="테마" className="cmd-group">
                <Item icon={<Sun className="h-4 w-4" />} label="라이트 모드" onSelect={() => run(() => setTheme('light'))} />
                <Item icon={<Moon className="h-4 w-4" />} label="다크 모드" onSelect={() => run(() => setTheme('dark'))} />
                <Item icon={<Monitor className="h-4 w-4" />} label="시스템 테마" onSelect={() => run(() => setTheme('system'))} />
              </Command.Group>

              <Command.Group heading="계정" className="cmd-group">
                <Item icon={<LogOut className="h-4 w-4" />} label="로그아웃" onSelect={() => run(async () => { await signOut(); navigate('/login') })} />
              </Command.Group>
            </Command.List>

            <div className="px-3 py-2 border-t border-border text-[10px] text-muted-foreground flex items-center justify-between">
              <span>↑↓ 이동 · ↵ 실행</span>
              <span>Cmd/Ctrl+K로 열기</span>
            </div>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

interface ItemProps {
  icon: React.ReactNode
  label: string
  hint?: string
  shortcut?: string
  onSelect: () => void
}

function Item({ icon, label, hint, shortcut, onSelect }: ItemProps) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer text-sm text-foreground data-[selected=true]:bg-muted aria-selected:bg-muted"
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      {shortcut && (
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
          {shortcut}
        </span>
      )}
    </Command.Item>
  )
}
