import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/supabase-server";
import { deleteFromR2 } from "@/lib/r2";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { keys?: string[] };
  const keys = body?.keys;
  if (!Array.isArray(keys) || keys.length === 0) {
    return NextResponse.json(
      { error: "keys array required" },
      { status: 400 }
    );
  }
  await deleteFromR2(keys);
  return NextResponse.json({ ok: true });
}
