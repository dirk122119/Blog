import Link from "next/link";
import { defaultLocale, getTranslation } from "@/lib/i18n";

export default function NotFound() {
  const t = getTranslation(defaultLocale);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-black dark:text-zinc-50">
          404
        </h1>
        <p className="mb-8 text-zinc-600 dark:text-zinc-400">{t.notFound}</p>
        <Link
          href={`/${defaultLocale}`}
          className="rounded-lg bg-black px-6 py-3 text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          {t.backToHome}
        </Link>
      </div>
    </div>
  );
}

