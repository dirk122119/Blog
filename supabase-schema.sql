-- 建立 posts 資料表
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  markdown_path TEXT NOT NULL, -- Object Storage 中的路徑，例如: "posts/my-post.md"
  tags TEXT[], -- 標籤陣列
  author TEXT
);

-- 建立索引以加速查詢
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);

-- 建立 updated_at 自動更新 trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 設定 Row Level Security (RLS)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 允許所有人讀取（因為是公開部落格）
CREATE POLICY "Allow public read access" ON posts
  FOR SELECT
  USING (true);

-- 如果需要從應用程式寫入，需要額外的 policy（這裡先不設定，因為 build 時只需要讀取）

