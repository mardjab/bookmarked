'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { addBookToShelf, moveBookToShelf } from '@/lib/actions/books'
import { fetchBookDescription } from '@/lib/openlibrary'
import type { OLBook } from '@/lib/openlibrary'
import type { Book, ShelfStatus, UserBookWithBook } from '@/types/database'

const SHELF_LABELS: Record<ShelfStatus, string> = {
  reading: 'Reading',
  want_to_read: 'Want to Read',
  finished: 'Finished',
  dnf: 'DNF',
}

// Accepts either a search result (OLBook) or a shelved book (Book from DB)
type BookSource =
  | { kind: 'search'; book: OLBook }
  | { kind: 'shelf'; userBook: UserBookWithBook }

interface Props {
  source: BookSource
  defaultShelf?: ShelfStatus
  onClose: () => void
  onAdded?: () => void
}

export default function BookDetailModal({ source, defaultShelf = 'want_to_read', onClose, onAdded }: Props) {
  const isShelf = source.kind === 'shelf'

  // Normalise to a common shape regardless of source
  const ol_id    = isShelf ? source.userBook.book.ol_id    : source.book.ol_id
  const title    = isShelf ? source.userBook.book.title    : source.book.title
  const author   = isShelf ? source.userBook.book.author   : source.book.author
  const coverUrl = isShelf ? source.userBook.book.cover_url : source.book.cover_url
  const year     = isShelf ? source.userBook.book.published_year : source.book.published_year
  const pages    = isShelf ? source.userBook.book.page_count    : source.book.page_count
  const genres   = isShelf ? source.userBook.book.genre         : source.book.genre
  const bookId   = isShelf ? source.userBook.book.id : null
  const currentShelf = isShelf ? source.userBook.shelf : null

  const [description, setDescription] = useState<string | null>(
    isShelf ? (source.userBook.book.description ?? null) : null
  )
  const [loadingDesc, setLoadingDesc] = useState(false)
  const [selectedShelf, setSelectedShelf] = useState<ShelfStatus>(currentShelf ?? defaultShelf)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  // Fetch description from Open Library if not already in the DB
  useEffect(() => {
    if (description) return
    setLoadingDesc(true)
    fetchBookDescription(ol_id).then(desc => {
      setDescription(desc)
      setLoadingDesc(false)
    })
  }, [ol_id, description])

  const handleAction = async () => {
    setSaving(true)
    if (isShelf && bookId) {
      await moveBookToShelf(bookId, selectedShelf)
    } else {
      await addBookToShelf((source as { kind: 'search'; book: OLBook }).book, selectedShelf)
    }
    setSaving(false)
    setDone(true)
    onAdded?.()
  }

  const actionLabel = () => {
    if (saving) return 'Saving…'
    if (done && !isShelf) return 'Added!'
    if (isShelf) return selectedShelf === currentShelf ? 'On this shelf' : `Move to ${SHELF_LABELS[selectedShelf]}`
    return `Add to ${SHELF_LABELS[selectedShelf]}`
  }

  const actionDisabled = saving || (done && !isShelf) || (isShelf && selectedShelf === currentShelf)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex gap-6 p-6">
          {/* Cover */}
          <div className="shrink-0 w-36 sm:w-44">
            <div className="relative w-full aspect-[2/3] bg-neutral-100 rounded-lg overflow-hidden shadow-md">
              {coverUrl ? (
                <Image
                  src={coverUrl}
                  alt={title}
                  fill
                  sizes="176px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-neutral-200 flex items-center justify-center p-3">
                  <span className="text-neutral-400 text-xs text-center leading-snug">{title}</span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 leading-tight">{title}</h2>
                <p className="text-neutral-500 mt-0.5">{author}</p>
                {(year || pages) && (
                  <p className="text-neutral-400 text-sm mt-1">
                    {[year, pages ? `${pages} pages` : null].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="shrink-0 text-neutral-400 hover:text-neutral-600 transition-colors text-xl leading-none mt-0.5"
              >
                ×
              </button>
            </div>

            {/* Genres */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {genres.slice(0, 6).map(g => (
                  <span
                    key={g}
                    className="text-xs px-2.5 py-1 bg-stone-100 text-neutral-600 rounded-full"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="text-sm text-neutral-600 leading-relaxed">
              {loadingDesc ? (
                <span className="text-neutral-300">Loading synopsis…</span>
              ) : description ? (
                <p className="line-clamp-6">{description}</p>
              ) : (
                <span className="text-neutral-300">No synopsis available.</span>
              )}
            </div>

            {/* Shelf selector + action */}
            <div className="mt-auto pt-2 border-t border-neutral-100 flex flex-col gap-3">
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(SHELF_LABELS) as ShelfStatus[]).map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedShelf(s)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      selectedShelf === s
                        ? 'bg-neutral-900 border-neutral-900 text-white'
                        : 'border-neutral-200 text-neutral-500 hover:border-neutral-400'
                    }`}
                  >
                    {SHELF_LABELS[s]}
                  </button>
                ))}
              </div>
              <button
                onClick={handleAction}
                disabled={actionDisabled}
                className="w-full bg-neutral-900 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-neutral-800 disabled:opacity-40 transition-colors"
              >
                {actionLabel()}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
