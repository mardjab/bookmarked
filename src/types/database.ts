export type { Database } from './supabase'
import type { Database } from './supabase'

export type ShelfStatus = Database['public']['Enums']['shelf_status']
export type DnfProgress = Database['public']['Enums']['dnf_progress']

export type Book = Database['public']['Tables']['books']['Row']
export type UserBook = Database['public']['Tables']['user_books']['Row']
export type ShelfLog = Database['public']['Tables']['shelf_log']['Row']
export type Rating = Database['public']['Tables']['ratings']['Row']
export type DnfEntry = Database['public']['Tables']['dnf_entries']['Row']
export type TasteProfile = Database['public']['Tables']['taste_profile']['Row']

export type UserBookWithBook = UserBook & { book: Book }
