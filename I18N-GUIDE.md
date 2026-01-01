# 多國語系使用指南

## 資料庫架構

### posts 表（語言中立資訊）
- `id`: 文章 ID
- `slug`: 基礎 slug（例如：`my-first-post`）
- `published_at`: 發布時間
- `author`: 作者
- `tags`: 標籤

### post_translations 表（語言特定內容）
- `post_id`: 關聯到 posts.id
- `locale`: 語系代碼（`zh-TW`, `en`）
- `title`: 標題
- `description`: 描述
- `markdown_path`: 該語言的 markdown 檔案路徑

## 新增文章

### 1. 在資料庫插入資料

```sql
-- 1. 新增文章（語言中立資訊）
INSERT INTO posts (slug, author, tags) 
VALUES ('my-second-post', '作者名稱', ARRAY['Next.js', 'TypeScript']);

-- 2. 新增中文翻譯
INSERT INTO post_translations (post_id, locale, title, description, markdown_path)
VALUES (
  (SELECT id FROM posts WHERE slug = 'my-second-post'),
  'zh-TW',
  '我的第二篇文章',
  '這是中文描述',
  'posts/my-second-post.zh-TW.md'
);

-- 3. 新增英文翻譯
INSERT INTO post_translations (post_id, locale, title, description, markdown_path)
VALUES (
  (SELECT id FROM posts WHERE slug = 'my-second-post'),
  'en',
  'My Second Post',
  'This is English description',
  'posts/my-second-post.en.md'
);
```

### 2. 上傳 Markdown 檔案到 Supabase Storage

需要上傳兩個檔案：
- `posts/my-second-post.zh-TW.md`（中文內容）
- `posts/my-second-post.en.md`（英文內容）

## URL 結構

### 首頁
- `/` - 自動重定向到 `/zh-TW`
- `/zh-TW` - 繁體中文首頁
- `/en` - 英文首頁

### 文章頁面
- `/zh-TW/posts/my-first-post` - 繁體中文版本
- `/en/posts/my-first-post` - 英文版本

URL 結構採用**多個獨立動態段**設計，語言代碼直接在路徑中，對 SEO 最友好。

## 語言切換

文章頁面會自動顯示語言切換按鈕，只有當文章有多個語言版本時才會出現。

## 新增更多語言

### 1. 更新類型定義

在 `lib/supabase-server.ts` 中：

```typescript
export type Locale = "zh-TW" | "en" | "ja" | "ko"; // 加入日文、韓文等
```

### 2. 更新 i18n 配置

在 `lib/i18n.ts` 中：

```typescript
export const locales: Locale[] = ["zh-TW", "en", "ja", "ko"];

export const localeNames: Record<Locale, string> = {
  "zh-TW": "繁體中文",
  en: "English",
  ja: "日本語",
  ko: "한국어",
};

export const translations = {
  "zh-TW": { /* ... */ },
  en: { /* ... */ },
  ja: { /* 日文翻譯 */ },
  ko: { /* 韓文翻譯 */ },
};
```

### 3. 新增翻譯資料

```sql
INSERT INTO post_translations (post_id, locale, title, description, markdown_path)
VALUES (
  (SELECT id FROM posts WHERE slug = 'my-first-post'),
  'ja',
  '私の最初の投稿',
  '日本語の説明',
  'posts/my-first-post.ja.md'
);
```

## 進階：實作語言路由

✅ **已實作！** 目前使用 `/[locale]/posts/[slug]` 結構。

目錄結構：
```
app/
├── page.tsx              # 根路徑 → 重定向到 /zh-TW
├── layout.tsx            # 全域 layout
├── not-found.tsx         # 根層級 404
└── [locale]/
    ├── page.tsx          # /{locale} 首頁
    ├── not-found.tsx     # 語言特定 404
    └── posts/
        └── [slug]/
            └── page.tsx  # /{locale}/posts/{slug}
```

## 預設語言

預設語言設定在 `lib/i18n.ts`：

```typescript
export const defaultLocale: Locale = "zh-TW";
```

可以改成：
```typescript
export const defaultLocale: Locale = "en";
```

## Build 結果

執行 `pnpm build` 時，會為每個語言版本生成獨立的靜態頁面：
- `/zh-TW` - 繁中首頁
- `/en` - 英文首頁
- `/zh-TW/posts/my-first-post` - 繁中文章
- `/en/posts/my-first-post` - 英文文章

所有頁面都是靜態的，可以被 CDN 完全快取。

