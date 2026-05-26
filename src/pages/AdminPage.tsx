import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, ArrowLeft, Users, Eye, Pencil, Check, X } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useDiaryStore } from '@/store/diary.store'
import type { Profile } from '@/types/auth'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

const GRADE_OPTIONS = [
  { value: 'adult', label: '어른' },
  { value: 'high', label: '고등학생' },
  { value: 'mid', label: '중학생' },
  { value: 'elem', label: '초등학생' },
]

const AVATARS = ['🙂', '😎', '🧑', '👧', '👦', '👨', '👩', '🦁', '🐯', '🐼', '🐸', '🌟', '🚀', '📚', '⚡']

const typeColors: Record<string, string> = {
  study: 'bg-blue-500', reading: 'bg-emerald-500', free: 'bg-amber-500',
  goal: 'bg-violet-500', exam: 'bg-rose-500', schedule: 'bg-sky-500', todo: 'bg-orange-500',
}
const typeLabels: Record<string, string> = {
  study: '공부', reading: '독서', free: '자유', goal: '목표',
  exam: '시험', schedule: '일정', todo: '할일',
}

export function AdminPage() {
  const navigate = useNavigate()
  const {
    profile: myProfile, viewMode, viewAsUserId, allProfiles,
    setViewMode, setViewAsUser, updateUserProfile, fetchAllProfiles,
  } = useAuthStore()
  const { entries, loadEntries } = useDiaryStore()

  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editGrade, setEditGrade] = useState('')
  const [editAvatar, setEditAvatar] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAllProfiles()
  }, [fetchAllProfiles])

  // viewAsUserId 변경 시 entries 리로드
  useEffect(() => {
    loadEntries()
  }, [loadEntries, viewAsUserId, viewMode])

  if (myProfile?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-60 gap-3">
        <ShieldCheck className="h-10 w-10 text-muted-foreground/60" />
        <p className="text-muted-foreground text-sm">관리자만 접근할 수 있습니다.</p>
      </div>
    )
  }

  const active = entries.filter((e) => !e.deletedAt)
  const trashed = entries.filter((e) => !!e.deletedAt)
  const today = format(new Date(), 'yyyy-MM-dd')

  const typeCounts = active.reduce<Record<string, number>>((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + 1
    return acc
  }, {})

  const startEdit = (p: Profile) => {
    setEditingUserId(p.id)
    setEditName(p.name)
    setEditGrade(p.grade ?? 'adult')
    setEditAvatar(p.avatar_emoji ?? '🙂')
  }

  const cancelEdit = () => setEditingUserId(null)

  const saveEdit = async () => {
    if (!editingUserId || !editName.trim()) return
    setSaving(true)
    await updateUserProfile(editingUserId, {
      name: editName.trim(),
      grade: editGrade,
      avatar_emoji: editAvatar,
    })
    setSaving(false)
    setEditingUserId(null)
  }

  const handleViewAsUser = (userId: string) => {
    if (viewAsUserId === userId) {
      setViewAsUser(null)
    } else {
      setViewAsUser(userId)
      if (viewMode !== 'admin') setViewMode('admin')
    }
  }

  const viewingAs = viewAsUserId
    ? allProfiles.find((p) => p.id === viewAsUserId)
    : null

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-violet-500" />관리자 대시보드
        </h1>
      </div>

      {/* View mode + viewing as banner */}
      <div className={cn(
        'rounded-2xl border p-4',
        viewMode === 'admin' ? 'bg-violet-500/10  border-violet-500/20' : 'bg-card border-border'
      )}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">관리자 모드</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {viewAsUserId && viewingAs
                ? `${viewingAs.avatar_emoji} ${viewingAs.name} 의 항목 보는 중`
                : viewMode === 'admin'
                ? '가족 전체 항목 보는 중'
                : '내 항목만 보는 중'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {viewAsUserId && (
              <button
                onClick={() => setViewAsUser(null)}
                className="text-xs px-2.5 py-1 rounded-lg bg-violet-500/15  text-violet-700 dark:text-violet-300 font-medium"
              >
                전체 보기로
              </button>
            )}
            <button
              onClick={() => { setViewMode(viewMode === 'admin' ? 'personal' : 'admin'); setViewAsUser(null) }}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                viewMode === 'admin' ? 'bg-violet-600' : 'bg-muted'
              )}
            >
              <span className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-card transition-transform shadow',
                viewMode === 'admin' ? 'translate-x-6' : 'translate-x-1'
              )} />
            </button>
          </div>
        </div>
      </div>

      {/* Family members */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Users className="h-4 w-4" />가족 구성원 관리
        </p>
        <div className="space-y-3">
          {allProfiles.map((p) => (
            <div
              key={p.id}
              className={cn(
                'border rounded-xl p-3 transition-colors',
                viewAsUserId === p.id ? 'border-violet-500/40 bg-violet-500/10' : 'border-border'
              )}
            >
              {editingUserId === p.id ? (
                /* 편집 모드 */
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5 mb-1">
                    {AVATARS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setEditAvatar(emoji)}
                        className={cn(
                          'text-xl w-8 h-8 rounded-lg flex items-center justify-center',
                          editAvatar === emoji ? 'bg-primary scale-110' : 'bg-muted hover:bg-muted'
                        )}
                      >{emoji}</button>
                    ))}
                  </div>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="이름"
                    className="w-full border border-input rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  {p.role !== 'admin' && (
                    <select
                      value={editGrade}
                      onChange={(e) => setEditGrade(e.target.value)}
                      className="w-full border border-input rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {GRADE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      disabled={saving}
                      className="flex items-center gap-1 px-3 py-1 bg-primary text-white rounded-lg text-xs font-medium"
                    >
                      <Check className="h-3 w-3" />{saving ? '저장 중...' : '저장'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1 px-3 py-1 bg-muted text-muted-foreground rounded-lg text-xs"
                    >
                      <X className="h-3 w-3" />취소
                    </button>
                  </div>
                </div>
              ) : (
                /* 보기 모드 */
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{p.avatar_emoji ?? '🙂'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{p.name}</span>
                      <span className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                        p.role === 'admin' ? 'bg-violet-500/15  text-violet-700 dark:text-violet-300' : 'bg-muted text-muted-foreground'
                      )}>
                        {p.role === 'admin' ? '관리자' : GRADE_OPTIONS.find((o) => o.value === p.grade)?.label ?? '사용자'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {active.filter((e) => (e as { user_id?: string }).user_id === p.id || true).length > 0
                        ? `항목 ${active.length}개 (전체 기준)`
                        : '항목 없음'}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleViewAsUser(p.id)}
                      title={viewAsUserId === p.id ? '전체 보기로' : `${p.name} 뷰로 보기`}
                      className={cn(
                        'p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors',
                        viewAsUserId === p.id
                          ? 'bg-violet-500/15  text-violet-700 dark:text-violet-300'
                          : 'hover:bg-muted text-muted-foreground'
                      )}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => startEdit(p)}
                      title="프로필 편집"
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <p className="text-sm font-semibold text-foreground mb-3">
          현황 {viewingAs ? `— ${viewingAs.name}` : viewMode === 'admin' ? '— 전체' : '— 내 항목'}
        </p>
        <div className="grid grid-cols-3 gap-3 text-center mb-4">
          <div>
            <p className="text-2xl font-bold text-foreground">{active.length}</p>
            <p className="text-xs text-muted-foreground">활성</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{trashed.length}</p>
            <p className="text-xs text-muted-foreground">삭제됨</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {active.filter((e) => e.date === today).length}
            </p>
            <p className="text-xs text-muted-foreground">오늘</p>
          </div>
        </div>

        <div className="space-y-2">
          {Object.entries(typeCounts).map(([type, count]) => (
            <div key={type} className="flex items-center gap-2">
              <span className={cn('w-2 h-2 rounded-full flex-shrink-0', typeColors[type] ?? 'bg-muted')} />
              <span className="text-xs text-muted-foreground w-14">{typeLabels[type] ?? type}</span>
              <div className="flex-1 bg-muted rounded-full h-1.5">
                <div
                  className={cn('h-1.5 rounded-full', typeColors[type] ?? 'bg-muted-foreground')}
                  style={{ width: `${active.length ? (count / active.length) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-muted rounded-2xl border border-border p-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          💡 <strong>👁 아이콘</strong>: 해당 가족 구성원의 시점으로 항목 확인<br />
          💡 <strong>✏️ 아이콘</strong>: 이름·학년·아바타 수정<br />
          💡 비밀번호 초기화: Supabase → Authentication → Users
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          마지막 로드: {format(new Date(), 'yyyy년 M월 d일 HH:mm', { locale: ko })}
        </p>
      </div>
    </div>
  )
}
