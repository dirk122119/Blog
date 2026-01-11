import Link from "next/link";
import { createClient } from "@/lib/supabase/supabase-build";
import { format } from "date-fns";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Background } from "@/components/ui/Background";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-static";

export default async function Home() {
  const supabase = createClient();

  const { data: posts } = await supabase
    .from("posts")
    .select("title, slug, created_at, tags, language")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="relative min-h-screen">
      <Background />
      
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-950/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-extrabold tracking-tighter text-slate-900 dark:text-white">BLOG.</span>
          </Link>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
              <Link href="/" className="text-indigo-600 dark:text-indigo-400">Home</Link>
            </nav>
            <div className="flex items-center gap-4 border-l border-slate-200 pl-6 dark:border-slate-800">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-20 lg:py-32">
        {/* Hero Section */}
        <section className="mb-24 space-y-6 max-w-4xl">
          <div className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50/50 px-3 py-1 text-xs font-bold text-indigo-600 dark:border-indigo-900/50 dark:bg-indigo-950/50 dark:text-indigo-400">
            <span className="mr-2 flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
            blog
          </div>
          <h1 className="text-5xl font-[800] tracking-tight sm:text-6xl lg:text-7xl text-slate-900 dark:text-white leading-[1.1]">
            Insightful Thoughts <br />
            <span className="text-gradient">for Modern Devs.</span>
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl font-medium leading-relaxed" suppressHydrationWarning>
            Expert analysis on frontend architecture, UI/UX design, and the evolving landscape of high-growth tech stacks.
          </p>
        </section>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          {posts?.map((post, index) => {
            const isFeatured = index === 0;

            return (
              <Link
                key={post.slug}
                href={`/posts/${post.slug}`}
                className={cn(
                  "group relative",
                  isFeatured && "md:col-span-1 lg:col-span-1"
                )}
              >
                <Card className="h-full border-slate-200/60 dark:border-slate-800/60 overflow-hidden flex flex-col">
                  <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {post.tags?.slice(0, 2).map((tag: string) => (
                          <span
                            key={tag}
                            className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md dark:bg-indigo-950/50 dark:text-indigo-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <time className="text-xs font-semibold text-slate-400" suppressHydrationWarning>
                        {format(new Date(post.created_at), "MMM d, yyyy")}
                      </time>
                    </div>
                    <CardTitle className={cn(
                      "transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400",
                      isFeatured ? "text-3xl md:text-4xl" : "text-2xl"
                    )}>
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-slate-500 dark:text-slate-400 line-clamp-3 font-medium">
                      Discover the latest trends and techniques that are shaping the future of enterprise software design.
                    </p>
                  </CardContent>
                  <CardFooter className="flex items-center text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    Read Full Case Study
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white/50 dark:border-slate-800 dark:bg-slate-950/50 py-8">
        {/* <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2 space-y-4">
            <span className="text-xl font-extrabold tracking-tighter text-slate-900 dark:text-white">BLOG.</span>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm font-medium">
              A premium space dedicated to engineering excellence and sophisticated design principles.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
              <li><Link href="/" className="hover:text-indigo-600 transition-colors">Archive</Link></li>
              <li><Link href="/" className="hover:text-indigo-600 transition-colors">Newsletter</Link></li>
              <li><Link href="/" className="hover:text-indigo-600 transition-colors">Resources</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
              <li><Link href="/" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/" className="hover:text-indigo-600 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div> */}
        <div className="container mx-auto px-6 text-center text-xs font-bold text-slate-400 uppercase tracking-widest" suppressHydrationWarning>
          © {new Date().getFullYear()} Corporate Trust Design System. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
