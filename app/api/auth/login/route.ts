import { createClient } from "@/lib/supabase/supabase-server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const provider = requestUrl.searchParams.get("provider") || "google";
  const redirect = requestUrl.searchParams.get("redirect") || "/admin";
  const redirectTo = `${requestUrl.origin}/api/auth/callback?redirect=${encodeURIComponent(redirect)}`;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as any,
    options: {
      redirectTo: redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    return NextResponse.redirect(`${requestUrl.origin}/auth/error`);
  }

  return NextResponse.redirect(data.url);
}

