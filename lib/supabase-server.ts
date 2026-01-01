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

// 支援的語系
export type Locale = "zh-TW" | "en";

// 文章基本資料（語言中立）
export interface Post {
  id: string;
  slug: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  author?: string;
  tags?: string[];
}

// 文章翻譯資料（語言特定）
export interface PostTranslation {
  id: string;
  post_id: string;
  locale: Locale;
  title: string;
  description?: string;
  markdown_path: string;
  created_at: string;
  updated_at: string;
}

// 完整文章資料（包含翻譯）
export interface PostWithTranslation extends Post {
  translation: PostTranslation;
}

// 舊的介面保留（為了向後相容）
export interface PostMetadata {
  id: string;
  slug: string;
  title: string;
  description: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  markdown_path: string;
  tags?: string[];
  author?: string;
  locale?: Locale;
}

