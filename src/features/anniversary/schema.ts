import { z } from 'zod'

export const anniversarySchema = z.object({
  title: z.string().min(1, '제목을 입력하세요 (예: 엄마 생일)'),
  anniversaryDate: z.string().min(1, '날짜를 선택하세요'),
  recurring: z.boolean(),
  description: z.string().optional(),
})

export type AnniversaryFormData = z.infer<typeof anniversarySchema>
