import { z } from 'zod'

export const scheduleSchema = z.object({
  title: z.string().min(1, '제목을 입력하세요'),
  startDate: z.string().min(1, '날짜를 선택하세요'),
  startTime: z.string().optional(),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
  allDay: z.boolean(),
  location: z.string().optional(),
  note: z.string().optional(),
  visibility: z.enum(['personal', 'family']),
})

export type ScheduleFormData = z.infer<typeof scheduleSchema>
