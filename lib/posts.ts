import {
  supabaseServer,
  type PostMetadata,
  type PostWithTranslation,
  type Locale,
} from "./supabase-server";

// 獲取所有文章（指定語言）
export async function getAllPosts(locale: Locale = "zh-TW"): Promise<PostMetadata[]> {
  const { data, error } = await supabaseServer
    .from("posts")
    .select(
      `
      *,
      translation:post_translations!inner(*)
    `
    )
    .eq("post_translations.locale", locale)
    .order("published_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch posts: ${error.message}`);
  }

  // 轉換成扁平結構
  return (
    data?.map((post: any) => ({
      id: post.id,
      slug: post.slug,
      title: post.translation[0].title,
      description: post.translation[0].description || "",
      published_at: post.published_at,
      created_at: post.created_at,
      updated_at: post.updated_at,
      markdown_path: post.translation[0].markdown_path,
      tags: post.tags,
      author: post.author,
      locale: post.translation[0].locale,
    })) || []
  );
}

// 根據 slug 和語言獲取單篇文章
export async function getPostBySlug(
  slug: string,
  locale: Locale = "zh-TW"
): Promise<PostMetadata | null> {
  const { data, error } = await supabaseServer
    .from("posts")
    .select(
      `
      *,
      translation:post_translations!inner(*)
    `
    )
    .eq("slug", slug)
    .eq("post_translations.locale", locale)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // 找不到文章
    }
    throw new Error(`Failed to fetch post: ${error.message}`);
  }

  // 轉換成扁平結構
  return {
    id: data.id,
    slug: data.slug,
    title: data.translation[0].title,
    description: data.translation[0].description || "",
    published_at: data.published_at,
    created_at: data.created_at,
    updated_at: data.updated_at,
    markdown_path: data.translation[0].markdown_path,
    tags: data.tags,
    author: data.author,
    locale: data.translation[0].locale,
  };
}

// 獲取文章的所有可用語言
export async function getPostLocales(slug: string): Promise<Locale[]> {
  const { data, error } = await supabaseServer
    .from("posts")
    .select(
      `
      post_translations(locale)
    `
    )
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return [];
  }

  return (data as any).post_translations.map((t: any) => t.locale);
}

// 從 Supabase Object Storage 獲取 markdown 內容
export async function getMarkdownContent(locale: Locale, path: string): Promise<string> {
  const { data, error } = await supabaseServer.storage
    .from("") // bucket 名稱
    .download(path);

  if (error) {
    throw new Error(`Failed to fetch markdown: ${error.message}`);
  }

  return await data.text();
}

// 獲取所有文章的 slug 和語言組合（用於 generateStaticParams）
export async function getAllPostSlugs(): Promise<Array<{ slug: string; locale: Locale }>> {
  const { data, error } = await supabaseServer
    .from("posts")
    .select(
      `
      slug,
      post_translations(locale)
    `
    );

  if (error) {
    throw new Error(`Failed to fetch post slugs: ${error.message}`);
  }

  // 展開成所有 slug + locale 組合
  const slugs: Array<{ slug: string; locale: Locale }> = [];
  data?.forEach((post: any) => {
    post.post_translations?.forEach((translation: any) => {
      slugs.push({
        slug: post.slug,
        locale: translation.locale,
      });
    });
  });

  return slugs;
}

