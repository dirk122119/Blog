import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase/supabase-server'

export async function GET(request: Request) {
  console.log(' ===> call back get request', request)
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "redirect" is in param, use it as the redirect URL
  let redirect = searchParams.get('redirect') ?? '/'
  if (!redirect.startsWith('/')) {
    // if "redirect" is not a relative URL, use the default
    redirect = '/'
  }

  if (code) {
    console.log(' code', code)
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      console.log(' isLocalEnv', isLocalEnv)
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${redirect}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirect}`)
      } else {
        return NextResponse.redirect(`${origin}${redirect}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}