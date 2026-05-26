import { z } from 'zod'

export const goalStepSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, '내용을 입력해주세요'),
})

export const goalSchema = z.object({
  title: z.string().min(1, '목표 제목을 입력해주세요'),
  subject: z.string().optional(),
  targetDate: z.string().min(1, '목표일을 선택해주세요'),
  description: z.string().optional(),
  steps: z.array(goalStepSchema),
})

export type GoalFormData = z.infer<typeof goalSchema>
