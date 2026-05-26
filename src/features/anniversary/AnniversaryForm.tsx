import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { nanoid } from 'nanoid'
import { Cake, Users } from 'lucide-react'
import { anniversarySchema, type AnniversaryFormData } from './schema'
import { useDiaryStore } from '@/store/diary.store'
import type { AnniversaryEntry } from '@/types/diary'
import { cn } from '@/lib/utils'

interface Props {
  onSaved?: () => void
  entry?: AnniversaryEntry
  defaultDate?: string
}

export function AnniversaryForm({ onSaved, entry, defaultDate }: Props) {
  const { addEntry, updateEntry } = useDiaryStore()
  const isEdit = !!entry

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<AnniversaryFormData>({
    resolver: zodResolver(anniversarySchema),
    defaultValues: entry
      ? {
          title: entry.title,
          anniversaryDate: entry.anniversaryDate,
          recurring: entry.recurring,
          description: entry.description ?? '',
        }
      : {
          anniversaryDate: defaultDate ?? format(new Date(), 'yyyy-MM-dd'),
          recurring: true,
        },
  })

  const recurring = watch('recurring')

  const onSubmit = async (data: AnniversaryFormData) => {
    const now = new Date().toISOString()
    if (isEdit && entry) {
      const updated: AnniversaryEntry = {
        ...entry,
        title: data.title,
        date: data.anniversaryDate,
        anniversaryDate: data.anniversaryDate,
        recurring: data.recurring,
        description: data.description || undefined,
        visibility: 'family',
        updatedAt: now,
      }
      await updateEntry(updated)
    } else {
      const newEntry: AnniversaryEntry = {
        id: nanoid(),
        type: 'anniversary',
        date: data.anniversaryDate,
        createdAt: now,
        updatedAt: now,
        title: data.title,
        anniversaryDate: data.anniversaryDate,
        recurring: data.recurring,
        description: data.description || undefined,
        visibility: 'family',
      }
      await addEntry(newEntry)
    }
    onSaved?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          <Cake className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
          기념일 이름 *
        </label>
        <input
          {...register('title')}
          placeholder="예: 엄마 생일, 결혼기념일, 입학일"
          className="w-full px-3 py-2.5 rounded-xl border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">날짜 *</label>
        <input
          type="date"
          {...register('anniversaryDate')}
          className="w-full px-3 py-2.5 rounded-xl border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {errors.anniversaryDate && <p className="text-xs text-red-500 mt-1">{errors.anniversaryDate.message}</p>}
      </div>

      {/* Recurring toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setValue('recurring', !recurring)}
          className={cn(
            'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
            recurring ? 'bg-pink-500' : 'bg-muted'
          )}
        >
          <span className={cn(
            'inline-block h-3.5 w-3.5 transform rounded-full bg-card shadow transition-transform',
            recurring ? 'translate-x-5' : 'translate-x-0.5'
          )} />
        </button>
        <span className="text-sm text-foreground">매년 반복</span>
        <span className="text-xs text-muted-foreground">
          {recurring ? '(캘린더에 매년 표시됨)' : '(특정 년도만)'}
        </span>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">메모 (선택)</label>
        <textarea
          {...register('description')}
          rows={2}
          placeholder="간단한 메모..."
          className="w-full px-3 py-2.5 rounded-xl border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      {/* Always family — info */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">
        <Users className="h-3.5 w-3.5" />
        기념일은 항상 가족 모두와 공유됩니다
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-pink-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? '저장 중...' : isEdit ? '수정 저장' : '기념일 등록'}
      </button>
    </form>
  )
}
