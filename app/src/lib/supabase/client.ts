import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not configured')
}

// Client-side Supabase client (uses anon key)
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
)

// Server-side Supabase client (uses service role key for admin operations)
export function createServerClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase server environment variables not configured')
  }
  return createClient(supabaseUrl, serviceRoleKey)
}
