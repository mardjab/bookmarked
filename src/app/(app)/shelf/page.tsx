import { getUserBooks, getShelfCounts } from '@/lib/supabase/queries'
import ShelfView from '@/components/ShelfView'
import type { ShelfStatus } from '@/types/database'

const VALID_TABS: ShelfStatus[] = ['reading', 'want_to_read', 'finished', 'dnf']

interface Props {
  searchParams: { tab?: string }
}

export default async function ShelfPage({ searchParams }: Props) {
  const tab = (VALID_TABS.includes(searchParams.tab as ShelfStatus)
    ? searchParams.tab
    : 'reading') as ShelfStatus

  const [books, counts] = await Promise.all([
    getUserBooks(tab),
    getShelfCounts(),
  ])

  return <ShelfView books={books} counts={counts} activeTab={tab} />
}
