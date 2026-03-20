import { useState, useEffect } from 'react'

const MONTHS = Array.from({ length: 12 }, (_, i) => {
  const date = new Date(2026, i, 1)
  return {
    value: `2026-${String(i + 1).padStart(2, '0')}`,
    label: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
  }
})

const defaultForm = {
  title: '',
  author: '',
  status: 'read',
  rating: 'enjoyed',
  notes: '',
  plannedMonth: MONTHS[0].value,
}

export default function BookModal({ book, onSave, onClose }) {
  const [form, setForm] = useState(defaultForm)

  useEffect(() => {
    if (book) {
      setForm({
        title: book.title,
        author: book.author,
        status: book.status,
        rating: book.rating ?? 'enjoyed',
        notes: book.notes ?? '',
        plannedMonth: book.plannedMonth ?? MONTHS[0].value,
      })
    }
  }, [book])

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    onSave({
      title: form.title.trim(),
      author: form.author.trim(),
      status: form.status,
      rating: form.status === 'read' ? form.rating : null,
      notes: form.notes.trim(),
      plannedMonth: form.status === 'planned' ? form.plannedMonth : null,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-5">
          {book ? 'Edit book' : 'Add a book'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="e.g. The Pragmatic Programmer"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.author}
              onChange={e => set('author', e.target.value)}
              placeholder="e.g. Andy Hunt"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <div className="flex gap-2">
              {[
                { value: 'read', label: '✓ Read' },
                { value: 'dnf', label: '✗ Did not finish' },
                { value: 'planned', label: '📅 Planned' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set('status', opt.value)}
                  className={`flex-1 text-xs py-2 px-2 rounded-lg border font-medium transition-colors cursor-pointer ${
                    form.status === opt.value
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {form.status === 'read' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Did you enjoy it?</label>
              <div className="flex gap-2">
                {[
                  { value: 'enjoyed', label: '😊 Enjoyed' },
                  { value: 'neutral', label: '😐 Neutral' },
                  { value: 'disliked', label: '😞 Disliked' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set('rating', opt.value)}
                    className={`flex-1 text-xs py-2 px-2 rounded-lg border font-medium transition-colors cursor-pointer ${
                      form.rating === opt.value
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {form.status === 'planned' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Planned for</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.plannedMonth}
                onChange={e => set('plannedMonth', e.target.value)}
              >
                {MONTHS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={3}
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Optional thoughts..."
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 cursor-pointer"
            >
              {book ? 'Save changes' : 'Add book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
