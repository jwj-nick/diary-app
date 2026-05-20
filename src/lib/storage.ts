import { openDB } from 'idb'
import type { DiaryEntry } from '@/types/diary'

const DB_NAME = 'kids-diary'
const STORE_NAME = 'entries'
const DB_VERSION = 1

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('by-date', 'date')
        store.createIndex('by-type', 'type')
      }
    },
  })
}

export async function getAllEntries(): Promise<DiaryEntry[]> {
  const db = await getDB()
  return db.getAll(STORE_NAME) as Promise<DiaryEntry[]>
}

export async function saveEntry(entry: DiaryEntry): Promise<void> {
  const db = await getDB()
  await db.put(STORE_NAME, entry)
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}
