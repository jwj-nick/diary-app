import { z } from 'zod'

export const freeDiarySchema = z.object({
  title: z.string().optional(),
  body: z.string().min(1, '내용을 입력해주세요'),
  date: z.string().min(1),
})

export type FreeDiaryFormData = z.infer<typeof freeDiarySchema>
