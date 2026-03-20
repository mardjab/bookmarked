const STORAGE_KEY = 'book-tracker-books'

export function loadBooks() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveBooks(books) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books))
}

export function createBook({ title, author, status, rating, notes, plannedMonth }) {
  return {
    id: crypto.randomUUID(),
    title,
    author,
    status, // 'read' | 'dnf' | 'planned'
    rating: rating ?? null, // 'enjoyed' | 'neutral' | 'disliked' — only for 'read'
    notes: notes ?? '',
    plannedMonth: plannedMonth ?? null, // e.g. '2026-04' — only for 'planned'
    createdAt: new Date().toISOString(),
  }
}
