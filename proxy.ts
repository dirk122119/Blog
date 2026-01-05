import { type NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/supabase-proxy";

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  // 保護 admin 路由
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/auth/login";
      redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return Response.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

