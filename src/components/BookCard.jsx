const STATUS_STYLES = {
  read: 'bg-green-100 text-green-700',
  dnf: 'bg-red-100 text-red-700',
  planned: 'bg-blue-100 text-blue-700',
}

const STATUS_LABELS = {
  read: '✓ Read',
  dnf: '✗ DNF',
  planned: '📅 Planned',
}

const RATING_LABELS = {
  enjoyed: '😊 Enjoyed',
  neutral: '😐 Neutral',
  disliked: '😞 Disliked',
}

export default function BookCard({ book, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{book.title}</h3>
          {book.author && (
            <p className="text-sm text-gray-500 truncate">{book.author}</p>
          )}
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${STATUS_STYLES[book.status]}`}>
          {STATUS_LABELS[book.status]}
        </span>
      </div>

      {book.status === 'read' && book.rating && (
        <p className="text-sm text-gray-600">{RATING_LABELS[book.rating]}</p>
      )}

      {book.status === 'planned' && book.plannedMonth && (
        <p className="text-sm text-gray-600">
          {new Date(book.plannedMonth + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}
        </p>
      )}

      {book.notes && (
        <p className="text-sm text-gray-500 italic line-clamp-2">"{book.notes}"</p>
      )}

      <div className="flex gap-2 mt-1">
        <button
          onClick={() => onEdit(book)}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(book.id)}
          className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
