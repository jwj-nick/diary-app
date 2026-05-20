import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { nanoid } from 'nanoid'
import { format } from 'date-fns'
import { readingSchema, type ReadingFormData } from './schema'
import { useDiaryStore } from '@/store/diary.store'
import type { ReadingEntry } from '@/types/diary'
import { cn } from '@/lib/utils'

interface Props {
  onSuccess: () => void
  onCancel: () => void
}

export function ReadingLogForm({ onSuccess, onCancel }: Props) {
  const addEntry = useDiaryStore((s) => s.addEntry)
  const [hoverRating, setHoverRating] = useState(0)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReadingFormData>({
    resolver: zodResolver(readingSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
    },
  })

  const rating = watch('rating')

  const onSubmit = async (data: ReadingFormData) => {
    const now = new Date().toISOString()
    const entry: ReadingEntry = {
      id: nanoid(),
      type: 'reading',
      date: data.date,
      createdAt: now,
      updatedAt: now,
      bookTitle: data.bookTitle,
      author: data.author || undefined,
      pagesFrom: data.pagesFrom || undefined,
      pagesTo: data.pagesTo || undefined,
      quote: data.quote || undefined,
      thought: data.thought || undefined,
      rating: data.rating,
    }
    await addEntry(entry)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Book Title */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">책 제목</label>
        <input
          {...register('bookTitle')}
          placeholder="읽은 책 제목을 입력해주세요"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        {errors.bookTitle && <p className="text-red-500 text-xs mt-1">{errors.bookTitle.message}</p>}
      </div>

      {/* Author */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">저자 (선택)</label>
        <input
          {...register('author')}
          placeholder="저자 이름"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Pages */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">읽은 페이지 (선택)</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            {...register('pagesFrom', { valueAsNumber: true })}
            placeholder="시작"
            min={1}
            className="w-24 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <span className="text-zinc-400 text-sm">~</span>
          <input
            type="number"
            {...register('pagesTo', { valueAsNumber: true })}
            placeholder="끝"
            min={1}
            className="w-24 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <span className="text-zinc-500 text-sm">페이지</span>
        </div>
      </div>

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">별점 (선택)</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setValue('rating', star)}
              className="text-2xl transition-transform hover:scale-110"
            >
              <span className={cn(
                (hoverRating || rating || 0) >= star ? 'text-amber-400' : 'text-zinc-300'
              )}>
                ★
              </span>
            </button>
          ))}
          {rating && (
            <button
              type="button"
              onClick={() => setValue('rating', undefined)}
              className="ml-2 text-xs text-zinc-400 hover:text-zinc-600"
            >
              초기화
            </button>
          )}
        </div>
      </div>

      {/* Quote */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">인상 구절 (선택)</label>
        <textarea
          {...register('quote')}
          rows={3}
          placeholder="마음에 남는 문장을 적어보세요..."
          className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Thought */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">느낀 점 (선택)</label>
        <textarea
          {...register('thought')}
          rows={3}
          placeholder="읽고 나서 든 생각이나 느낀 점을 써보세요..."
          className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">날짜</label>
        <input
          type="date"
          {...register('date')}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
          className="flex-1 bg-emerald-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          저장하기
        </button>
      </div>
    </form>
  )
}
