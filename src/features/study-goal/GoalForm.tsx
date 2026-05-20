import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { nanoid } from 'nanoid'
import { format, addDays } from 'date-fns'
import { Plus, X, Target } from 'lucide-react'
import { goalSchema, type GoalFormData } from './schema'
import { useDiaryStore } from '@/store/diary.store'
import type { StudyGoalEntry, GoalStep } from '@/types/diary'

const SUBJECTS = ['국어', '영어', '수학', '과학', '사회', '역사', '독서', '코딩']

interface Props {
  onSuccess: () => void
  onCancel: () => void
}

export function GoalForm({ onSuccess, onCancel }: Props) {
  const addEntry = useDiaryStore((s) => s.addEntry)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      targetDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
      steps: [{ text: '' }, { text: '' }, { text: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'steps' })

  const onSubmit = async (data: GoalFormData) => {
    const now = new Date().toISOString()
    const steps: GoalStep[] = data.steps
      .filter((s) => s.text.trim().length > 0)
      .map((s) => ({ id: nanoid(8), text: s.text.trim(), done: false }))

    const entry: StudyGoalEntry = {
      id: nanoid(),
      type: 'goal',
      date: format(new Date(), 'yyyy-MM-dd'),
      createdAt: now,
      updatedAt: now,
      title: data.title,
      subject: data.subject || undefined,
      targetDate: data.targetDate,
      description: data.description || undefined,
      steps,
      status: 'in_progress',
    }
    await addEntry(entry)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">
          <Target className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
          목표 제목
        </label>
        <input
          {...register('title')}
          placeholder="예: 이차방정식 마스터하기, 영단어 300개 외우기"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
      </div>

      {/* Subject (optional) */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">과목 (선택)</label>
        <div className="flex flex-wrap gap-1.5">
          <label className="cursor-pointer">
            <input type="radio" {...register('subject')} value="" defaultChecked className="peer sr-only" />
            <span className="inline-block px-3 py-1 rounded-full text-xs border border-zinc-200 peer-checked:bg-zinc-900 peer-checked:text-white peer-checked:border-zinc-900">
              없음
            </span>
          </label>
          {SUBJECTS.map((s) => (
            <label key={s} className="cursor-pointer">
              <input type="radio" {...register('subject')} value={s} className="peer sr-only" />
              <span className="inline-block px-3 py-1 rounded-full text-xs border border-zinc-200 peer-checked:bg-zinc-900 peer-checked:text-white peer-checked:border-zinc-900">
                {s}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Target date */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">목표일</label>
        <input
          type="date"
          {...register('targetDate')}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        {errors.targetDate && <p className="text-red-500 text-xs mt-1">{errors.targetDate.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">상세 설명 (선택)</label>
        <textarea
          {...register('description')}
          rows={2}
          placeholder="목표를 더 자세히..."
          className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      {/* Steps */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">세부 단계 (체크리스트)</label>
        <div className="space-y-2">
          {fields.map((field, idx) => (
            <div key={field.id} className="flex gap-2 items-center">
              <span className="text-xs text-zinc-400 w-6 flex-shrink-0">{idx + 1}.</span>
              <input
                {...register(`steps.${idx}.text`)}
                placeholder="이 목표를 위해 할 일..."
                className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <button
                type="button"
                onClick={() => remove(idx)}
                className="p-1.5 text-zinc-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ text: '' })}
            className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700"
          >
            <Plus className="h-3.5 w-3.5" />
            단계 추가
          </button>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-zinc-300 rounded-lg py-2 text-sm font-medium hover:bg-zinc-50 transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-violet-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
        >
          목표 만들기
        </button>
      </div>
    </form>
  )
}
