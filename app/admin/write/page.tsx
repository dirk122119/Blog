"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/supabase-client";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Write New Post</h1>
          <button
            onClick={handleCancel}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <div
              className={`rounded-md p-4 ${
                message.type === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-12">
            <div className="space-y-6 md:col-span-8">
              {/* Title */}
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter post title..."
                  required
                />
              </div>

              {/* Editor */}
              <div className="rounded-lg bg-white shadow-sm font-sans" data-color-mode="light">
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
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-medium text-gray-900">Post Settings</h3>
                
                {/* Language */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Language</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="language"
                        value="zh"
                        checked={language === "zh"}
                        onChange={(e) => setLanguage("zh")}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700">Chinese</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="language"
                        value="en"
                        checked={language === "en"}
                        onChange={(e) => setLanguage("en")}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700">English</span>
                    </label>
                  </div>
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <label htmlFor="tags" className="mb-2 block text-sm font-medium text-gray-700">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    placeholder="technology, life, coding"
                  />
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300"
                  >
                    {loading ? "Publishing..." : "Publish Post"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
