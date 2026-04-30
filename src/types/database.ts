export type ShelfStatus = 'want_to_read' | 'reading' | 'finished' | 'dnf'
export type DnfProgress = 'first_10' | 'around_25' | 'around_50' | 'over_50'

export interface Database {
  public: {
    Tables: {
      books: {
        Row: {
          id: string
          ol_id: string
          title: string
          author: string
          cover_url: string | null
          genre: string[]
          page_count: number | null
          published_year: number | null
          description: string | null
          asin: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['books']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['books']['Insert']>
      }
      user_books: {
        Row: {
          id: string
          user_id: string
          book_id: string
          shelf: ShelfStatus
          added_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_books']['Row'], 'id' | 'added_at' | 'updated_at'>
        Update: Partial<Pick<Database['public']['Tables']['user_books']['Row'], 'shelf'>>
      }
      shelf_log: {
        Row: {
          id: string
          user_id: string
          book_id: string
          from_shelf: ShelfStatus | null
          to_shelf: ShelfStatus
          changed_at: string
        }
        Insert: Omit<Database['public']['Tables']['shelf_log']['Row'], 'id' | 'changed_at'>
        Update: never
      }
      ratings: {
        Row: {
          id: string
          user_id: string
          book_id: string
          enjoyment: number
          recommendability: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['ratings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Pick<Database['public']['Tables']['ratings']['Row'], 'enjoyment' | 'recommendability' | 'notes'>>
      }
      dnf_entries: {
        Row: {
          id: string
          user_id: string
          book_id: string
          reasons: string[]
          progress: DnfProgress
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['dnf_entries']['Row'], 'id' | 'created_at'>
        Update: Partial<Pick<Database['public']['Tables']['dnf_entries']['Row'], 'reasons' | 'progress' | 'notes'>>
      }
      taste_profile: {
        Row: {
          id: string
          user_id: string
          signals: Record<string, unknown>
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['taste_profile']['Row'], 'id' | 'updated_at'>
        Update: Partial<Pick<Database['public']['Tables']['taste_profile']['Row'], 'signals'>>
      }
    }
  }
}

// Convenience row types
export type Book = Database['public']['Tables']['books']['Row']
export type UserBook = Database['public']['Tables']['user_books']['Row']
export type ShelfLog = Database['public']['Tables']['shelf_log']['Row']
export type Rating = Database['public']['Tables']['ratings']['Row']
export type DnfEntry = Database['public']['Tables']['dnf_entries']['Row']
export type TasteProfile = Database['public']['Tables']['taste_profile']['Row']

// Joined type used throughout the UI
export type UserBookWithBook = UserBook & { book: Book }
