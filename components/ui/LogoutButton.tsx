"use client";

import { Button } from "@/components/ui/Button";

export function LogoutButton() {
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
    >
      登出
    </Button>
  );
}