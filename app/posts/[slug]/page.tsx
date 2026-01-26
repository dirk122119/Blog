import { createClient } from "@/lib/supabase/supabase-build";
import { notFound } from "next/navigation";
import MarkdownContent from "@/components/MarkdownContent";
import { format } from "date-fns";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { Background } from "@/components/ui/Background";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-static";

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
    <div className="relative min-h-screen">
      <Background />
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-950/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-extrabold tracking-tighter text-slate-900 dark:text-white">BLOG.</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" href="/" className="font-bold text-slate-500 hover:text-slate-900">
              <ChevronLeft className="mr-1 h-4 w-4" /> Back to Library
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-6 py-20 lg:py-32">
        <article>
          <header className="mb-20 text-center space-y-8">
            <div className="flex justify-center gap-3">
              {post.tags?.map((tag: string) => (
                <span
                  key={tag}
                  className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-md dark:bg-indigo-950/50 dark:text-indigo-400"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <h1 className="text-5xl font-[800] tracking-tight sm:text-6xl text-slate-900 dark:text-white leading-[1.1] max-w-4xl mx-auto">
              {post.title}
            </h1>
            
            <div className="flex items-center justify-center gap-6 text-sm font-bold text-slate-400 uppercase tracking-widest">
              <time dateTime={post.created_at} suppressHydrationWarning>
                {format(new Date(post.created_at), "MMMM d, yyyy")}
              </time>
            </div>
          </header>

          <div className="prose-container relative">
            <MarkdownContent content={post.content || ""} />
          </div>
        </article>

      </main>
      <footer className="border-t border-slate-200 bg-white/50 dark:border-slate-800 dark:bg-slate-950/50 py-8">
        <div className="container mx-auto px-6 text-center text-xs font-bold text-slate-400 uppercase tracking-widest" suppressHydrationWarning>
          © {new Date().getFullYear()} Corporate Trust Design System. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
