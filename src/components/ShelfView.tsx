'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import BookCard from './BookCard'
import BookSearchModal from './BookSearchModal'
import type { ShelfStatus, UserBookWithBook } from '@/types/database'

const TABS: { id: ShelfStatus; label: string }[] = [
  { id: 'reading', label: 'Reading' },
  { id: 'want_to_read', label: 'Want to Read' },
  { id: 'finished', label: 'Finished' },
  { id: 'dnf', label: 'DNF' },
]

interface Props {
  books: UserBookWithBook[]
  counts: Record<ShelfStatus, number>
  activeTab: ShelfStatus
}

export default function ShelfView({ books, counts, activeTab }: Props) {
  const router = useRouter()
  const [searchOpen, setSearchOpen] = useState(false)

  const setTab = (tab: ShelfStatus) => router.push(`/shelf?tab=${tab}`)

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">My Shelf</h1>
        <button
          onClick={() => setSearchOpen(true)}
          className="bg-neutral-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          + Add book
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-neutral-200">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'text-neutral-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-neutral-900'
                : 'text-neutral-400 hover:text-neutral-600'
            }`}
          >
            {tab.label}
            {counts[tab.id] > 0 && (
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id
                  ? 'bg-neutral-200 text-neutral-700'
                  : 'bg-neutral-100 text-neutral-400'
              }`}>
                {counts[tab.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Book grid */}
      {books.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-neutral-400 text-sm">No books here yet.</p>
          <button
            onClick={() => setSearchOpen(true)}
            className="mt-3 text-neutral-500 hover:text-neutral-900 text-sm underline underline-offset-2 transition-colors"
          >
            Search for a book to add
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {books.map(ub => (
            <BookCard key={ub.id} userBook={ub} />
          ))}
        </div>
      )}

      {searchOpen && <BookSearchModal onClose={() => setSearchOpen(false)} defaultShelf={activeTab} />}
    </div>
  )
}
