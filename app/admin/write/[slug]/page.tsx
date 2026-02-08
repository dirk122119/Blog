"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/supabase-client";
import { useParams, useRouter } from "next/navigation";
import PostEditor from "@/components/PostEditor";
import { Background } from "@/components/ui/Background";

export default function EditPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const supabase = createClient();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPost() {
      const { data, error } = await supabase
        .from("posts")
        .select("title, content, language, tags, slug, published")
        .eq("slug", slug)
        .single();

      if (error || !data) {
        setError("Post not found");
        setLoading(false);
        return;
      }

      setPost(data);
      setLoading(false);
    }

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <Background />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-slate-500 dark:text-slate-400 font-medium">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="relative min-h-screen">
        <Background />
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <p className="text-red-500 font-medium">{error ?? "Post not found"}</p>
          <button
            onClick={() => router.push("/admin")}
            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-semibold"
          >
            Back to Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <PostEditor
      mode="edit"
      initialData={{
        title: post.title,
        content: post.content,
        language: post.language,
        tags: post.tags ?? [],
        slug: post.slug,
        published: post.published,
      }}
    />
  );
}
