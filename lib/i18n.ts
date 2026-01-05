import type { Locale } from "./supabase/supabase-server";

export const locales: Locale[] = ["zh-TW", "en"];
export const defaultLocale: Locale = "zh-TW";

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

// 語言顯示名稱
export const localeNames: Record<Locale, string> = {
  "zh-TW": "繁體中文",
  en: "English",
};

// UI 翻譯
export const translations = {
  "zh-TW": {
    posts: "文章",
    noArticles: "尚無文章",
    author: "作者",
    notFound: "找不到這個頁面",
    backToHome: "回到首頁",
    articleNotFound: "文章不存在",
    readIn: "閱讀",
  },
  en: {
    posts: "Posts",
    noArticles: "No articles yet",
    author: "Author",
    notFound: "Page not found",
    backToHome: "Back to home",
    articleNotFound: "Article not found",
    readIn: "Read in",
  },
} as const;

export function getTranslation(locale: Locale) {
  return translations[locale];
}

