import { z } from 'zod'

export const prepStepSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, '내용을 입력해주세요'),
  dueDate: z.string().optional(),
})

export const examSchema = z.object({
  title: z.string().min(1, '시험 이름을 입력해주세요'),
  subject: z.string().min(1, '과목을 선택해주세요'),
  examDate: z.string().min(1, '시험일을 선택해주세요'),
  examKind: z.enum(['midterm', 'final', 'performance', 'quiz', 'other']),
  scope: z.string().optional(),
  prepSteps: z.array(prepStepSchema),
})

export type ExamFormData = z.infer<typeof examSchema>
