export type EntryType = 'study' | 'reading' | 'free' | 'goal' | 'exam'
export type Understanding = 1 | 2 | 3 | 4
export type ExamKind = 'midterm' | 'final' | 'performance' | 'quiz' | 'other'
export type GoalStatus = 'in_progress' | 'completed'

export interface BaseEntry {
  id: string
  type: EntryType
  date: string          // YYYY-MM-DD (for goals/exams: creation date)
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
  targetDate: string             // YYYY-MM-DD, 목표 달성일
  description?: string
  steps: GoalStep[]
  status: GoalStatus
  completedAt?: string
}

export interface PrepStep {
  id: string
  text: string
  dueDate?: string               // YYYY-MM-DD (선택)
  done: boolean
  doneAt?: string
}

export interface ExamEntry extends BaseEntry {
  type: 'exam'
  title: string
  subject: string
  examDate: string               // YYYY-MM-DD, 시험일
  examKind: ExamKind
  scope?: string                 // 시험 범위
  prepSteps: PrepStep[]
}

export type DiaryEntry =
  | StudyEntry
  | ReadingEntry
  | FreeDiaryEntry
  | StudyGoalEntry
  | ExamEntry

// 캘린더 표시용: entry가 캘린더의 어떤 날짜에 표시되어야 하는지
export function getEntryDisplayDate(entry: DiaryEntry): string {
  if (entry.type === 'goal') return entry.targetDate
  if (entry.type === 'exam') return entry.examDate
  return entry.date
}

// 정렬용 primary date
export function getEntryPrimaryDate(entry: DiaryEntry): string {
  return getEntryDisplayDate(entry)
}

// 표시용 짧은 타이틀
export function getEntryShortTitle(entry: DiaryEntry): string {
  switch (entry.type) {
    case 'study': return `${entry.subject} · ${entry.topic}`
    case 'reading': return entry.bookTitle
    case 'free': return entry.title || '자유 일기'
    case 'goal': return entry.title
    case 'exam': return entry.title
  }
}
