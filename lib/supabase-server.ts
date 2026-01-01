import { createClient } from "@supabase/supabase-js";

// Server-only 環境變數（不會被打包到客戶端）
const supabaseUrl = process.env.SUPABASE_URL!;

// 優先使用 service role key（僅在 server-side 使用，有完整權限）
// 如果沒有，則使用 anon key（配合 RLS 使用）
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

// Server-only Supabase 客戶端
export const supabaseServer = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// 文章 metadata 類型
export interface PostMetadata {
  id: string;
  slug: string;
  title: string;
  description: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  markdown_path: string; // Object Storage 中的路徑
  tags?: string[];
  author?: string;
}

