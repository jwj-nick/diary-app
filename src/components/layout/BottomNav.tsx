import { useNavigate, useLocation } from 'react-router-dom'
import { Home, PenLine, Calendar, User, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'

export function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { profile, viewAsUserId } = useAuthStore()
  const isAdmin = profile?.role === 'admin'
  const canWrite = !viewAsUserId

  const items = [
    { path: '/home', icon: Home, label: '홈', disabled: false },
    { path: '/write', icon: PenLine, label: '쓰기', disabled: !canWrite },
    { path: '/calendar', icon: Calendar, label: '캘린더', disabled: false },
    { path: '/profile', icon: User, label: '내 정보', disabled: false },
    ...(isAdmin ? [{ path: '/admin', icon: ShieldCheck, label: '관리', disabled: false }] : []),
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 z-40 md:hidden">
      <div className="flex items-center justify-around px-2 pb-safe">
        {items.map(({ path, icon: Icon, label, disabled }) => {
          const active = pathname === path
          return (
            <button
              key={path}
              onClick={() => !disabled && navigate(path)}
              disabled={disabled}
              className={cn(
                'flex flex-col items-center gap-0.5 py-2 px-3 min-w-[56px] rounded-xl transition-colors',
                disabled
                  ? 'text-zinc-200 cursor-not-allowed'
                  : active
                  ? 'text-zinc-900'
                  : 'text-zinc-400'
              )}
            >
              <Icon className={cn('h-5 w-5', active && !disabled && 'stroke-[2.5]')} />
              <span className={cn('text-[10px]', active && !disabled ? 'font-semibold' : 'font-normal')}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
