import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 強制靜態導出時，通常需要關閉圖片優化（除非你有自定義 loader）
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
