import { createClient } from "@/lib/supabase/supabase-build";
import { notFound } from "next/navigation";
import MarkdownContent from "@/components/MarkdownContent";
import { format } from "date-fns";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";

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
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-lg font-bold tracking-tight">Blog</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" href="/">
              Back
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-12 md:py-24">
        <article>
          <header className="mb-16 text-center">
            <div className="flex justify-center gap-2 mb-6">
              {post.tags?.map((tag: string) => (
                <span
                  key={tag}
                  className="text-[10px] uppercase tracking-widest text-muted-foreground border px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
              {post.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <time dateTime={post.created_at}>
                {format(new Date(post.created_at), "MMMM d, yyyy")}
              </time>
              <span>•</span>
              <span className="bg-muted px-2 py-0.5 rounded text-xs">{post.language}</span>
            </div>
          </header>

          <div className="mt-12">
            <MarkdownContent content={post.content || ""} />
          </div>
        </article>

        <footer className="mt-24 pt-12 border-t text-center">
          <Button variant="outline" href="/">
            Back to Home
          </Button>
        </footer>
      </main>
    </div>
  );
}
