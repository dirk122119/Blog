import { notFound } from "next/navigation";
import { getPostBySlug, getMarkdownContent } from "@/lib/posts";
import { getAllPostSlugs } from "@/lib/posts";
import MarkdownContent from "@/components/MarkdownContent";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

// 生成所有靜態路徑
export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

// 設定頁面 metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "文章不存在",
    };
  }

  return {
    title: post.title,
    description: post.description,
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const markdown = await getMarkdownContent(post.markdown_path);

  return (
    <article className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-8">
          <h1 className="mb-4 text-4xl font-bold text-black dark:text-zinc-50">
            {post.title}
          </h1>
          {post.description && (
            <p className="mb-4 text-xl text-zinc-600 dark:text-zinc-400">
              {post.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-500">
            <time dateTime={post.published_at}>
              {format(new Date(post.published_at), "yyyy年MM月dd日", {
                locale: zhTW,
              })}
            </time>
            {post.author && (
              <span>作者：{post.author}</span>
            )}
            {post.tags && post.tags.length > 0 && (
              <div className="flex gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>
        <div className="prose prose-zinc max-w-none dark:prose-invert">
          <MarkdownContent content={markdown} />
        </div>
      </div>
    </article>
  );
}

