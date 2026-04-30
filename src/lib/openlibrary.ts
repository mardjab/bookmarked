const OL_SEARCH = 'https://openlibrary.org/search.json'
const OL_COVER = 'https://covers.openlibrary.org/b/id'

export interface OLBook {
  ol_id: string
  title: string
  author: string
  cover_url: string | null
  published_year: number | null
  page_count: number | null
  genre: string[]
}

interface OLDoc {
  key: string
  title?: string
  author_name?: string[]
  cover_i?: number
  first_publish_year?: number
  number_of_pages_median?: number
  subject?: string[]
}

export async function searchBooks(query: string): Promise<OLBook[]> {
  if (!query.trim()) return []

  const params = new URLSearchParams({
    q: query,
    fields: 'key,title,author_name,cover_i,first_publish_year,number_of_pages_median,subject',
    limit: '12',
  })

  const res = await fetch(`${OL_SEARCH}?${params}`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) return []

  const data = await res.json()
  return (data.docs ?? []).map((doc: OLDoc): OLBook => ({
    ol_id: doc.key.replace('/works/', ''),
    title: doc.title ?? 'Unknown title',
    author: doc.author_name?.[0] ?? 'Unknown author',
    cover_url: doc.cover_i ? `${OL_COVER}/${doc.cover_i}-M.jpg` : null,
    published_year: doc.first_publish_year ?? null,
    page_count: doc.number_of_pages_median ?? null,
    genre: (doc.subject ?? []).slice(0, 5),
  }))
}
