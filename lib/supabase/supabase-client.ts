import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser client for Client Components.
 * Use this in components with "use client" directive.
 * 
 * @example
 * "use client"
 * import { createClient } from "@/lib/supabase/supabase-client"
 * const supabase = createClient()
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

