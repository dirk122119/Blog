"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/supabase-client";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Background } from "@/components/ui/Background";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";
import MarkdownContent from "@/components/MarkdownContent";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false, loading: () => <p>Loading Editor...</p> }
);

interface PostEditorProps {
  mode: "create" | "edit";
  initialData?: {
    title: string;
    content: string;
    language: "en" | "zh";
    tags: string[];
    slug: string;
    published?: boolean;
  };
}

export default function PostEditor({ mode, initialData }: PostEditorProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [language, setLanguage] = useState<"en" | "zh">(initialData?.language ?? "zh");
  const [tags, setTags] = useState(initialData?.tags?.join(", ") ?? "");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Track the slug for drafts (so we can update instead of insert on second save)
  const [savedSlug, setSavedSlug] = useState<string | null>(initialData?.slug ?? null);

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const isSubmitting = useRef(false);

  const handleCancel = async () => {
    if (uploadedImages.length > 0) {
      if (!confirm("Are you sure you want to cancel? Unsaved images will be deleted.")) {
        return;
      }
      try {
        await supabase.storage.from("images").remove(uploadedImages);
      } catch (err) {
        console.error("Failed to clean up images", err);
      }
    }
    router.back();
  };

  const onPaste = async (event:React.ClipboardEvent) => {
    const dataTransfer = event.clipboardData;
    if (!dataTransfer) return;

    if (dataTransfer.files && dataTransfer.files.length > 0) {
      event.preventDefault();
      const file = dataTransfer.files[0];
      if (!file.type.startsWith("image/")) return;

      setMessage({ type: "success", text: "Uploading image..." });

      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("images").getPublicUrl(filePath);

        setUploadedImages((prev) => [...prev, filePath]);

        const imageMarkdown = `![image](${publicUrl})`;
        setContent((prev) => (prev ? `${prev}\n${imageMarkdown}` : imageMarkdown));
        setMessage(null);
      } catch (error: any) {
        setMessage({ type: "error", text: `Image upload failed: ${error.message}` });
      }
    }
  };

  const triggerDeploy = async (slug: string, trigger: string) => {
    try {
      const deployResponse = await fetch("/api/webhooks/vercel-deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trigger, post_slug: slug }),
      });

      if (!deployResponse.ok) {
        console.error("Failed to trigger deploy:", await deployResponse.text());
        return false;
      }
      return true;
    } catch (deployError) {
      console.error("Error triggering deploy:", deployError);
      return false;
    }
  };

  const generateSlug = async (): Promise<string> => {
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (language === "zh" || !slug) {
      slug = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    }

    const { data: existing } = await supabase
      .from("posts")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    return slug;
  };

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      setMessage({ type: "error", text: "Title is required to save a draft." });
      return;
    }

    setSavingDraft(true);
    setMessage(null);

    try {
      const tagArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      if (savedSlug) {
        // Already exists in DB (edit mode or previously saved draft) — update it
        const { error } = await supabase
          .from("posts")
          .update({ title, content, language, tags: tagArray, published: false })
          .eq("slug", savedSlug);

        if (error) throw error;

        setMessage({ type: "success", text: "Draft saved!" });
      } else {
        // First time saving — insert as draft
        const slug = await generateSlug();

        const { error } = await supabase.from("posts").insert({
          title,
          content,
          language,
          tags: tagArray,
          slug,
          published: false,
        });

        if (error) throw error;

        setSavedSlug(slug);
        setMessage({ type: "success", text: "Draft saved!" });
      }

      setUploadedImages([]);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    isSubmitting.current = true;

    try {
      const tagArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      if (savedSlug) {
        // Update existing post (edit mode or previously saved draft)
        const { error } = await supabase
          .from("posts")
          .update({ title, content, language, tags: tagArray, published: true })
          .eq("slug", savedSlug);

        if (error) throw error;

        const deployed = await triggerDeploy(savedSlug, mode === "create" ? "create" : "update");
        setMessage({
          type: "success",
          text: deployed
            ? "Article published and rebuild triggered!"
            : "Article published! (Rebuild trigger failed, but post is live)",
        });
      } else {
        // Brand new post
        const slug = await generateSlug();

        const { error } = await supabase.from("posts").insert({
          title,
          content,
          language,
          tags: tagArray,
          slug,
          published: true,
        });

        if (error) throw error;

        setSavedSlug(slug);

        const deployed = await triggerDeploy(slug, "create");
        setMessage({
          type: "success",
          text: deployed
            ? "Article published and rebuild triggered!"
            : "Article published! (Rebuild trigger failed, but post is live)",
        });
      }

      setUploadedImages([]);

      setTimeout(() => {
        router.push("/admin");
      }, 1000);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      setMessage({ type: "error", text: message });
    } finally {
      isSubmitting.current = false;
      setLoading(false);
    }
  };

  const isEdit = mode === "edit";

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
                {isEdit ? "editing" : "new post"}
              </div>
              <h1 className="text-4xl font-[800] tracking-tight text-slate-900 dark:text-white">
                {isEdit ? "Edit Post" : "Write New Post"}
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

              {/* Preview Toggle */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                >
                  {showPreview ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Hide Preview
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      Show Preview
                    </>
                  )}
                </button>
                {savedSlug && (
                  <Link
                    href={`/preview/${savedSlug}`}
                    target="_blank"
                    className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-bold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    Full Page Preview
                  </Link>
                )}
              </div>

              {/* Editor / Preview */}
              {showPreview ? (
                <div className="rounded-lg border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm p-8">
                  {content ? (
                    <div className="prose-container">
                      <MarkdownContent content={content} />
                    </div>
                  ) : (
                    <p className="text-slate-400 font-medium text-center py-12">Nothing to preview yet...</p>
                  )}
                </div>
              ) : (
                <div
                  className="rounded-lg border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm font-sans overflow-hidden"
                  data-color-mode="light"
                >
                  <div className="p-1">
                    <MDEditor value={content} onChange={(val) => setContent(val || "")} onPaste={onPaste} />
                  </div>
                </div>
              )}
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
                        onChange={() => setLanguage("zh")}
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
                        onChange={() => setLanguage("en")}
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

                <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-4">
                  {/* Save as Draft */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveDraft}
                    disabled={savingDraft || loading}
                    className="w-full"
                  >
                    {savingDraft ? "Saving..." : "Save as Draft"}
                  </Button>

                  {/* Publish / Update */}
                  <Button
                    type="submit"
                    disabled={loading || savingDraft}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-indigo-300 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  >
                    {loading
                      ? isEdit
                        ? "Updating..."
                        : "Publishing..."
                      : isEdit
                        ? "Update & Publish"
                        : "Publish Post"}
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
