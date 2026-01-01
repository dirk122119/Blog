import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

// SSG: 在 build 時生成靜態頁面
export const dynamic = "force-static";

export default async function Home() {
  const posts = await getAllPosts();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="mb-12 text-4xl font-bold text-black dark:text-zinc-50">
          部落格
        </h1>
        <div className="space-y-8">
          {posts.length === 0 ? (
            <p className="text-zinc-600 dark:text-zinc-400">尚無文章</p>
          ) : (
            posts.map((post) => (
              <article
                key={post.id}
                className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <Link href={`/posts/${post.slug}`}>
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
                    {format(new Date(post.published_at), "yyyy年MM月dd日", {
                      locale: zhTW,
                    })}
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
