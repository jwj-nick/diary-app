import { z } from 'zod'

export const todoSchema = z.object({
  title: z.string().min(1, '제목을 입력하세요'),
  dueDate: z.string().optional(),
  items: z.array(z.string().min(1)).min(1, '할일을 1개 이상 추가하세요'),
})

export type TodoFormData = z.infer<typeof todoSchema>
