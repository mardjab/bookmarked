export default function Dashboard({ books }) {
  const year = new Date().getFullYear()
  const read = books.filter(b => b.status === 'read')
  const dnf = books.filter(b => b.status === 'dnf')
  const planned = books.filter(b => b.status === 'planned')

  const enjoyed = read.filter(b => b.rating === 'enjoyed').length
  const neutral = read.filter(b => b.rating === 'neutral').length
  const disliked = read.filter(b => b.rating === 'disliked').length

  const stats = [
    { label: `Read in ${year}`, value: read.length, color: 'bg-green-50 text-green-700 border-green-200' },
    { label: 'Did not finish', value: dnf.length, color: 'bg-red-50 text-red-700 border-red-200' },
    { label: 'Planned', value: planned.length, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`rounded-xl border p-4 text-center ${s.color}`}>
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-sm font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {read.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Enjoyment breakdown</h3>
          <div className="flex gap-4 text-sm">
            <span className="text-green-600">😊 {enjoyed} enjoyed</span>
            <span className="text-gray-500">😐 {neutral} neutral</span>
            <span className="text-red-500">😞 {disliked} disliked</span>
          </div>
          {read.length > 0 && (
            <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden flex">
              {enjoyed > 0 && <div className="bg-green-400 h-full" style={{ width: `${(enjoyed / read.length) * 100}%` }} />}
              {neutral > 0 && <div className="bg-gray-300 h-full" style={{ width: `${(neutral / read.length) * 100}%` }} />}
              {disliked > 0 && <div className="bg-red-400 h-full" style={{ width: `${(disliked / read.length) * 100}%` }} />}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
