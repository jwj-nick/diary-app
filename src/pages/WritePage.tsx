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
import { AnniversaryForm } from '@/features/anniversary/AnniversaryForm'
import { cn } from '@/lib/utils'

type TopTab = 'study' | 'record' | 'target' | 'event' | 'todo'
type SubType =
  | 'study'
  | 'reading'
  | 'free'
  | 'goal'
  | 'exam'
  | 'schedule'
  | 'anniversary'
  | 'todo'

const TOP_TABS: { id: TopTab; label: string; emoji: string }[] = [
  { id: 'study', label: '공부', emoji: '📚' },
  { id: 'record', label: '기록', emoji: '📖' },
  { id: 'target', label: '목표', emoji: '🎯' },
  { id: 'event', label: '일정', emoji: '📅' },
  { id: 'todo', label: '할일', emoji: '☑️' },
]

const SUB_TABS: Record<TopTab, { id: SubType; label: string; emoji: string }[]> = {
  study: [{ id: 'study', label: '공부', emoji: '📚' }],
  record: [
    { id: 'reading', label: '독서', emoji: '📖' },
    { id: 'free', label: '자유', emoji: '✏️' },
  ],
  target: [
    { id: 'goal', label: '목표', emoji: '🎯' },
    { id: 'exam', label: '시험', emoji: '📝' },
  ],
  event: [
    { id: 'schedule', label: '일정', emoji: '📅' },
    { id: 'anniversary', label: '기념일', emoji: '🎂' },
  ],
  todo: [{ id: 'todo', label: '할일', emoji: '☑️' }],
}

function getTopFromSub(t: SubType): TopTab {
  if (t === 'study') return 'study'
  if (t === 'reading' || t === 'free') return 'record'
  if (t === 'goal' || t === 'exam') return 'target'
  if (t === 'schedule' || t === 'anniversary') return 'event'
  return 'todo'
}

export function WritePage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const editId = params.get('id')
  const { entries } = useDiaryStore()
  const { viewAsUserId } = useAuthStore()

  const editEntry = editId ? entries.find((e) => e.id === editId) : undefined
  const isEdit = !!editEntry
  const defaultDate = params.get('date') ?? undefined

  // 초기 sub-type: edit 모드면 entry.type, 아니면 URL의 type 파라미터, 아니면 'study'
  const queryType = params.get('type') as SubType | null
  const initialSub: SubType = (editEntry?.type ?? queryType ?? 'study') as SubType
  const initialTop: TopTab = getTopFromSub(initialSub)

  const [activeTop, setActiveTop] = useState<TopTab>(initialTop)
  const [activeSub, setActiveSub] = useState<SubType>(initialSub)

  const handleTopChange = (top: TopTab) => {
    setActiveTop(top)
    // 그룹 첫 sub로 자동 전환 (단일 그룹이면 그대로)
    const firstSub = SUB_TABS[top][0].id
    setActiveSub(firstSub)
  }

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

  const subTabs = SUB_TABS[activeTop]
  const showSubTabs = !isEdit && subTabs.length > 1

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-6">
        {isEdit ? '항목 수정' : '새 항목 작성'}
      </h1>

      {!isEdit && (
        <>
          {/* Top 5-tab — 한 줄에 들어감 */}
          <div className="flex gap-1 bg-muted p-1 rounded-xl mb-3">
            {TOP_TABS.map(({ id, label, emoji }) => (
              <button
                key={id}
                onClick={() => handleTopChange(id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-sm font-medium transition-all',
                  activeTop === id
                    ? 'bg-card shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <span>{emoji}</span>
                <span className="hidden xs:inline sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Sub-tab pill — 2개 이상일 때만 (record/target/event) */}
          {showSubTabs && (
            <div className="flex gap-2 mb-6">
              {subTabs.map(({ id, label, emoji }) => (
                <button
                  key={id}
                  onClick={() => setActiveSub(id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                    activeSub === id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-muted-foreground border-border hover:text-foreground'
                  )}
                >
                  <span>{emoji}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )}

          {!showSubTabs && <div className="mb-6" />}
        </>
      )}

      <div className="bg-card rounded-2xl border border-border p-5 md:p-6">
        {activeSub === 'study' && (
          <StudyLogForm
            entry={editEntry?.type === 'study' ? editEntry : undefined}
            defaultDate={defaultDate}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
        {activeSub === 'reading' && (
          <ReadingLogForm
            entry={editEntry?.type === 'reading' ? editEntry : undefined}
            defaultDate={defaultDate}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
        {activeSub === 'free' && (
          <FreeDiaryForm
            entry={editEntry?.type === 'free' ? editEntry : undefined}
            defaultDate={defaultDate}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
        {activeSub === 'goal' && (
          <GoalForm
            entry={editEntry?.type === 'goal' ? editEntry : undefined}
            defaultDate={defaultDate}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
        {activeSub === 'exam' && (
          <ExamForm
            entry={editEntry?.type === 'exam' ? editEntry : undefined}
            defaultDate={defaultDate}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
        {activeSub === 'schedule' && (
          <ScheduleForm
            entry={editEntry?.type === 'schedule' ? editEntry : undefined}
            defaultDate={defaultDate}
            onSaved={handleSuccess}
          />
        )}
        {activeSub === 'todo' && (
          <TodoForm
            entry={editEntry?.type === 'todo' ? editEntry : undefined}
            defaultDate={defaultDate}
            onSaved={handleSuccess}
          />
        )}
        {activeSub === 'anniversary' && (
          <AnniversaryForm
            entry={editEntry?.type === 'anniversary' ? editEntry : undefined}
            defaultDate={defaultDate}
            onSaved={handleSuccess}
          />
        )}
      </div>
    </div>
  )
}
