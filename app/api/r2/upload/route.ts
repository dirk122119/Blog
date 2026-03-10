import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/supabase-server";
import { uploadToR2 } from "@/lib/r2";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ ok: true, endpoint: "r2/upload" });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file || !file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Invalid or missing image" },
      { status: 400 }
    );
  }
  const ext = file.name.split(".").pop() || "png";
  const key = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await uploadToR2(key, buffer, file.type);
  return NextResponse.json({ url, key });
}
