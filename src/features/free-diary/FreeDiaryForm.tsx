import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { nanoid } from 'nanoid'
import { format } from 'date-fns'
import { freeDiarySchema, type FreeDiaryFormData } from './schema'
import { useDiaryStore } from '@/store/diary.store'
import type { FreeDiaryEntry } from '@/types/diary'

interface Props {
  onSuccess: () => void
  onCancel: () => void
  entry?: FreeDiaryEntry
  defaultDate?: string
}

export function FreeDiaryForm({ onSuccess, onCancel, entry, defaultDate }: Props) {
  const { addEntry, updateEntry } = useDiaryStore()
  const isEdit = !!entry

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FreeDiaryFormData>({
    resolver: zodResolver(freeDiarySchema),
    defaultValues: entry
      ? { date: entry.date, title: entry.title ?? '', body: entry.body }
      : { date: defaultDate ?? format(new Date(), 'yyyy-MM-dd') },
  })

  const onSubmit = async (data: FreeDiaryFormData) => {
    const now = new Date().toISOString()
    if (isEdit && entry) {
      const updated: FreeDiaryEntry = {
        ...entry,
        date: data.date,
        title: data.title || undefined,
        body: data.body,
        updatedAt: now,
      }
      await updateEntry(updated)
    } else {
      const newEntry: FreeDiaryEntry = {
        id: nanoid(),
        type: 'free',
        date: data.date,
        createdAt: now,
        updatedAt: now,
        title: data.title || undefined,
        body: data.body,
      }
      await addEntry(newEntry)
    }
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Title */}
      <div>
        <input
          {...register('title')}
          placeholder="제목 (선택)"
          className="w-full border rounded-lg px-3 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 bg-transparent"
        />
      </div>

      {/* Body */}
      <div>
        <textarea
          {...register('body')}
          rows={10}
          placeholder="오늘의 이야기를 써보세요... (마크다운 지원)"
          className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        {errors.body && <p className="text-red-500 text-xs mt-1">{errors.body.message}</p>}
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">날짜</label>
        <input
          type="date"
          {...register('date')}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-input rounded-lg py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-amber-500 text-white rounded-lg py-2 text-sm font-medium hover:bg-amber-600 disabled:opacity-50 transition-colors"
        >
          {isEdit ? '수정 저장' : '저장하기'}
        </button>
      </div>
    </form>
  )
}
