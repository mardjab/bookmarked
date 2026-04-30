'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { OLBook } from '@/lib/openlibrary'
import type { ShelfStatus } from '@/types/database'

export async function addBookToShelf(olBook: OLBook, shelf: ShelfStatus) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  // Upsert canonical book record
  const { data: book, error: bookError } = await supabase
    .from('books')
    .upsert(
      {
        ol_id: olBook.ol_id,
        title: olBook.title,
        author: olBook.author,
        cover_url: olBook.cover_url,
        published_year: olBook.published_year,
        page_count: olBook.page_count,
        genre: olBook.genre,
      },
      { onConflict: 'ol_id' }
    )
    .select('id')
    .single()

  if (bookError || !book) throw new Error(bookError?.message ?? 'Failed to save book')

  // Check for existing user_book row to log from_shelf correctly
  const { data: existing } = await supabase
    .from('user_books')
    .select('id, shelf')
    .eq('user_id', user.id)
    .eq('book_id', book.id)
    .maybeSingle()

  // Upsert user_books
  const { error: ubError } = await supabase
    .from('user_books')
    .upsert(
      { user_id: user.id, book_id: book.id, shelf },
      { onConflict: 'user_id,book_id' }
    )

  if (ubError) throw new Error(ubError.message)

  // Log the shelf transition
  await supabase.from('shelf_log').insert({
    user_id: user.id,
    book_id: book.id,
    from_shelf: existing?.shelf ?? null,
    to_shelf: shelf,
  })

  revalidatePath('/shelf')
}

export async function moveBookToShelf(bookId: string, newShelf: ShelfStatus) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const { data: existing } = await supabase
    .from('user_books')
    .select('shelf')
    .eq('user_id', user.id)
    .eq('book_id', bookId)
    .single()

  if (!existing) throw new Error('Book not on any shelf')

  const { error } = await supabase
    .from('user_books')
    .update({ shelf: newShelf })
    .eq('user_id', user.id)
    .eq('book_id', bookId)

  if (error) throw new Error(error.message)

  await supabase.from('shelf_log').insert({
    user_id: user.id,
    book_id: bookId,
    from_shelf: existing.shelf,
    to_shelf: newShelf,
  })

  revalidatePath('/shelf')
}

export async function removeBookFromShelf(bookId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const { error } = await supabase
    .from('user_books')
    .delete()
    .eq('user_id', user.id)
    .eq('book_id', bookId)

  if (error) throw new Error(error.message)

  revalidatePath('/shelf')
}

export async function searchBooksAction(query: string) {
  const { searchBooks } = await import('@/lib/openlibrary')
  return searchBooks(query)
}
