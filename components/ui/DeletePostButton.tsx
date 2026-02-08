"use client";

import { createClient } from "@/lib/supabase/supabase-client";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export function DeletePostButton({ slug, title }: { slug: string; title: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`確定要刪除「${title}」嗎？此操作無法復原。`)) return;

    setDeleting(true);

    const { error } = await supabase.from("posts").delete().eq("slug", slug);

    if (error) {
      alert(`刪除失敗: ${error.message}`);
      setDeleting(false);
      return;
    }

    // trigger redeploy
    try {
      await fetch("/api/webhooks/vercel-deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trigger: "delete", post_slug: slug }),
      });
    } catch {
      // non-blocking
    }

    router.refresh();
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400 transition-colors disabled:opacity-50"
      title="Delete post"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
