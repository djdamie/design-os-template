import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not configured')
}

// Browser client - syncs auth sessions to cookies for middleware/SSR
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Server-side client for API routes (uses service role key for admin operations)
export function createServiceClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase server environment variables not configured')
  }
  return createClient(supabaseUrl, serviceRoleKey)
}
