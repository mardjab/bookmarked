import { useState, useCallback } from 'react'
import { loadBooks, saveBooks, createBook } from './storage'

export function useBooks() {
  const [books, setBooks] = useState(() => loadBooks())

  const persist = useCallback((updated) => {
    setBooks(updated)
    saveBooks(updated)
  }, [])

  const addBook = useCallback((fields) => {
    persist([...books, createBook(fields)])
  }, [books, persist])

  const updateBook = useCallback((id, fields) => {
    persist(books.map(b => b.id === id ? { ...b, ...fields } : b))
  }, [books, persist])

  const deleteBook = useCallback((id) => {
    persist(books.filter(b => b.id !== id))
  }, [books, persist])

  return { books, addBook, updateBook, deleteBook }
}
