import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, ShieldCheck, User, Pencil, Check, X, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useDiaryStore } from '@/store/diary.store'
import { cn } from '@/lib/utils'
import { format, startOfMonth, endOfMonth } from 'date-fns'

const AVATARS = ['🙂', '😎', '🧑', '👧', '👦', '👨', '👩', '🦁', '🐯', '🐼', '🐸', '🌟', '🚀', '📚', '⚡']

const GRADE_OPTIONS = [
  { value: 'adult', label: '어른' },
  { value: 'high', label: '고등학생' },
  { value: 'mid', label: '중학생' },
  { value: 'elem', label: '초등학생' },
]

export function ProfilePage() {
  const navigate = useNavigate()
  const { profile, viewMode, setViewMode, signOut, updateAvatar, updateProfile, updatePassword } = useAuthStore()
  const { entries } = useDiaryStore()

  // 이름/학년 편집 상태
  const [editingInfo, setEditingInfo] = useState(false)
  const [editName, setEditName] = useState('')
  const [editGrade, setEditGrade] = useState('')
  const [savingInfo, setSavingInfo] = useState(false)
  const [infoMsg, setInfoMsg] = useState('')

  // 비번 변경 상태
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [savingPw, setSavingPw] = useState(false)
  const [pwMsg, setPwMsg] = useState('')

  const active = entries.filter((e) => !e.deletedAt)
  const now = new Date()
  const thisMonthStart = format(startOfMonth(now), 'yyyy-MM-dd')
  const thisMonthEnd = format(endOfMonth(now), 'yyyy-MM-dd')
  const thisMonth = active.filter((e) => e.date >= thisMonthStart && e.date <= thisMonthEnd)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const startEditInfo = () => {
    setEditName(profile?.name ?? '')
    setEditGrade(profile?.grade ?? 'adult')
    setEditingInfo(true)
    setInfoMsg('')
  }

  const cancelEditInfo = () => {
    setEditingInfo(false)
    setInfoMsg('')
  }

  const saveInfo = async () => {
    if (!editName.trim()) { setInfoMsg('이름을 입력하세요'); return }
    setSavingInfo(true)
    const result = await updateProfile(editName.trim(), editGrade)
    setSavingInfo(false)
    if (result?.error) {
      setInfoMsg('저장 실패: ' + result.error)
    } else {
      setEditingInfo(false)
      setInfoMsg('저장됨')
      setTimeout(() => setInfoMsg(''), 2000)
    }
  }

  const savePassword = async () => {
    if (newPassword.length < 6) { setPwMsg('6자 이상 입력하세요'); return }
    if (newPassword !== confirmPassword) { setPwMsg('비밀번호가 일치하지 않습니다'); return }
    setSavingPw(true)
    const result = await updatePassword(newPassword)
    setSavingPw(false)
    if (result?.error) {
      setPwMsg('변경 실패: ' + result.error)
    } else {
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordSection(false)
      setPwMsg('비밀번호가 변경되었습니다')
      setTimeout(() => setPwMsg(''), 3000)
    }
  }

  const gradeLabel = (g: string | null) => GRADE_OPTIONS.find((o) => o.value === g)?.label ?? '사용자'

  return (
    <div className="max-w-md mx-auto space-y-4 pb-4">
      <h1 className="text-lg font-bold text-foreground">내 정보</h1>

      {/* Profile card */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex items-start gap-4">
          <div className="text-5xl">{profile?.avatar_emoji ?? '🙂'}</div>
          <div className="flex-1 min-w-0">
            {editingInfo ? (
              <div className="space-y-2">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="이름"
                  className="w-full border border-input rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {profile?.role !== 'admin' && (
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
                    onClick={saveInfo}
                    disabled={savingInfo}
                    className="flex items-center gap-1 px-3 py-1 bg-primary text-white rounded-lg text-xs font-medium"
                  >
                    <Check className="h-3 w-3" />{savingInfo ? '저장 중...' : '저장'}
                  </button>
                  <button
                    onClick={cancelEditInfo}
                    className="flex items-center gap-1 px-3 py-1 bg-muted text-muted-foreground rounded-lg text-xs"
                  >
                    <X className="h-3 w-3" />취소
                  </button>
                </div>
                {infoMsg && <p className="text-xs text-muted-foreground">{infoMsg}</p>}
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold text-foreground">{profile?.name ?? '...'}</p>
                  <button
                    onClick={startEditInfo}
                    className="p-1 rounded-md hover:bg-muted text-muted-foreground"
                    title="이름/학년 수정"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn(
                    'inline-block text-xs px-2 py-0.5 rounded-full font-medium',
                    profile?.role === 'admin'
                      ? 'bg-violet-500/15  text-violet-700 dark:text-violet-300'
                      : 'bg-muted text-muted-foreground'
                  )}>
                    {profile?.role === 'admin' ? '👑 관리자' : gradeLabel(profile?.grade ?? null)}
                  </span>
                </div>
                {infoMsg && <p className="text-xs text-emerald-600 mt-1">{infoMsg}</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-2xl border border-border p-4 text-center">
          <p className="text-3xl font-bold text-foreground">{active.length}</p>
          <p className="text-xs text-muted-foreground mt-1">전체 항목</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 text-center">
          <p className="text-3xl font-bold text-foreground">{thisMonth.length}</p>
          <p className="text-xs text-muted-foreground mt-1">이번 달</p>
        </div>
      </div>

      {/* Avatar picker */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <p className="text-sm font-semibold text-foreground mb-3">아바타 변경</p>
        <div className="flex flex-wrap gap-2">
          {AVATARS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => updateAvatar(emoji)}
              className={cn(
                'text-2xl w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                profile?.avatar_emoji === emoji
                  ? 'bg-primary scale-110'
                  : 'bg-muted hover:bg-muted'
              )}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Admin mode */}
      {profile?.role === 'admin' && (
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-violet-500" />관리자 기능
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">관리자 모드</p>
              <p className="text-xs text-muted-foreground">ON: 가족 전체 항목 보기</p>
            </div>
            <button
              onClick={() => setViewMode(viewMode === 'admin' ? 'personal' : 'admin')}
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
          <button
            onClick={() => navigate('/admin')}
            className="mt-3 w-full text-sm text-violet-600 hover:text-violet-700 font-medium text-left"
          >
            관리자 대시보드 →
          </button>
        </div>
      )}

      {/* Account settings */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <User className="h-4 w-4" />계정 설정
        </p>

        {/* Password change */}
        <button
          onClick={() => { setShowPasswordSection(!showPasswordSection); setPwMsg('') }}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-muted transition-colors"
        >
          <span>비밀번호 변경</span>
          <span className="text-xs text-muted-foreground">{showPasswordSection ? '닫기' : '변경'}</span>
        </button>

        {showPasswordSection && (
          <div className="mt-2 space-y-2 px-1">
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="새 비밀번호 (6자 이상)"
                className="w-full border border-input rounded-lg px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-2 top-2 text-muted-foreground"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <input
              type={showPw ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호 확인"
              className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {pwMsg && (
              <p className={cn('text-xs', pwMsg.includes('변경') ? 'text-emerald-600' : 'text-red-500')}>
                {pwMsg}
              </p>
            )}
            <button
              onClick={savePassword}
              disabled={savingPw}
              className="w-full bg-primary text-white rounded-lg py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {savingPw ? '변경 중...' : '비밀번호 변경'}
            </button>
          </div>
        )}

        <div className="mt-2 border-t border-border pt-2">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-500/100/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            로그아웃
          </button>
        </div>
      </div>
    </div>
  )
}
