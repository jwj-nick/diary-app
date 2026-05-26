import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await signIn(email.trim(), password)
    setLoading(false)
    if (result.error) {
      setError('이메일 또는 비밀번호를 확인해주세요.')
    } else {
      navigate('/', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📓</div>
          <h1 className="text-2xl font-bold text-foreground">가족 일기장</h1>
          <p className="text-sm text-muted-foreground mt-1">우리 가족 플래너 & 다이어리</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl shadow-sm border border-border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 주소"
              required
              autoComplete="email"
              className="w-full px-3.5 py-3 rounded-xl border border-input bg-muted text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">비밀번호</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
                required
                autoComplete="current-password"
                className="w-full px-3.5 py-3 rounded-xl border border-input bg-muted text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs px-1"
              >
                {showPw ? '숨기기' : '보기'}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          계정이 없으면 아빠에게 문의하세요 🙂
        </p>
      </div>
    </div>
  )
}
