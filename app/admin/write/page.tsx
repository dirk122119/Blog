"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/supabase-client";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Background } from "@/components/ui/Background";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false, loading: () => <p>Loading Editor...</p> }
);

export default function WritePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState<"en" | "zh">("zh");
  const [tags, setTags] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // Track uploaded images to delete them if user cancels
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const isSubmitting = useRef(false);

  // Cleanup on cancel
  const handleCancel = async () => {
    if (uploadedImages.length > 0) {
      if (!confirm("Are you sure you want to cancel? Unsaved images will be deleted.")) {
        return;
      }
      
      try {
        await supabase.storage.from("images").remove(uploadedImages);
        console.log("Cleaned up images:", uploadedImages);
      } catch (err) {
        console.error("Failed to clean up images", err);
      }
    }
    router.back();
  };

  const onPaste = async (event: any) => {
    const dataTransfer = event.clipboardData;
    if (!dataTransfer) return; // Not a clipboard event

    // Check for files
    if (dataTransfer.files && dataTransfer.files.length > 0) {
      event.preventDefault();
      const file = dataTransfer.files[0];
      
      if (!file.type.startsWith("image/")) return;

      setMessage({ type: "success", text: "Uploading image..." });

      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from("images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("images")
          .getPublicUrl(filePath);

        // Append to tracked images for cleanup
        setUploadedImages((prev) => [...prev, filePath]);

        // Insert markdown
        const imageMarkdown = `![image](${publicUrl})`;
        
        // Simple insertion at end (enhancing this to insert at cursor would be better but requires ref, simplicity first)
        setContent((prev) => prev ? `${prev}\n${imageMarkdown}` : imageMarkdown);
        
        setMessage(null);
      } catch (error: any) {
        setMessage({ type: "error", text: `Image upload failed: ${error.message}` });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    isSubmitting.current = true;

    try {
      // Generate slug
      let slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      
      if (language === 'zh' || !slug) {
         slug = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      }

      // Check for existing slug to avoid collision (simple check)
      const { data: existing } = await supabase
        .from("posts")
        .select("slug")
        .eq("slug", slug)
        .maybeSingle();

      if (existing) {
        slug = `${slug}-${Date.now()}`;
      }

      const tagArray = tags.split(",").map((t) => t.trim()).filter(Boolean);

      const { error } = await supabase.from("posts").insert({
        title,
        content,
        language,
        tags: tagArray,
        slug,
        published: true,
      });

      if (error) throw error;

      setMessage({ type: "success", text: "Article published successfully!" });

      // trigger vercel deploy
      try {
        const deployResponse = await fetch('/api/webhooks/vercel-deploy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            trigger: 'manual',
            post_slug: slug,
          }),
        });
  
        if (!deployResponse.ok) {
          console.error('Failed to trigger deploy:', await deployResponse.text());
          setMessage({ type: "success", text: "Article published, but rebuild may have failed. Check Vercel dashboard." });
        } else {
          const deployData = await deployResponse.json();
          setMessage({ type: "success", text: "Article published and rebuild triggered!" });
        }
      } catch (deployError) {
        console.error('Error triggering deploy:', deployError);
        // 不阻擋用戶，文章已經發布成功
        setMessage({ type: "success", text: "Article published! (Rebuild trigger failed, but post is live)" });
      }
      
      // Clear tracked images so they aren't deleted
      setUploadedImages([]);
      
      // Wait a sec then redirect
      setTimeout(() => {
         router.push('/admin'); 
      }, 1000);

    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
      isSubmitting.current = false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <Background />
      
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-950/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/admin" className="flex items-center space-x-2">
            <span className="text-xl font-extrabold tracking-tighter text-slate-900 dark:text-white">BLOG.</span>
          </Link>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
              <Link href="/" className="text-indigo-600 dark:text-indigo-400">Home</Link>
              <Link href="/admin" className="text-indigo-600 dark:text-indigo-400">Admin</Link>
            </nav>
            <div className="flex items-center gap-4 border-l border-slate-200 pl-6 dark:border-slate-800">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 lg:py-20">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <div className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50/50 px-3 py-1 text-xs font-bold text-indigo-600 dark:border-indigo-900/50 dark:bg-indigo-950/50 dark:text-indigo-400 mb-2">
                <span className="mr-2 flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                new post
              </div>
              <h1 className="text-4xl font-[800] tracking-tight text-slate-900 dark:text-white">
                Write New Post
              </h1>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <div
              className={`rounded-lg border p-4 ${
                message.type === "success"
                  ? "border-green-200 bg-green-50/50 text-green-700 dark:border-green-900/50 dark:bg-green-950/50 dark:text-green-400"
                  : "border-red-200 bg-red-50/50 text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-12">
            <div className="space-y-6 md:col-span-8">
              {/* Title */}
              <div className="rounded-lg border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm p-6">
                <label htmlFor="title" className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:border-indigo-400"
                  placeholder="Enter post title..."
                  required
                />
              </div>

              {/* Editor */}
              <div className="rounded-lg border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm font-sans overflow-hidden" data-color-mode="light">
                <div className="p-1">
                  <MDEditor
                    value={content}
                    onChange={(val) => setContent(val || "")}
                    onPaste={onPaste}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6 md:col-span-4">
              {/* Settings */}
              <div className="rounded-lg border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm p-6">
                <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md dark:bg-indigo-950/50 dark:text-indigo-400 mb-4 inline-block">
                  Settings
                </div>
                
                {/* Language */}
                <div className="mb-6">
                  <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-slate-400">Language</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="language"
                        value="zh"
                        checked={language === "zh"}
                        onChange={(e) => setLanguage("zh")}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 dark:text-indigo-400"
                      />
                      <span className="ml-2 text-slate-700 dark:text-slate-300 font-medium">Chinese</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="language"
                        value="en"
                        checked={language === "en"}
                        onChange={(e) => setLanguage("en")}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 dark:text-indigo-400"
                      />
                      <span className="ml-2 text-slate-700 dark:text-slate-300 font-medium">English</span>
                    </label>
                  </div>
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <label htmlFor="tags" className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="block w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:border-indigo-400"
                    placeholder="technology, life, coding"
                  />
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-indigo-300 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  >
                    {loading ? "Publishing..." : "Publish Post"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}