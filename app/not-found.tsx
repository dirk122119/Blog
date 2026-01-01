import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-black dark:text-zinc-50">
          404
        </h1>
        <p className="mb-8 text-zinc-600 dark:text-zinc-400">
          找不到這個頁面
        </p>
        <Link
          href="/"
          className="rounded-lg bg-black px-6 py-3 text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          回到首頁
        </Link>
      </div>
    </div>
  );
}

