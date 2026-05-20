import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StudyLogForm } from '@/features/study-log/StudyLogForm'
import { ReadingLogForm } from '@/features/reading-log/ReadingLogForm'
import { FreeDiaryForm } from '@/features/free-diary/FreeDiaryForm'
import { GoalForm } from '@/features/study-goal/GoalForm'
import { ExamForm } from '@/features/exam/ExamForm'
import { cn } from '@/lib/utils'

type Tab = 'study' | 'reading' | 'free' | 'goal' | 'exam'

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'study', label: '공부', emoji: '📚' },
  { id: 'goal', label: '목표', emoji: '🎯' },
  { id: 'exam', label: '시험', emoji: '📝' },
  { id: 'reading', label: '독서', emoji: '📖' },
  { id: 'free', label: '자유', emoji: '✏️' },
]

export function WritePage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const initial = (params.get('type') as Tab | null) ?? 'study'
  const [activeTab, setActiveTab] = useState<Tab>(initial)

  const handleSuccess = () => navigate('/')
  const handleCancel = () => navigate('/')

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-lg font-semibold text-zinc-900 mb-4">새 일기 / 계획</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-100 p-1 rounded-xl mb-6 overflow-x-auto">
        {TABS.map(({ id, label, emoji }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex-1 min-w-[3rem] flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
              activeTab === id
                ? 'bg-white shadow-sm text-zinc-900'
                : 'text-zinc-500 hover:text-zinc-700'
            )}
          >
            <span>{emoji}</span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5">
        {activeTab === 'study' && <StudyLogForm onSuccess={handleSuccess} onCancel={handleCancel} />}
        {activeTab === 'reading' && <ReadingLogForm onSuccess={handleSuccess} onCancel={handleCancel} />}
        {activeTab === 'free' && <FreeDiaryForm onSuccess={handleSuccess} onCancel={handleCancel} />}
        {activeTab === 'goal' && <GoalForm onSuccess={handleSuccess} onCancel={handleCancel} />}
        {activeTab === 'exam' && <ExamForm onSuccess={handleSuccess} onCancel={handleCancel} />}
      </div>
    </div>
  )
}
