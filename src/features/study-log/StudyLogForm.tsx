import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as Select from '@radix-ui/react-select'
import { ChevronDown } from 'lucide-react'
import { nanoid } from 'nanoid'
import { format } from 'date-fns'
import { studySchema, type StudyFormData } from './schema'
import { useDiaryStore } from '@/store/diary.store'
import type { StudyEntry, Understanding } from '@/types/diary'
import { cn } from '@/lib/utils'

const SUBJECTS = ['국어', '영어', '수학', '과학', '사회', '역사', '독서', '코딩', '직접입력']
const DURATIONS = [
  { label: '15분', value: 15 },
  { label: '30분', value: 30 },
  { label: '45분', value: 45 },
  { label: '60분', value: 60 },
  { label: '90분', value: 90 },
  { label: '120분', value: 120 },
  { label: '직접입력', value: 0 },
]
const UNDERSTANDING_EMOJIS: { value: Understanding; emoji: string; label: string }[] = [
  { value: 1, emoji: '😵', label: '어려워요' },
  { value: 2, emoji: '🤔', label: '조금 어려워요' },
  { value: 3, emoji: '🙂', label: '잘 했어요' },
  { value: 4, emoji: '😎', label: '완벽해요' },
]

interface Props {
  onSuccess: () => void
  onCancel: () => void
}

export function StudyLogForm({ onSuccess, onCancel }: Props) {
  const addEntry = useDiaryStore((s) => s.addEntry)
  const [showCustomSubject, setShowCustomSubject] = useState(false)
  const [showCustomDuration, setShowCustomDuration] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StudyFormData>({
    resolver: zodResolver(studySchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      understanding: 3,
      durationMinutes: 30,
    },
  })

  const understanding = watch('understanding')

  const onSubmit = async (data: StudyFormData) => {
    const subjectValue = data.subject === '직접입력' ? (data.customSubject ?? '') : data.subject
    const now = new Date().toISOString()
    const entry: StudyEntry = {
      id: nanoid(),
      type: 'study',
      date: data.date,
      createdAt: now,
      updatedAt: now,
      subject: subjectValue,
      topic: data.topic,
      durationMinutes: data.durationMinutes,
      understanding: data.understanding as Understanding,
      note: data.note || undefined,
      questions: data.questions || undefined,
    }
    await addEntry(entry)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">과목</label>
        <Controller
          name="subject"
          control={control}
          render={({ field }) => (
            <Select.Root
              value={field.value}
              onValueChange={(val) => {
                field.onChange(val)
                setShowCustomSubject(val === '직접입력')
              }}
            >
              <Select.Trigger className="flex items-center justify-between w-full border rounded-lg px-3 py-2 text-sm bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <Select.Value placeholder="과목을 선택해주세요" />
                <Select.Icon><ChevronDown className="h-4 w-4 text-zinc-400" /></Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content className="bg-white border rounded-lg shadow-lg z-50 overflow-hidden">
                  <Select.Viewport className="p-1">
                    {SUBJECTS.map((s) => (
                      <Select.Item
                        key={s}
                        value={s}
                        className="flex items-center px-3 py-2 text-sm rounded cursor-pointer hover:bg-zinc-100 focus:bg-zinc-100 outline-none"
                      >
                        <Select.ItemText>{s}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          )}
        />
        {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
        {showCustomSubject && (
          <input
            {...register('customSubject')}
            placeholder="과목명을 입력해주세요"
            className="mt-2 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
      </div>

      {/* Topic */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">단원 / 주제</label>
        <input
          {...register('topic')}
          placeholder="예: 2차 방정식, 광합성, 조선 건국..."
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.topic && <p className="text-red-500 text-xs mt-1">{errors.topic.message}</p>}
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">공부 시간</label>
        <Controller
          name="durationMinutes"
          control={control}
          render={({ field }) => (
            <Select.Root
              value={String(field.value)}
              onValueChange={(val) => {
                const num = parseInt(val, 10)
                if (num === 0) {
                  setShowCustomDuration(true)
                  field.onChange(0)
                } else {
                  setShowCustomDuration(false)
                  field.onChange(num)
                }
              }}
            >
              <Select.Trigger className="flex items-center justify-between w-full border rounded-lg px-3 py-2 text-sm bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <Select.Value placeholder="공부 시간 선택" />
                <Select.Icon><ChevronDown className="h-4 w-4 text-zinc-400" /></Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content className="bg-white border rounded-lg shadow-lg z-50 overflow-hidden">
                  <Select.Viewport className="p-1">
                    {DURATIONS.map((d) => (
                      <Select.Item
                        key={d.value}
                        value={String(d.value)}
                        className="flex items-center px-3 py-2 text-sm rounded cursor-pointer hover:bg-zinc-100 focus:bg-zinc-100 outline-none"
                      >
                        <Select.ItemText>{d.label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          )}
        />
        {showCustomDuration && (
          <input
            type="number"
            min={1}
            placeholder="분 단위로 입력"
            className="mt-2 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setValue('durationMinutes', parseInt(e.target.value, 10) || 1)}
          />
        )}
      </div>

      {/* Understanding */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">이해도</label>
        <div className="flex gap-2">
          {UNDERSTANDING_EMOJIS.map(({ value, emoji, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue('understanding', value)}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl border-2 transition-all',
                understanding === value
                  ? 'border-blue-500 bg-blue-50 scale-105'
                  : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
              )}
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-xs text-zinc-600">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">날짜</label>
        <input
          type="date"
          {...register('date')}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Note */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">메모 (선택)</label>
        <textarea
          {...register('note')}
          rows={3}
          placeholder="오늘 공부한 내용을 간단히 정리해보세요..."
          className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Questions */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">궁금한 점 (선택)</label>
        <textarea
          {...register('questions')}
          rows={2}
          placeholder="아직 이해 안 된 것, 더 알고 싶은 것..."
          className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
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
          className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          저장하기
        </button>
      </div>
    </form>
  )
}
