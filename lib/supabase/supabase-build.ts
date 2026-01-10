import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Build-time Supabase client for static generation (SSG).
 * Does not use cookies, safe to use in:
 * - generateStaticParams()
 * - Static page components with export const dynamic = "force-static"
 * 
 * ⚠️ Do NOT use in Server Components that need authentication/session.
 * Use supabase-server.ts instead for those cases.
 * 
 * @example
 * export async function generateStaticParams() {
 *   const supabase = createClient()
 *   const { data } = await supabase.from("posts").select("slug")
 * }
 */
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}

