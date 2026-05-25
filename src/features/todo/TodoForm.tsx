import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { nanoid } from 'nanoid'
import { Plus, X } from 'lucide-react'
import { todoSchema, type TodoFormData } from './schema'
import { useDiaryStore } from '@/store/diary.store'
import type { TodoEntry, TodoItem } from '@/types/diary'

interface Props {
  onSaved?: () => void
}

export function TodoForm({ onSaved }: Props) {
  const { addEntry } = useDiaryStore()
  const [itemTexts, setItemTexts] = useState<string[]>([''])

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<TodoFormData>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      items: [''],
    },
  })

  const syncItems = (texts: string[]) => {
    setItemTexts(texts)
    setValue('items', texts.filter((t) => t.trim() !== ''), { shouldValidate: true })
  }

  const addItem = () => syncItems([...itemTexts, ''])

  const updateItem = (i: number, val: string) => {
    const next = [...itemTexts]
    next[i] = val
    syncItems(next)
  }

  const removeItem = (i: number) => {
    syncItems(itemTexts.filter((_, idx) => idx !== i))
  }

  const onSubmit = async (data: TodoFormData) => {
    const now = new Date().toISOString()
    const items: TodoItem[] = data.items.map((text) => ({
      id: nanoid(),
      text,
      done: false,
    }))
    const entry: TodoEntry = {
      id: nanoid(),
      type: 'todo',
      date: data.dueDate ?? format(new Date(), 'yyyy-MM-dd'),
      createdAt: now,
      updatedAt: now,
      title: data.title,
      dueDate: data.dueDate || undefined,
      items,
    }
    await addEntry(entry)
    onSaved?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">제목 *</label>
        <input
          {...register('title')}
          placeholder="할일 목록 제목"
          className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
      </div>

      {/* Due date */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">기한</label>
        <input
          type="date"
          {...register('dueDate')}
          className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>

      {/* Items */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">할일 항목 *</label>
        <div className="space-y-2">
          {itemTexts.map((text, i) => (
            <div key={i} className="flex gap-2 items-center">
              <span className="text-zinc-300 text-sm">○</span>
              <input
                value={text}
                onChange={(e) => updateItem(i, e.target.value)}
                placeholder={`할일 ${i + 1}`}
                className="flex-1 px-3 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
              {itemTexts.length > 1 && (
                <button type="button" onClick={() => removeItem(i)} className="p-1 text-zinc-400 hover:text-zinc-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.items && <p className="text-xs text-red-500 mt-1">{errors.items.message}</p>}
        <button
          type="button"
          onClick={addItem}
          className="mt-2 flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700"
        >
          <Plus className="h-4 w-4" />항목 추가
        </button>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-orange-500 text-white rounded-xl py-3 text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? '저장 중...' : '할일 목록 저장'}
      </button>
    </form>
  )
}
