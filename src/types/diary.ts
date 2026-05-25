export type EntryType = 'study' | 'reading' | 'free' | 'goal' | 'exam' | 'schedule' | 'todo'
export type Understanding = 1 | 2 | 3 | 4
export type ExamKind = 'midterm' | 'final' | 'performance' | 'quiz' | 'other'
export type GoalStatus = 'in_progress' | 'completed'

export interface BaseEntry {
  id: string
  type: EntryType
  date: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
  tags?: string[]
}

export interface StudyEntry extends BaseEntry {
  type: 'study'
  subject: string
  topic: string
  durationMinutes: number
  understanding: Understanding
  note?: string
  questions?: string
}

export interface ReadingEntry extends BaseEntry {
  type: 'reading'
  bookTitle: string
  author?: string
  pagesFrom?: number
  pagesTo?: number
  quote?: string
  thought?: string
  rating?: number
}

export interface FreeDiaryEntry extends BaseEntry {
  type: 'free'
  title?: string
  body: string
}

export interface GoalStep {
  id: string
  text: string
  done: boolean
  doneAt?: string
}

export interface StudyGoalEntry extends BaseEntry {
  type: 'goal'
  title: string
  subject?: string
  targetDate: string
  description?: string
  steps: GoalStep[]
  status: GoalStatus
  completedAt?: string
}

export interface PrepStep {
  id: string
  text: string
  dueDate?: string
  done: boolean
  doneAt?: string
}

export interface ExamEntry extends BaseEntry {
  type: 'exam'
  title: string
  subject: string
  examDate: string
  examKind: ExamKind
  scope?: string
  prepSteps: PrepStep[]
}

export interface ScheduleEntry extends BaseEntry {
  type: 'schedule'
  title: string
  startDate: string
  startTime?: string
  endDate?: string
  endTime?: string
  location?: string
  note?: string
  allDay?: boolean
}

export interface TodoItem {
  id: string
  text: string
  done: boolean
  doneAt?: string
}

export interface TodoEntry extends BaseEntry {
  type: 'todo'
  title: string
  dueDate?: string
  items: TodoItem[]
  completedAt?: string
}

export type DiaryEntry =
  | StudyEntry
  | ReadingEntry
  | FreeDiaryEntry
  | StudyGoalEntry
  | ExamEntry
  | ScheduleEntry
  | TodoEntry

export function getEntryDisplayDate(entry: DiaryEntry): string {
  if (entry.type === 'goal') return entry.targetDate
  if (entry.type === 'exam') return entry.examDate
  if (entry.type === 'schedule') return entry.startDate
  return entry.date
}

export function getEntryPrimaryDate(entry: DiaryEntry): string {
  return getEntryDisplayDate(entry)
}

export function getEntryShortTitle(entry: DiaryEntry): string {
  switch (entry.type) {
    case 'study': return `${entry.subject} · ${entry.topic}`
    case 'reading': return entry.bookTitle
    case 'free': return entry.title || '자유 일기'
    case 'goal': return entry.title
    case 'exam': return entry.title
    case 'schedule': return entry.title
    case 'todo': return entry.title
  }
}
