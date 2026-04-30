'use client'

import Image from 'next/image'
import { useState } from 'react'
import { moveBookToShelf, removeBookFromShelf } from '@/lib/actions/books'
import type { ShelfStatus, UserBookWithBook } from '@/types/database'

const SHELF_LABELS: Record<ShelfStatus, string> = {
  reading: 'Reading',
  want_to_read: 'Want to Read',
  finished: 'Finished',
  dnf: 'DNF',
}

const ALL_SHELVES: ShelfStatus[] = ['reading', 'want_to_read', 'finished', 'dnf']

interface Props {
  userBook: UserBookWithBook
}

export default function BookCard({ userBook }: Props) {
  const { book, shelf } = userBook
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleMove = async (newShelf: ShelfStatus) => {
    setLoading(true)
    setMenuOpen(false)
    await moveBookToShelf(book.id, newShelf)
    setLoading(false)
  }

  const handleRemove = async () => {
    setLoading(true)
    setMenuOpen(false)
    await removeBookFromShelf(book.id)
    setLoading(false)
  }

  return (
    <div className={`group relative flex flex-col gap-2 ${loading ? 'opacity-50' : ''}`}>
      {/* Cover */}
      <div className="relative aspect-[2/3] bg-neutral-100 rounded-md overflow-hidden shadow-sm">
        {book.cover_url ? (
          <Image
            src={book.cover_url}
            alt={book.title}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, 20vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-3 bg-neutral-200">
            <span className="text-neutral-500 text-xs text-center leading-snug">{book.title}</span>
          </div>
        )}

        {/* Hover menu trigger */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="absolute top-1.5 right-1.5 w-6 h-6 bg-white/90 rounded-full text-neutral-600 hover:text-neutral-900 opacity-0 group-hover:opacity-100 transition-opacity text-xs flex items-center justify-center shadow-sm"
        >
          ···
        </button>

        {/* Dropdown */}
        {menuOpen && (
          <div className="absolute top-8 right-1.5 z-10 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 min-w-36">
            {ALL_SHELVES.filter(s => s !== shelf).map(s => (
              <button
                key={s}
                onClick={() => handleMove(s)}
                className="w-full text-left px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
              >
                Move to {SHELF_LABELS[s]}
              </button>
            ))}
            <div className="my-1 border-t border-neutral-100" />
            <button
              onClick={handleRemove}
              className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:text-red-600 hover:bg-neutral-50 transition-colors"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Meta */}
      <div>
        <p className="text-neutral-900 text-xs font-medium leading-snug line-clamp-2">{book.title}</p>
        <p className="text-neutral-400 text-xs mt-0.5 truncate">{book.author}</p>
      </div>
    </div>
  )
}
