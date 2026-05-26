import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { nanoid } from 'nanoid'
import { Users, Lock } from 'lucide-react'
import { scheduleSchema, type ScheduleFormData } from './schema'
import { useDiaryStore } from '@/store/diary.store'
import type { ScheduleEntry } from '@/types/diary'
import { cn } from '@/lib/utils'

interface Props {
  onSaved?: () => void
  entry?: ScheduleEntry
  defaultDate?: string
}

export function ScheduleForm({ onSaved, entry, defaultDate }: Props) {
  const { addEntry, updateEntry } = useDiaryStore()
  const isEdit = !!entry

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: entry
      ? {
          title: entry.title,
          startDate: entry.startDate,
          startTime: entry.startTime ?? '',
          endDate: entry.endDate ?? '',
          endTime: entry.endTime ?? '',
          allDay: entry.allDay ?? true,
          location: entry.location ?? '',
          note: entry.note ?? '',
          visibility: entry.visibility ?? 'personal',
        }
      : {
          startDate: defaultDate ?? format(new Date(), 'yyyy-MM-dd'),
          allDay: true,
          visibility: 'personal',
        },
  })

  const allDay = watch('allDay')
  const visibility = watch('visibility')

  const onSubmit = async (data: ScheduleFormData) => {
    const now = new Date().toISOString()
    if (isEdit && entry) {
      const updated: ScheduleEntry = {
        ...entry,
        title: data.title,
        date: data.startDate,
        startDate: data.startDate,
        startTime: data.allDay ? undefined : data.startTime,
        endDate: data.endDate || undefined,
        endTime: data.allDay ? undefined : data.endTime,
        location: data.location || undefined,
        note: data.note || undefined,
        allDay: data.allDay,
        visibility: data.visibility,
        updatedAt: now,
      }
      await updateEntry(updated)
    } else {
      const newEntry: ScheduleEntry = {
        id: nanoid(),
        type: 'schedule',
        date: data.startDate,
        createdAt: now,
        updatedAt: now,
        title: data.title,
        startDate: data.startDate,
        startTime: data.allDay ? undefined : data.startTime,
        endDate: data.endDate || undefined,
        endTime: data.allDay ? undefined : data.endTime,
        location: data.location || undefined,
        note: data.note || undefined,
        allDay: data.allDay,
        visibility: data.visibility,
      }
      await addEntry(newEntry)
    }
    onSaved?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">제목 *</label>
        <input
          {...register('title')}
          placeholder="일정 제목"
          className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
      </div>

      {/* Date */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">시작일 *</label>
          <input
            type="date"
            {...register('startDate')}
            className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">종료일</label>
          <input
            type="date"
            {...register('endDate')}
            className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* All day toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setValue('allDay', !allDay)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${allDay ? 'bg-sky-500' : 'bg-muted'}`}
        >
          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-card shadow transition-transform ${allDay ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
        <span className="text-sm text-foreground">하루 종일</span>
      </div>

      {/* Time (if not all day) */}
      {!allDay && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">시작 시간</label>
            <input
              type="time"
              {...register('startTime')}
              className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">종료 시간</label>
            <input
              type="time"
              {...register('endTime')}
              className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      )}

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">장소</label>
        <input
          {...register('location')}
          placeholder="장소 (선택)"
          className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Note */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">메모</label>
        <textarea
          {...register('note')}
          placeholder="메모 (선택)"
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      {/* Visibility — personal vs family */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">공개 범위</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setValue('visibility', 'personal', { shouldValidate: true })}
            className={cn(
              'flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors',
              visibility === 'personal'
                ? 'border-sky-500 bg-sky-500/10 text-foreground'
                : 'border-input bg-card text-muted-foreground hover:bg-muted'
            )}
          >
            <Lock className="h-3.5 w-3.5" />
            나만
          </button>
          <button
            type="button"
            onClick={() => setValue('visibility', 'family', { shouldValidate: true })}
            className={cn(
              'flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors',
              visibility === 'family'
                ? 'border-sky-500 bg-sky-500/10 text-foreground'
                : 'border-input bg-card text-muted-foreground hover:bg-muted'
            )}
          >
            <Users className="h-3.5 w-3.5" />
            가족 공유
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-sky-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-sky-700 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? '저장 중...' : isEdit ? '수정 저장' : '일정 저장'}
      </button>
    </form>
  )
}
