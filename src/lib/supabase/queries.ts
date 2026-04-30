import { createClient } from './server'
import type { ShelfStatus, UserBookWithBook } from '@/types/database'

export async function getUserBooks(shelf?: ShelfStatus): Promise<UserBookWithBook[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase
    .from('user_books')
    .select('*, book:books(*)')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (shelf) query = query.eq('shelf', shelf)

  const { data } = await query
  return (data ?? []) as UserBookWithBook[]
}

export async function getShelfCounts(): Promise<Record<ShelfStatus, number>> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const empty = { reading: 0, want_to_read: 0, finished: 0, dnf: 0 }
  if (!user) return empty

  const { data } = await supabase
    .from('user_books')
    .select('shelf')
    .eq('user_id', user.id)

  return (data ?? []).reduce((acc, row) => {
    acc[row.shelf as ShelfStatus] = (acc[row.shelf as ShelfStatus] ?? 0) + 1
    return acc
  }, empty as Record<ShelfStatus, number>)
}
