# 部落格專案說明

## 專案結構

這是一個使用 Next.js 15+ App Router 建立的多語系靜態部落格。

## 主要特性

✅ **SSG (Static Site Generation)**
- 在 build 時生成所有靜態頁面
- 極快的載入速度
- 完美的 CDN 快取支援

✅ **多語系支援**
- 繁體中文 (zh-TW)
- 英文 (en)
- 語言路由：`/zh-TW/posts/...` 和 `/en/posts/...`
- 易於擴展更多語言

✅ **Supabase 整合**
- 文章 metadata 存在 PostgreSQL
- Markdown 檔案存在 Object Storage
- 支援私有 bucket + Service Role Key

✅ **Markdown 支援**
- GitHub Flavored Markdown (GFM)
- 程式碼高亮 (highlight.js)
- 自訂樣式

## 目錄結構

```
app/
├── page.tsx                    # 根路徑 → 重定向到預設語言
├── layout.tsx                  # 全域 layout
├── globals.css                 # 全域樣式
├── not-found.tsx              # 根層級 404
└── [locale]/                  # 語言動態路由
    ├── page.tsx               # 首頁（文章列表）
    ├── not-found.tsx          # 語言特定 404
    └── posts/
        └── [slug]/
            └── page.tsx       # 文章詳情頁

lib/
├── supabase-server.ts         # Supabase 客戶端（server-only）
├── posts.ts                   # 文章資料獲取函數
└── i18n.ts                    # 多語系配置

components/
└── MarkdownContent.tsx        # Markdown 渲染組件
```

## URL 結構

- `/` → 自動重定向到 `/zh-TW`
- `/zh-TW` - 繁中首頁
- `/en` - 英文首頁
- `/zh-TW/posts/hello-world` - 繁中文章
- `/en/posts/hello-world` - 英文文章

## 快速開始

### 1. 安裝依賴

```bash
pnpm install
```

需要安裝的套件（如果尚未安裝）：
```bash
pnpm add -w @supabase/supabase-js react-markdown remark-gfm rehype-highlight rehype-raw date-fns highlight.js
```

### 2. 設定環境變數

建立 `.env.local`：
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
# 或使用 service role key（推薦，用於私有 bucket）
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. 設定 Supabase

執行 `supabase-schema.sql` 建立資料表，並上傳 markdown 檔案到 Storage。

詳見：
- `README-SETUP.md` - Supabase 設定指南
- `I18N-GUIDE.md` - 多語系使用指南
- `SECURITY.md` - 安全性說明

### 4. 開發

```bash
pnpm dev
```

開啟 http://localhost:3000

### 5. Build

```bash
pnpm build
```

生成的靜態檔案在 `.next` 目錄，可部署到 Vercel、Cloudflare Pages 等。

## 新增文章

1. 在 Supabase 插入文章資料（參考 `I18N-GUIDE.md`）
2. 上傳對應語言的 markdown 檔案到 Storage
3. 執行 `pnpm build` 重新生成靜態頁面

## 技術棧

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Object Storage
- **Markdown**: react-markdown + remark-gfm + rehype-highlight
- **Deployment**: Vercel / Cloudflare Pages / 任何支援靜態站點的平台

## 安全性

- ✅ 環境變數不暴露到客戶端（無 `NEXT_PUBLIC_` 前綴）
- ✅ 所有 Supabase 操作在 Server Components 中執行
- ✅ 支援私有 bucket + Service Role Key
- ✅ 生成的靜態 HTML 不包含敏感資訊

詳見 `SECURITY.md`

## License

MIT
