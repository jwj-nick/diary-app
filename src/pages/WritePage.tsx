import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDiaryStore } from '@/store/diary.store'
import { useAuthStore } from '@/store/auth.store'
import { StudyLogForm } from '@/features/study-log/StudyLogForm'
import { ReadingLogForm } from '@/features/reading-log/ReadingLogForm'
import { FreeDiaryForm } from '@/features/free-diary/FreeDiaryForm'
import { GoalForm } from '@/features/study-goal/GoalForm'
import { ExamForm } from '@/features/exam/ExamForm'
import { ScheduleForm } from '@/features/schedule/ScheduleForm'
import { TodoForm } from '@/features/todo/TodoForm'
import { cn } from '@/lib/utils'

type Tab = 'study' | 'reading' | 'free' | 'goal' | 'exam' | 'schedule' | 'todo'

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'study', label: '공부', emoji: '📚' },
  { id: 'reading', label: '독서', emoji: '📖' },
  { id: 'free', label: '자유', emoji: '✏️' },
  { id: 'schedule', label: '일정', emoji: '📅' },
  { id: 'todo', label: '할일', emoji: '☑️' },
  { id: 'goal', label: '목표', emoji: '🎯' },
  { id: 'exam', label: '시험', emoji: '📝' },
]

export function WritePage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const editId = params.get('id')
  const { entries } = useDiaryStore()
  const { viewAsUserId } = useAuthStore()

  const editEntry = editId ? entries.find((e) => e.id === editId) : undefined
  const isEdit = !!editEntry
  const defaultDate = params.get('date') ?? undefined

  const initialTab: Tab =
    editEntry?.type ?? (params.get('type') as Tab | null) ?? 'study'
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)

  if (viewAsUserId) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 space-y-3">
        <div className="text-5xl">👁</div>
        <h1 className="text-base font-semibold text-foreground">조회 전용 모드</h1>
        <p className="text-sm text-muted-foreground">
          다른 가족 시점으로 보는 중에는 항목을 작성/수정할 수 없습니다.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-2 text-sm text-foreground underline hover:text-foreground"
        >
          돌아가기
        </button>
      </div>
    )
  }

  if (editId && !editEntry) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 space-y-3">
        <p className="text-sm text-muted-foreground">해당 항목을 찾을 수 없습니다.</p>
        <button onClick={() => navigate('/')} className="text-sm text-foreground underline">
          홈으로
        </button>
      </div>
    )
  }

  const handleSuccess = () => navigate(-1)
  const handleCancel = () => navigate(-1)

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-lg font-semibold text-foreground mb-4">
        {isEdit ? '항목 수정' : '새 항목 작성'}
      </h1>

      {!isEdit && (
        <div className="flex gap-1 bg-muted p-1 rounded-xl mb-6 overflow-x-auto scrollbar-none">
          {TABS.map(({ id, label, emoji }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex-shrink-0 flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-sm font-medium transition-all',
                activeTab === id
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span>{emoji}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="bg-card rounded-xl border border-border p-5">
        {activeTab === 'study' && (
          <StudyLogForm
            entry={editEntry?.type === 'study' ? editEntry : undefined}
            defaultDate={defaultDate}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
        {activeTab === 'reading' && (
          <ReadingLogForm
            entry={editEntry?.type === 'reading' ? editEntry : undefined}
            defaultDate={defaultDate}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
        {activeTab === 'free' && (
          <FreeDiaryForm
            entry={editEntry?.type === 'free' ? editEntry : undefined}
            defaultDate={defaultDate}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
        {activeTab === 'goal' && (
          <GoalForm
            entry={editEntry?.type === 'goal' ? editEntry : undefined}
            defaultDate={defaultDate}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
        {activeTab === 'exam' && (
          <ExamForm
            entry={editEntry?.type === 'exam' ? editEntry : undefined}
            defaultDate={defaultDate}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
        {activeTab === 'schedule' && (
          <ScheduleForm
            entry={editEntry?.type === 'schedule' ? editEntry : undefined}
            defaultDate={defaultDate}
            onSaved={handleSuccess}
          />
        )}
        {activeTab === 'todo' && (
          <TodoForm
            entry={editEntry?.type === 'todo' ? editEntry : undefined}
            defaultDate={defaultDate}
            onSaved={handleSuccess}
          />
        )}
      </div>
    </div>
  )
}
