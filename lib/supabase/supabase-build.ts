import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Build-time Supabase client for static generation.
 * Does not use cookies, safe to use in generateStaticParams and build-time data fetching.
 */
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}

