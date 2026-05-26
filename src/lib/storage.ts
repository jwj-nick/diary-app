import { supabase } from './supabase'
import type { DiaryEntry, Visibility } from '@/types/diary'

function rowToEntry(row: Record<string, unknown>): DiaryEntry {
  const { id, user_id, type, date, created_at, updated_at, deleted_at, tags, visibility, data } = row
  return {
    id: id as string,
    type: type as DiaryEntry['type'],
    date: date as string,
    createdAt: created_at as string,
    updatedAt: updated_at as string,
    ...(deleted_at ? { deletedAt: deleted_at as string } : {}),
    tags: (tags as string[] | null) ?? [],
    userId: user_id as string | undefined,
    visibility: (visibility as Visibility | null) ?? 'personal',
    ...(data as object),
  } as DiaryEntry
}

function entryToRow(entry: DiaryEntry, userId: string) {
  const { id, type, date, createdAt, updatedAt, deletedAt, tags, userId: _ownerId, visibility, ...data } = entry
  return {
    id,
    user_id: userId,
    type,
    date,
    created_at: createdAt,
    updated_at: updatedAt,
    deleted_at: deletedAt ?? null,
    tags: tags ?? [],
    visibility: visibility ?? 'personal',
    data,
  }
}

export async function getAllEntries(userId: string, viewAll = false): Promise<DiaryEntry[]> {
  let query = supabase.from('diary_entries').select('*')
  if (!viewAll) {
    // RLS already includes family-shared rows; user_id filter would exclude them.
    // So when viewing personally, fetch own + family-visible.
    query = query.or(`user_id.eq.${userId},visibility.eq.family`)
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
