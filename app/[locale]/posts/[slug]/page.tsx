import { notFound } from "next/navigation";
import { getPostBySlug, getMarkdownContent, getPostLocales } from "@/lib/posts";
import { getAllPostSlugs } from "@/lib/posts";
import MarkdownContent from "@/components/MarkdownContent";
import { format } from "date-fns";
import { zhTW, enUS } from "date-fns/locale";
import { getTranslation, localeNames, isValidLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/supabase-server";
import Link from "next/link";

// 生成所有靜態路徑（所有 locale + slug 組合）
export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map(({ slug, locale }) => ({
    locale,
    slug,
  }));
}

// 設定頁面 metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "zh-TW";

  const post = await getPostBySlug(slug, locale);

  if (!post) {
    const t = getTranslation(locale);
    return {
      title: t.articleNotFound,
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
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "zh-TW";

  const post = await getPostBySlug(slug, locale);

  if (!post) {
    notFound();
  }

  const markdown = await getMarkdownContent(locale, post.markdown_path);
  const availableLocales = await getPostLocales(slug);
  const t = getTranslation(locale);
  const dateLocale = locale === "zh-TW" ? zhTW : enUS;

  return (
    <article className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-3xl px-6 py-16">
        {/* 語言切換 */}
        {availableLocales.length > 1 && (
          <div className="mb-6 flex gap-2">
            {availableLocales.map((availableLocale) => (
              <Link
                key={availableLocale}
                href={`/${availableLocale}/posts/${slug}`}
                className={`rounded-lg px-3 py-1 text-sm transition-colors ${
                  availableLocale === locale
                    ? "bg-black text-white dark:bg-zinc-50 dark:text-black"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                }`}
              >
                {localeNames[availableLocale]}
              </Link>
            ))}
          </div>
        )}
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
              {format(
                new Date(post.published_at),
                locale === "zh-TW" ? "yyyy年MM月dd日" : "MMM dd, yyyy",
                { locale: dateLocale }
              )}
            </time>
            {post.author && (
              <span>
                {t.author}：{post.author}
              </span>
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

