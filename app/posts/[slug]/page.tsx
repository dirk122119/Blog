import { createClient } from "@/lib/supabase/supabase-build";
import { notFound } from "next/navigation";
import MarkdownContent from "@/components/MarkdownContent";
import { format } from "date-fns";

export const dynamic = "force-static";

// Generate static params for all published posts
export async function generateStaticParams() {
  const supabase = createClient();
  
  const { data: posts } = await supabase
    .from("posts")
    .select("slug")
    .eq("published", true);

  return (posts || []).map((post) => ({
    slug: post.slug,
  }));
}

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PostPage(props: PostPageProps) {
  const params = await props.params;
  const { slug } = params;
  
  const supabase = createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <div className="mb-4 flex justify-center gap-2">
            {post.tags?.map((tag: string) => (
              <span
                key={tag}
                className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
              >
                {tag}
              </span>
            ))}
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            {post.title}
          </h1>
          <div className="text-gray-500">
            <time dateTime={post.created_at}>
              {format(new Date(post.created_at), "MMMM d, yyyy")}
            </time>
          </div>
        </header>

        <div className="prose prose-lg mx-auto max-w-none dark:prose-invert">
          <MarkdownContent content={post.content || ""} />
        </div>
      </article>
    </div>
  );
}
