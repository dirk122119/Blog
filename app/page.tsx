import Link from "next/link";
import { createClient } from "@/lib/supabase/supabase-build";
import { format } from "date-fns";

export const dynamic = "force-static";

export default async function Home() {
  const supabase = createClient();

  const { data: posts } = await supabase
    .from("posts")
    .select("title, slug, created_at, tags, language")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            My Tech Blog
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Sharing thoughts on development, technology, and life.
          </p>
        </header>

        <div className="space-y-8">
          {posts?.map((post) => (
            <article
              key={post.slug}
              className="group relative rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-4 text-xs text-gray-500">
                <time dateTime={post.created_at}>
                  {format(new Date(post.created_at), "MMMM d, yyyy")}
                </time>
                <div className="flex gap-2">
                   {post.tags?.map((tag: string) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gray-100 px-2.5 py-0.5 font-medium text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 font-medium text-blue-600 uppercase">
                    {post.language}
                  </span>
                </div>
              </div>

              <div className="group relative">
                <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                  <Link href={`/posts/${post.slug}`}>
                    <span className="absolute inset-0" />
                    {post.title}
                  </Link>
                </h3>
              </div>
            </article>
          ))}

          {(!posts || posts.length === 0) && (
            <div className="text-center py-12 text-gray-500">
              No posts found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
