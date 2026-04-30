'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AppNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="w-56 shrink-0 border-r border-neutral-800 flex flex-col py-8 px-5 gap-1">
      <span className="text-white font-bold text-lg mb-8 tracking-tight">Bookmarked</span>

      <NavLink href="/shelf" active={pathname === '/shelf'}>
        My Shelf
      </NavLink>

      <div className="mt-auto">
        <button
          onClick={handleSignOut}
          className="text-neutral-500 hover:text-neutral-300 text-sm transition-colors"
        >
          Sign out
        </button>
      </div>
    </nav>
  )
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`text-sm px-3 py-2 rounded-lg transition-colors ${
        active
          ? 'bg-neutral-800 text-white'
          : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
      }`}
    >
      {children}
    </Link>
  )
}
