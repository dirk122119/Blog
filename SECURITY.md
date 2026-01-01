# 安全性說明

## SSG/ISR 環境變數處理

### 問題
使用 `NEXT_PUBLIC_` 開頭的環境變數會：
1. 在 build time 被讀取
2. **被打包到客戶端 bundle**（任何人都可以在瀏覽器看到）
3. 暴露在靜態 HTML 中

### 解決方案

#### 方案 1：Server-only 環境變數（推薦）
使用**不帶 `NEXT_PUBLIC_` 前綴**的環境變數：
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` 或 `SUPABASE_SERVICE_ROLE_KEY`

這些變數：
- ✅ 只在 server-side（build time / request time）可用
- ✅ **不會被打包到客戶端**
- ✅ 更安全

#### 方案 2：使用 Service Role Key（最安全）
如果使用 `SUPABASE_SERVICE_ROLE_KEY`：
- ✅ 完全繞過 RLS（Row Level Security）
- ✅ 僅在 server-side 使用
- ⚠️ 必須確保不會洩漏（不要 commit 到 git）

#### 方案 3：Anon Key + RLS（適合公開資料）
如果使用 `SUPABASE_ANON_KEY`：
- ✅ 配合 RLS policy 限制存取
- ✅ 即使暴露也相對安全（因為有 RLS 保護）
- ⚠️ 但還是建議用 server-only 變數

## 目前實作

目前使用 **方案 1**：
- 所有 Supabase 操作都在 Server Components 中
- 使用 server-only 環境變數
- Keys 不會暴露到客戶端

## 檢查方式

執行 `pnpm build` 後，檢查 `.next/static` 目錄：
- ❌ 如果看到 `NEXT_PUBLIC_SUPABASE_*` 的值 → 已暴露
- ✅ 如果看不到 → 安全

或在瀏覽器開發者工具中：
- 查看 Network tab → 檢查 JS bundle
- 搜尋 Supabase URL 或 key
- 如果找不到 → 安全

