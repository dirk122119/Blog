import { createClient } from "@/lib/supabase/supabase-server";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { Background } from "@/components/ui/Background";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Pencil, Eye } from "lucide-react";
import { DeletePostButton } from "@/components/ui/DeletePostButton";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';
export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, slug, created_at, published, language, tags")
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
              <Link href="/admin" className="text-indigo-600 dark:text-indigo-400">Admin</Link>
            </nav>
            <div className="flex items-center gap-4 border-l border-slate-200 pl-6 dark:border-slate-800">
              <span className="text-sm text-slate-600 dark:text-slate-400">{user.email}</span>
              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-20 lg:py-32">
        {/* Hero Section */}
        <section className="mb-12 space-y-6 max-w-4xl">
          <div className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50/50 px-3 py-1 text-xs font-bold text-indigo-600 dark:border-indigo-900/50 dark:bg-indigo-950/50 dark:text-indigo-400">
            <span className="mr-2 flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
            admin dashboard
          </div>
          <h1 className="text-5xl font-[800] tracking-tight sm:text-6xl lg:text-7xl text-slate-900 dark:text-white leading-[1.1]">
            Welcome back, <br />
            <span className="text-gradient">{user.email}</span>
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl font-medium leading-relaxed">
            Manage your blog posts and content from here.
          </p>
        </section>

        {/* Actions */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/write"
            className="group relative"
          >
            <div className="h-full border border-slate-200/60 dark:border-slate-800/60 rounded-lg bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm p-6 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md dark:bg-indigo-950/50 dark:text-indigo-400">
                  New Post
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                Write New Article
              </h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-4">
                Create and publish a new blog post
              </p>
              <div className="flex items-center text-sm font-bold text-indigo-600 dark:text-indigo-400">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* User Info Card */}
          <div className="h-full border border-slate-200/60 dark:border-slate-800/60 rounded-lg bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm p-6">
            <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md dark:bg-indigo-950/50 dark:text-indigo-400 mb-4">
              User Info
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Account Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Email</p>
                <p className="text-slate-900 dark:text-white font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">User ID</p>
                <p className="text-slate-500 dark:text-slate-400 font-mono text-sm">{user.id}</p>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="h-full border border-slate-200/60 dark:border-slate-800/60 rounded-lg bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm p-6">
            <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md dark:bg-indigo-950/50 dark:text-indigo-400 mb-4">
              Stats
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Overview
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Total Posts</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{posts?.length ?? 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Management */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-[800] tracking-tight text-slate-900 dark:text-white">
              All Posts
            </h2>
          </div>

          {!posts || posts.length === 0 ? (
            <div className="rounded-lg border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400 font-medium">No posts yet. Write your first article!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <div
                  key={post.slug}
                  className="flex items-center justify-between rounded-lg border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm p-4 transition-colors hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-slate-900 dark:text-white truncate">
                        {post.title}
                      </h3>
                      {!post.published && (
                        <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md dark:bg-amber-950/50 dark:text-amber-400">
                          Draft
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                      <time>{format(new Date(post.created_at), "MMM d, yyyy")}</time>
                      <span>·</span>
                      <span className="uppercase text-xs font-bold">{post.language}</span>
                      {post.tags && post.tags.length > 0 && (
                        <>
                          <span>·</span>
                          <span className="truncate">{post.tags.join(", ")}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4 shrink-0">
                    <Link
                      href={`/preview/${post.slug}`}
                      className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
                      title="Preview post"
                      target="_blank"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/admin/write/${post.slug}`}
                      className="rounded-md p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-400 transition-colors"
                      title="Edit post"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <DeletePostButton slug={post.slug} title={post.title} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white/50 dark:border-slate-800 dark:bg-slate-950/50 py-8 mt-20">
        <div className="container mx-auto px-6 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
          © {new Date().getFullYear()} Admin Dashboard. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
