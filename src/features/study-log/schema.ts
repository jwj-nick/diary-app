import { z } from 'zod'

export const studySchema = z.object({
  subject: z.string().min(1, '과목을 선택해주세요'),
  customSubject: z.string().optional(),
  topic: z.string().min(1, '단원/주제를 입력해주세요'),
  durationMinutes: z.number().min(1),
  understanding: z.number().min(1).max(4),
  note: z.string().optional(),
  questions: z.string().optional(),
  date: z.string().min(1),
})

export type StudyFormData = z.infer<typeof studySchema>
