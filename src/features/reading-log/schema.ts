import { z } from 'zod'

export const readingSchema = z.object({
  bookTitle: z.string().min(1, '책 제목을 입력해주세요'),
  author: z.string().optional(),
  pagesFrom: z.number().optional(),
  pagesTo: z.number().optional(),
  quote: z.string().optional(),
  thought: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  date: z.string().min(1),
})

export type ReadingFormData = z.infer<typeof readingSchema>
