import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { nanoid } from 'nanoid'
import { format, addDays } from 'date-fns'
import { Plus, X, FileText } from 'lucide-react'
import { examSchema, type ExamFormData } from './schema'
import { useDiaryStore } from '@/store/diary.store'
import type { ExamEntry, ExamKind, PrepStep } from '@/types/diary'

const SUBJECTS = ['국어', '영어', '수학', '과학', '사회', '역사', '독서', '코딩']
const EXAM_KINDS: { value: ExamKind; label: string }[] = [
  { value: 'midterm', label: '중간고사' },
  { value: 'final', label: '기말고사' },
  { value: 'performance', label: '수행평가' },
  { value: 'quiz', label: '쪽지/단원평가' },
  { value: 'other', label: '기타' },
]

interface Props {
  onSuccess: () => void
  onCancel: () => void
}

export function ExamForm({ onSuccess, onCancel }: Props) {
  const addEntry = useDiaryStore((s) => s.addEntry)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      examDate: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
      examKind: 'performance',
      prepSteps: [{ text: '', dueDate: '' }, { text: '', dueDate: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'prepSteps' })

  const onSubmit = async (data: ExamFormData) => {
    const now = new Date().toISOString()
    const prepSteps: PrepStep[] = data.prepSteps
      .filter((s) => s.text.trim().length > 0)
      .map((s) => ({
        id: nanoid(8),
        text: s.text.trim(),
        dueDate: s.dueDate || undefined,
        done: false,
      }))

    const entry: ExamEntry = {
      id: nanoid(),
      type: 'exam',
      date: format(new Date(), 'yyyy-MM-dd'),
      createdAt: now,
      updatedAt: now,
      title: data.title,
      subject: data.subject,
      examDate: data.examDate,
      examKind: data.examKind,
      scope: data.scope || undefined,
      prepSteps,
    }
    await addEntry(entry)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">
          <FileText className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
          시험 이름
        </label>
        <input
          {...register('title')}
          placeholder="예: 1학기 중간고사, 과학 수행평가 — 화학 단원"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
      </div>

      {/* Kind */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">종류</label>
        <div className="flex flex-wrap gap-1.5">
          {EXAM_KINDS.map(({ value, label }) => (
            <label key={value} className="cursor-pointer">
              <input type="radio" {...register('examKind')} value={value} className="peer sr-only" />
              <span className="inline-block px-3 py-1 rounded-full text-xs border border-zinc-200 peer-checked:bg-rose-500 peer-checked:text-white peer-checked:border-rose-500">
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">과목</label>
        <div className="flex flex-wrap gap-1.5">
          {SUBJECTS.map((s) => (
            <label key={s} className="cursor-pointer">
              <input type="radio" {...register('subject')} value={s} className="peer sr-only" />
              <span className="inline-block px-3 py-1 rounded-full text-xs border border-zinc-200 peer-checked:bg-zinc-900 peer-checked:text-white peer-checked:border-zinc-900">
                {s}
              </span>
            </label>
          ))}
        </div>
        {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
      </div>

      {/* Exam date */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">시험일</label>
        <input
          type="date"
          {...register('examDate')}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
        {errors.examDate && <p className="text-red-500 text-xs mt-1">{errors.examDate.message}</p>}
      </div>

      {/* Scope */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">시험 범위 (선택)</label>
        <textarea
          {...register('scope')}
          rows={2}
          placeholder="예: 교과서 1단원 ~ 3단원, 함수와 그래프..."
          className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
      </div>

      {/* Prep steps */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">준비 단계</label>
        <div className="space-y-2">
          {fields.map((field, idx) => (
            <div key={field.id} className="flex gap-2 items-center">
              <span className="text-xs text-zinc-400 w-6 flex-shrink-0">{idx + 1}.</span>
              <input
                {...register(`prepSteps.${idx}.text`)}
                placeholder="준비할 내용..."
                className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <input
                type="date"
                {...register(`prepSteps.${idx}.dueDate`)}
                title="단계별 목표일 (선택)"
                className="border rounded-lg px-2 py-1.5 text-xs w-32 focus:outline-none focus:ring-2 focus:ring-rose-500"
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
            onClick={() => append({ text: '', dueDate: '' })}
            className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700"
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
          className="flex-1 bg-rose-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-rose-700 disabled:opacity-50 transition-colors"
        >
          시험 등록
        </button>
      </div>
    </form>
  )
}
