# 部落格設定說明

## 1. Supabase 設定

### 資料庫設定
1. 在 Supabase Dashboard 中執行 `supabase-schema.sql` 來建立 `posts` 資料表
2. 確保 RLS (Row Level Security) 已啟用並允許公開讀取

### Object Storage 設定
1. 在 Supabase Dashboard 中建立一個 bucket 名為 `blog-posts`
2. 設定 bucket 為公開讀取（public）
3. 上傳 markdown 檔案到 bucket，例如：
   - `posts/my-first-post.md`
   - `posts/another-post.md`

### 環境變數
建立 `.env.local` 檔案並填入：
```
# Server-only 環境變數（不會暴露到客戶端）
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# 可選：使用 service role key（有完整權限，僅在 server-side 使用）
# 如果使用 service role key，會繞過 RLS，適合 SSG/ISR
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**安全性說明**：使用不帶 `NEXT_PUBLIC_` 前綴的環境變數，這些變數只在 server-side（build time / request time）可用，不會被打包到客戶端。詳見 `SECURITY.md`。

## 2. 資料表結構

`posts` 資料表欄位：
- `id`: UUID (主鍵)
- `slug`: 文章 URL slug (唯一)
- `title`: 文章標題
- `description`: 文章描述
- `published_at`: 發布時間
- `created_at`: 建立時間
- `updated_at`: 更新時間
- `markdown_path`: Object Storage 中的 markdown 檔案路徑
- `tags`: 標籤陣列（可選）
- `author`: 作者（可選）

## 3. 範例資料插入

```sql
INSERT INTO posts (slug, title, description, markdown_path, tags, author)
VALUES (
  'my-first-post',
  '我的第一篇文章',
  '這是文章的描述',
  'posts/my-first-post.md',
  ARRAY['Next.js', 'Supabase'],
  '作者名稱'
);
```

## 4. Build 和部署

執行 `pnpm build` 時，Next.js 會：
1. 從 Supabase Database 獲取所有文章 metadata
2. 為每篇文章生成靜態頁面
3. 從 Supabase Object Storage 下載 markdown 內容並渲染

生成的靜態檔案可以部署到任何 CDN（如 Vercel、Cloudflare Pages 等）。

