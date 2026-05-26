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
  entry?: TodoEntry
  defaultDate?: string
}

type FormItem = { id?: string; text: string }

export function TodoForm({ onSaved, entry, defaultDate }: Props) {
  const { addEntry, updateEntry } = useDiaryStore()
  const isEdit = !!entry

  const initialItems: FormItem[] = entry
    ? entry.items.map((i) => ({ id: i.id, text: i.text }))
    : [{ text: '' }]
  const [itemsState, setItemsState] = useState<FormItem[]>(initialItems)

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<TodoFormData>({
    resolver: zodResolver(todoSchema),
    defaultValues: entry
      ? { title: entry.title, dueDate: entry.dueDate ?? '', items: initialItems }
      : { dueDate: defaultDate ?? format(new Date(), 'yyyy-MM-dd'), items: initialItems },
  })

  const syncItems = (items: FormItem[]) => {
    setItemsState(items)
    setValue('items', items.filter((i) => i.text.trim() !== ''), { shouldValidate: true })
  }

  const addItem = () => syncItems([...itemsState, { text: '' }])
  const updateItem = (i: number, val: string) => {
    const next = [...itemsState]
    next[i] = { ...next[i], text: val }
    syncItems(next)
  }
  const removeItem = (i: number) => syncItems(itemsState.filter((_, idx) => idx !== i))

  const onSubmit = async (data: TodoFormData) => {
    const now = new Date().toISOString()
    const existingMap = isEdit && entry ? new Map(entry.items.map((i) => [i.id, i])) : new Map()

    const items: TodoItem[] = data.items.map((item) => {
      const existing = item.id ? existingMap.get(item.id) : undefined
      if (existing) {
        return { ...existing, text: item.text }
      }
      return { id: nanoid(), text: item.text, done: false }
    })

    if (isEdit && entry) {
      const allDone = items.length > 0 && items.every((i) => i.done)
      const updated: TodoEntry = {
        ...entry,
        title: data.title,
        date: data.dueDate ?? entry.date,
        dueDate: data.dueDate || undefined,
        items,
        completedAt: allDone ? entry.completedAt ?? now : undefined,
        updatedAt: now,
      }
      await updateEntry(updated)
    } else {
      const newEntry: TodoEntry = {
        id: nanoid(),
        type: 'todo',
        date: data.dueDate ?? format(new Date(), 'yyyy-MM-dd'),
        createdAt: now,
        updatedAt: now,
        title: data.title,
        dueDate: data.dueDate || undefined,
        items,
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
          placeholder="할일 목록 제목"
          className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
      </div>

      {/* Due date */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">기한</label>
        <input
          type="date"
          {...register('dueDate')}
          className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Items */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">할일 항목 *</label>
        <div className="space-y-2">
          {itemsState.map((item, i) => (
            <div key={item.id ?? `new-${i}`} className="flex gap-2 items-center">
              <span className="text-muted-foreground/60 text-sm">○</span>
              <input
                value={item.text}
                onChange={(e) => updateItem(i, e.target.value)}
                placeholder={`할일 ${i + 1}`}
                className="flex-1 px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {itemsState.length > 1 && (
                <button type="button" onClick={() => removeItem(i)} className="p-1 text-muted-foreground hover:text-muted-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.items && <p className="text-xs text-red-500 mt-1">할일을 1개 이상 입력하세요</p>}
        <button
          type="button"
          onClick={addItem}
          className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-4 w-4" />항목 추가
        </button>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-orange-500 text-white rounded-xl py-3 text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? '저장 중...' : isEdit ? '수정 저장' : '할일 목록 저장'}
      </button>
    </form>
  )
}
