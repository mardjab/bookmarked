import { useState } from 'react'
import { useBooks } from './useBooks'
import BookCard from './components/BookCard'
import BookModal from './components/BookModal'
import Dashboard from './components/Dashboard'

const TABS = ['Dashboard', 'Library', 'Reading Plan']

export default function App() {
  const { books, addBook, updateBook, deleteBook } = useBooks()
  const [tab, setTab] = useState('Dashboard')
  const [filter, setFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const openAdd = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (book) => { setEditing(book); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(null) }

  const handleSave = (fields) => {
    if (editing) updateBook(editing.id, fields)
    else addBook(fields)
  }

  const handleDelete = (id) => {
    if (confirm('Delete this book?')) deleteBook(id)
  }

  const libraryBooks = books.filter(b => b.status !== 'planned')
  const filteredLibrary = filter === 'all'
    ? libraryBooks
    : libraryBooks.filter(b => b.status === filter)

  const plannedBooks = books
    .filter(b => b.status === 'planned')
    .sort((a, b) => (a.plannedMonth ?? '').localeCompare(b.plannedMonth ?? ''))

  const groupedPlanned = plannedBooks.reduce((acc, book) => {
    const key = book.plannedMonth ?? 'Unscheduled'
    if (!acc[key]) acc[key] = []
    acc[key].push(book)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📚 Book Tracker</h1>
            <p className="text-sm text-gray-500">{new Date().getFullYear()}</p>
          </div>
          <button
            onClick={openAdd}
            className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer"
          >
            + Add book
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {tab === 'Dashboard' && <Dashboard books={books} />}

        {/* Library */}
        {tab === 'Library' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'read', label: '✓ Read' },
                { value: 'dnf', label: '✗ DNF' },
              ].map(f => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium cursor-pointer ${
                    filter === f.value
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {filteredLibrary.length === 0 ? (
              <p className="text-center text-gray-400 py-12">No books here yet. Add one!</p>
            ) : (
              <div className="grid gap-3">
                {filteredLibrary.map(book => (
                  <BookCard key={book.id} book={book} onEdit={openEdit} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reading Plan */}
        {tab === 'Reading Plan' && (
          <div className="space-y-6">
            {Object.keys(groupedPlanned).length === 0 ? (
              <p className="text-center text-gray-400 py-12">No books planned yet. Add one!</p>
            ) : (
              Object.entries(groupedPlanned).map(([month, monthBooks]) => (
                <div key={month}>
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    {month === 'Unscheduled'
                      ? 'Unscheduled'
                      : new Date(month + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h2>
                  <div className="grid gap-3">
                    {monthBooks.map(book => (
                      <BookCard key={book.id} book={book} onEdit={openEdit} onDelete={handleDelete} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {modalOpen && (
        <BookModal book={editing} onSave={handleSave} onClose={closeModal} />
      )}
    </div>
  )
}
