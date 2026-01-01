import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

