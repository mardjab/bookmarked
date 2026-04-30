'use client'

import { useState, useEffect, useTransition } from 'react'
import Image from 'next/image'
import { searchBooksAction, addBookToShelf } from '@/lib/actions/books'
import type { OLBook } from '@/lib/openlibrary'
import type { ShelfStatus } from '@/types/database'

const SHELF_LABELS: Record<ShelfStatus, string> = {
  reading: 'Reading',
  want_to_read: 'Want to Read',
  finished: 'Finished',
  dnf: 'DNF',
}

interface Props {
  onClose: () => void
  defaultShelf: ShelfStatus
}

export default function BookSearchModal({ onClose, defaultShelf }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<OLBook[]>([])
  const [selectedShelf, setSelectedShelf] = useState<ShelfStatus>(defaultShelf)
  const [adding, setAdding] = useState<string | null>(null)
  const [added, setAdded] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  // Debounced autocomplete — fires 350ms after the user stops typing
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

  const handleAdd = async (book: OLBook) => {
    setAdding(book.ol_id)
    await addBookToShelf(book, selectedShelf)
    setAdded(prev => new Set(prev).add(book.ol_id))
    setAdding(null)
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
          {isPending && (
            <span className="text-neutral-400 text-xs">Searching…</span>
          )}
        </div>

        {/* Shelf selector */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-neutral-100">
          <span className="text-neutral-400 text-xs shrink-0">Add to:</span>
          {(Object.keys(SHELF_LABELS) as ShelfStatus[]).map(s => (
            <button
              key={s}
              onClick={() => setSelectedShelf(s)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                selectedShelf === s
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-200 text-neutral-500 hover:border-neutral-400'
              }`}
            >
              {SHELF_LABELS[s]}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="overflow-y-auto flex-1">
          {results.length === 0 && !isPending && (
            <p className="text-neutral-400 text-sm text-center py-12">
              {query.trim().length < 2 ? 'Type at least 2 characters to search.' : 'No results found.'}
            </p>
          )}
          {results.map(book => (
            <div
              key={book.ol_id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors"
            >
              {/* Cover thumbnail */}
              <div className="w-9 h-14 shrink-0 bg-neutral-100 rounded overflow-hidden relative">
                {book.cover_url ? (
                  <Image src={book.cover_url} alt={book.title} fill sizes="36px" className="object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-neutral-200" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-neutral-900 text-sm font-medium truncate">{book.title}</p>
                <p className="text-neutral-500 text-xs truncate">{book.author}</p>
                {book.published_year && (
                  <p className="text-neutral-300 text-xs">{book.published_year}</p>
                )}
              </div>

              {/* Add button */}
              <button
                onClick={() => handleAdd(book)}
                disabled={adding === book.ol_id || added.has(book.ol_id)}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  added.has(book.ol_id)
                    ? 'bg-neutral-100 text-neutral-400 cursor-default'
                    : 'bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50'
                }`}
              >
                {added.has(book.ol_id) ? 'Added' : adding === book.ol_id ? '…' : 'Add'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
