// Supabase Database Types
// Run: npx supabase gen types typescript --linked > types/database.ts
// or paste output from Supabase dashboard → Project Settings → API → TypeScript

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      houses: {
        Row: {
          id: string
          address: string
          city: string | null
          street: string | null
          house_number: string | null
          postal_code: string | null
          apartment_count: number | null
          manager_id: string | null
          slug: string | null
          lat: number | null
          lng: number | null
          district: string | null
          year_built: number | null
          floors: number | null
          building_type: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          address: string
          city?: string | null
          street?: string | null
          house_number?: string | null
          postal_code?: string | null
          apartment_count?: number | null
          manager_id?: string | null
          slug?: string | null
          lat?: number | null
          lng?: number | null
          district?: string | null
          year_built?: number | null
          floors?: number | null
          building_type?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          address?: string
          city?: string | null
          street?: string | null
          house_number?: string | null
          postal_code?: string | null
          apartment_count?: number | null
          manager_id?: string | null
          slug?: string | null
          lat?: number | null
          lng?: number | null
          district?: string | null
          year_built?: number | null
          floors?: number | null
          building_type?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      residents: {
        Row: {
          id: string
          user_id: string
          house_id: string
          apartment_number: string
          full_name: string
          phone: string | null
          role: 'owner' | 'tenant' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          house_id: string
          apartment_number: string
          full_name: string
          phone?: string | null
          role?: 'owner' | 'tenant' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          house_id?: string
          apartment_number?: string
          full_name?: string
          phone?: string | null
          role?: 'owner' | 'tenant' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      problems: {
        Row: {
          id: string
          house_id: string
          resident_id: string | null
          title: string
          description: string | null
          category: string
          priority: 'low' | 'medium' | 'high'
          status: 'open' | 'in_progress' | 'resolved' | 'closed'
          photo_urls: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          house_id: string
          resident_id?: string | null
          title: string
          description?: string | null
          category?: string
          priority?: 'low' | 'medium' | 'high'
          status?: 'open' | 'in_progress' | 'resolved' | 'closed'
          photo_urls?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          house_id?: string
          resident_id?: string | null
          title?: string
          description?: string | null
          category?: string
          priority?: 'low' | 'medium' | 'high'
          status?: 'open' | 'in_progress' | 'resolved' | 'closed'
          photo_urls?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      polls: {
        Row: {
          id: string
          house_id: string
          created_by: string | null
          title: string
          description: string | null
          options: Json
          start_date: string
          end_date: string | null
          status: 'draft' | 'active' | 'closed'
          created_at: string
        }
        Insert: {
          id?: string
          house_id: string
          created_by?: string | null
          title: string
          description?: string | null
          options: Json
          start_date?: string
          end_date?: string | null
          status?: 'draft' | 'active' | 'closed'
          created_at?: string
        }
        Update: {
          id?: string
          house_id?: string
          created_by?: string | null
          title?: string
          description?: string | null
          options?: Json
          start_date?: string
          end_date?: string | null
          status?: 'draft' | 'active' | 'closed'
          created_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          poll_id: string
          resident_id: string
          option_id: string
          created_at: string
        }
        Insert: {
          id?: string
          poll_id: string
          resident_id: string
          option_id: string
          created_at?: string
        }
        Update: {
          id?: string
          poll_id?: string
          resident_id?: string
          option_id?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          apartment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          apartment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          apartment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      protocols: {
        Row: {
          id: string
          house_id: string
          created_by: string | null
          meeting_date: string
          title: string
          content: string | null
          file_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          house_id: string
          created_by?: string | null
          meeting_date: string
          title: string
          content?: string | null
          file_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          house_id?: string
          created_by?: string | null
          meeting_date?: string
          title?: string
          content?: string | null
          file_url?: string | null
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
