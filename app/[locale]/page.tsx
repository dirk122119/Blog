import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { format } from "date-fns";
import { zhTW, enUS } from "date-fns/locale";
import { locales, getTranslation, isValidLocale, localeNames } from "@/lib/i18n";
import type { Locale } from "@/lib/supabase-server";

// SSG: 在 build 時生成靜態頁面
export const dynamic = "force-static";

// 生成所有語言的靜態路徑
export async function generateStaticParams() {
  return locales.map((locale) => ({
    locale,
  }));
}

// 設定頁面 metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "zh-TW";
  const t = getTranslation(locale);

  return {
    title: t.posts,
    description: t.posts,
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "zh-TW";
  const posts = await getAllPosts(locale);
  const t = getTranslation(locale);
  const dateLocale = locale === "zh-TW" ? zhTW : enUS;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-4xl px-6 py-16">
        {/* 語言切換 */}
        <div className="mb-8 flex gap-2">
          {locales.map((availableLocale) => (
            <Link
              key={availableLocale}
              href={`/${availableLocale}`}
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

        <h1 className="mb-12 text-4xl font-bold text-black dark:text-zinc-50">
          {t.posts}
        </h1>
        <div className="space-y-8">
          {posts.length === 0 ? (
            <p className="text-zinc-600 dark:text-zinc-400">{t.noArticles}</p>
          ) : (
            posts.map((post) => (
              <article
                key={post.id}
                className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <Link href={`/${locale}/posts/${post.slug}`}>
                  <h2 className="mb-2 text-2xl font-semibold text-black hover:text-zinc-600 dark:text-zinc-50 dark:hover:text-zinc-300">
                    {post.title}
                  </h2>
                </Link>
                {post.description && (
                  <p className="mb-4 text-zinc-600 dark:text-zinc-400">
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
              </article>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

