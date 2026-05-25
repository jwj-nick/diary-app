import { useNavigate } from 'react-router-dom'
import { ShieldCheck, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useDiaryStore } from '@/store/diary.store'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export function AdminPage() {
  const navigate = useNavigate()
  const { profile: myProfile, viewMode, setViewMode } = useAuthStore()
  const { entries } = useDiaryStore()

  if (myProfile?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-60 gap-3">
        <ShieldCheck className="h-10 w-10 text-zinc-300" />
        <p className="text-zinc-500 text-sm">관리자만 접근할 수 있습니다.</p>
      </div>
    )
  }

  const active = entries.filter((e) => !e.deletedAt)
  const trashed = entries.filter((e) => !!e.deletedAt)
  const now = format(new Date(), 'yyyy-MM-dd')

  const typeColors: Record<string, string> = {
    study: 'bg-blue-500',
    reading: 'bg-emerald-500',
    free: 'bg-amber-500',
    goal: 'bg-violet-500',
    exam: 'bg-rose-500',
    schedule: 'bg-sky-500',
    todo: 'bg-orange-500',
  }

  const typeLabels: Record<string, string> = {
    study: '공부', reading: '독서', free: '자유', goal: '목표',
    exam: '시험', schedule: '일정', todo: '할일',
  }

  const typeCounts = active.reduce<Record<string, number>>((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-violet-500" />관리자 대시보드
        </h1>
      </div>

      {/* View mode toggle */}
      <div className={cn(
        'rounded-2xl border p-4 flex items-center justify-between',
        viewMode === 'admin' ? 'bg-violet-50 border-violet-200' : 'bg-white border-zinc-200'
      )}>
        <div>
          <p className="text-sm font-semibold text-zinc-800">관리자 모드</p>
          <p className="text-xs text-zinc-500 mt-0.5">
            {viewMode === 'admin' ? '가족 전체 항목을 보는 중' : '내 항목만 보는 중'}
          </p>
        </div>
        <button
          onClick={() => setViewMode(viewMode === 'admin' ? 'personal' : 'admin')}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            viewMode === 'admin' ? 'bg-violet-600' : 'bg-zinc-200'
          )}
        >
          <span className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow',
            viewMode === 'admin' ? 'translate-x-6' : 'translate-x-1'
          )} />
        </button>
      </div>

      {/* Total stats */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4">
        <p className="text-sm font-semibold text-zinc-700 mb-3">전체 현황</p>
        <div className="grid grid-cols-3 gap-3 text-center mb-4">
          <div>
            <p className="text-2xl font-bold text-zinc-900">{active.length}</p>
            <p className="text-xs text-zinc-500">활성 항목</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-900">{trashed.length}</p>
            <p className="text-xs text-zinc-500">삭제됨</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-900">
              {active.filter((e) => e.date === now).length}
            </p>
            <p className="text-xs text-zinc-500">오늘</p>
          </div>
        </div>

        {/* Type breakdown */}
        <div className="space-y-2">
          {Object.entries(typeCounts).map(([type, count]) => (
            <div key={type} className="flex items-center gap-2">
              <span className={cn('w-2 h-2 rounded-full flex-shrink-0', typeColors[type] ?? 'bg-zinc-300')} />
              <span className="text-xs text-zinc-600 w-12">{typeLabels[type] ?? type}</span>
              <div className="flex-1 bg-zinc-100 rounded-full h-1.5">
                <div
                  className={cn('h-1.5 rounded-full', typeColors[type] ?? 'bg-zinc-400')}
                  style={{ width: `${active.length ? (count / active.length) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs text-zinc-400 w-6 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Info box */}
      <div className="bg-zinc-50 rounded-2xl border border-zinc-200 p-4">
        <p className="text-xs text-zinc-500 leading-relaxed">
          💡 관리자 모드를 켜면 가족 모두의 항목이 보입니다.<br />
          백업: Supabase 대시보드 → Table Editor → CSV export<br />
          계정 관리: Supabase 대시보드 → Authentication → Users
        </p>
        <p className="text-xs text-zinc-400 mt-2">
          마지막 데이터 로드: {format(new Date(), 'yyyy년 M월 d일 HH:mm', { locale: ko })}
        </p>
      </div>
    </div>
  )
}
