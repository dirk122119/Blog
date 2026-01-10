import Link from "next/link";
import { createClient } from "@/lib/supabase/supabase-build";
import { format } from "date-fns";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

export const dynamic = "force-static";

export default async function Home() {
  const supabase = createClient();

  const { data: posts } = await supabase
    .from("posts")
    .select("title, slug, created_at, tags, language")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-lg font-bold tracking-tight">Blog</span>
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground">Home</Link>
              <Link href="/about" className="transition-colors hover:text-foreground/80 text-foreground/60">About</Link>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 md:py-24">
        {/* Hero Section */}
        <section className="mb-16 space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            My Tech Blog
          </h1>
          <p className="text-xl text-muted-foreground max-w-[700px]">
            Sharing thoughts on development, technology, and life.
          </p>
        </section>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts?.map((post, index) => {
            const isFeatured = index === 0;

            return (
              <Link
                key={post.slug}
                href={`/posts/${post.slug}`}
                className={cn(
                  "group block transition-all hover:-translate-y-1",
                  isFeatured && "md:col-span-2 lg:col-span-2"
                )}
              >
                <Card className="h-full flex flex-col border-border/50 group-hover:border-border transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <time className="text-xs text-muted-foreground uppercase tracking-wider">
                        {format(new Date(post.created_at), "MMM d, yyyy")}
                      </time>
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                        {post.language}
                      </span>
                    </div>
                    <CardTitle className={cn(
                      "group-hover:text-primary transition-colors",
                      isFeatured ? "text-2xl md:text-3xl" : "text-xl"
                    )}>
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground line-clamp-3">
                      {/* Optional: Add excerpt if available */}
                    </p>
                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-2 pt-0">
                    {post.tags?.slice(0, 3).map((tag: string) => (
                      <span
                        key={tag}
                        className="text-[10px] uppercase tracking-widest text-muted-foreground border px-2 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </CardFooter>
                </Card>
              </Link>
            );
          })}

          {(!posts || posts.length === 0) && (
            <div className="col-span-full py-24 text-center border rounded-lg border-dashed">
              <h3 className="text-xl font-medium mb-2">No posts found</h3>
              <p className="text-muted-foreground">Check back later for new content.</p>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t py-12">
        <div className="container mx-auto px-4 flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} My Tech Blog. Built with Next.js and Tailwind.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="https://github.com" className="hover:text-foreground">GitHub</Link>
            <Link href="https://twitter.com" className="hover:text-foreground">Twitter</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
