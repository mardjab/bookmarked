'use client'

import { useState, useTransition } from 'react'
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

  const handleSearch = () => {
    startTransition(async () => {
      const books = await searchBooksAction(query)
      setResults(books)
    })
  }

  const handleAdd = async (book: OLBook) => {
    setAdding(book.ol_id)
    await addBookToShelf(book, selectedShelf)
    setAdded(prev => new Set(prev).add(book.ol_id))
    setAdding(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4" onClick={onClose}>
      <div
        className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[70vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Search bar */}
        <div className="flex items-center gap-2 p-4 border-b border-neutral-800">
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search by title or author…"
            className="flex-1 bg-transparent text-white placeholder-neutral-500 text-sm focus:outline-none"
          />
          <button
            onClick={handleSearch}
            disabled={isPending || !query.trim()}
            className="bg-white text-neutral-950 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-40 transition-colors"
          >
            {isPending ? '…' : 'Search'}
          </button>
        </div>

        {/* Shelf selector */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-neutral-800">
          <span className="text-neutral-500 text-xs">Add to:</span>
          {(Object.keys(SHELF_LABELS) as ShelfStatus[]).map(s => (
            <button
              key={s}
              onClick={() => setSelectedShelf(s)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                selectedShelf === s
                  ? 'border-white text-white'
                  : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
              }`}
            >
              {SHELF_LABELS[s]}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="overflow-y-auto flex-1">
          {results.length === 0 && !isPending && (
            <p className="text-neutral-500 text-sm text-center py-12">
              {query ? 'No results found.' : 'Enter a title or author to search.'}
            </p>
          )}
          {results.map(book => (
            <div
              key={book.ol_id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-800/50 transition-colors"
            >
              {/* Cover thumbnail */}
              <div className="w-9 h-14 shrink-0 bg-neutral-800 rounded overflow-hidden relative">
                {book.cover_url ? (
                  <Image src={book.cover_url} alt={book.title} fill sizes="36px" className="object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-neutral-700" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{book.title}</p>
                <p className="text-neutral-400 text-xs truncate">{book.author}</p>
                {book.published_year && (
                  <p className="text-neutral-600 text-xs">{book.published_year}</p>
                )}
              </div>

              {/* Add button */}
              <button
                onClick={() => handleAdd(book)}
                disabled={adding === book.ol_id || added.has(book.ol_id)}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  added.has(book.ol_id)
                    ? 'bg-neutral-700 text-neutral-400 cursor-default'
                    : 'bg-white text-neutral-950 hover:bg-neutral-100 disabled:opacity-50'
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
