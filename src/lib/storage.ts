import { supabase } from './supabase'
import type { DiaryEntry } from '@/types/diary'

function rowToEntry(row: Record<string, unknown>): DiaryEntry {
  const { id, type, date, created_at, updated_at, deleted_at, tags, data } = row
  return {
    id: id as string,
    type: type as DiaryEntry['type'],
    date: date as string,
    createdAt: created_at as string,
    updatedAt: updated_at as string,
    ...(deleted_at ? { deletedAt: deleted_at as string } : {}),
    tags: (tags as string[] | null) ?? [],
    ...(data as object),
  } as DiaryEntry
}

function entryToRow(entry: DiaryEntry, userId: string) {
  const { id, type, date, createdAt, updatedAt, deletedAt, tags, ...data } = entry
  return {
    id,
    user_id: userId,
    type,
    date,
    created_at: createdAt,
    updated_at: updatedAt,
    deleted_at: deletedAt ?? null,
    tags: tags ?? [],
    data,
  }
}

export async function getAllEntries(userId: string, viewAll = false): Promise<DiaryEntry[]> {
  let query = supabase.from('diary_entries').select('*')
  if (!viewAll) {
    query = query.eq('user_id', userId)
  }
  const { data, error } = await query.order('date', { ascending: false })
  if (error) {
    console.error('[storage] getAllEntries failed:', error.message)
    return []
  }
  return (data ?? []).map(rowToEntry)
}

export async function saveEntry(entry: DiaryEntry, userId: string): Promise<void> {
  const { error } = await supabase
    .from('diary_entries')
    .upsert(entryToRow(entry, userId))
  if (error) {
    console.error('[storage] saveEntry failed:', error.message)
    throw error
  }
}

export async function deleteEntry(id: string): Promise<void> {
  const { error } = await supabase
    .from('diary_entries')
    .delete()
    .eq('id', id)
  if (error) {
    console.error('[storage] deleteEntry failed:', error.message)
    throw error
  }
}
