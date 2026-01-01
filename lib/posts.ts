import { supabase, type PostMetadata } from "./supabase";

// 獲取所有文章 metadata
export async function getAllPosts(): Promise<PostMetadata[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch posts: ${error.message}`);
  }

  return data || [];
}

// 根據 slug 獲取單篇文章 metadata
export async function getPostBySlug(slug: string): Promise<PostMetadata | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // 找不到文章
    }
    throw new Error(`Failed to fetch post: ${error.message}`);
  }

  return data;
}

// 從 Supabase Object Storage 獲取 markdown 內容
export async function getMarkdownContent(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from("blog-posts") // bucket 名稱
    .download(path);

  if (error) {
    throw new Error(`Failed to fetch markdown: ${error.message}`);
  }

  return await data.text();
}

// 獲取所有文章的 slug（用於 generateStaticParams）
export async function getAllPostSlugs(): Promise<string[]> {
  const posts = await getAllPosts();
  return posts.map((post) => post.slug);
}

