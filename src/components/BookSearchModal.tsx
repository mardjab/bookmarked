'use client'

import { useState, useEffect, useTransition } from 'react'
import Image from 'next/image'
import { searchBooksAction } from '@/lib/actions/books'
import BookDetailModal from './BookDetailModal'
import type { OLBook } from '@/lib/openlibrary'
import type { ShelfStatus } from '@/types/database'

interface Props {
  onClose: () => void
  defaultShelf: ShelfStatus
}

export default function BookSearchModal({ onClose, defaultShelf }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<OLBook[]>([])
  const [selectedBook, setSelectedBook] = useState<OLBook | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    const timer = setTimeout(() => {
      startTransition(async () => {
        const books = await searchBooksAction(query)
        setResults(books)
      })
    }, 350)
    return () => clearTimeout(timer)
  }, [query])

  if (selectedBook) {
    return (
      <BookDetailModal
        source={{ kind: 'search', book: selectedBook }}
        defaultShelf={defaultShelf}
        onClose={() => setSelectedBook(null)}
        onAdded={() => setSelectedBook(null)}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/20" onClick={onClose}>
      <div
        className="bg-white border border-neutral-200 rounded-xl shadow-xl w-full max-w-lg max-h-[70vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100">
          <svg className="w-4 h-4 text-neutral-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by title or author…"
            className="flex-1 text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none bg-transparent"
          />
          {isPending && <span className="text-neutral-400 text-xs shrink-0">Searching…</span>}
        </div>

        {/* Results */}
        <div className="overflow-y-auto flex-1">
          {results.length === 0 && !isPending && (
            <p className="text-neutral-400 text-sm text-center py-12">
              {query.trim().length < 2 ? 'Type at least 2 characters to search.' : 'No results found.'}
            </p>
          )}
          {results.map(book => (
            <button
              key={book.ol_id}
              onClick={() => setSelectedBook(book)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors text-left"
            >
              <div className="w-9 h-14 shrink-0 bg-neutral-100 rounded overflow-hidden relative">
                {book.cover_url ? (
                  <Image src={book.cover_url} alt={book.title} fill sizes="36px" className="object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-neutral-200" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-neutral-900 text-sm font-medium truncate">{book.title}</p>
                <p className="text-neutral-500 text-xs truncate">{book.author}</p>
                {book.published_year && (
                  <p className="text-neutral-400 text-xs">{book.published_year}</p>
                )}
              </div>
              <svg className="w-4 h-4 text-neutral-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
