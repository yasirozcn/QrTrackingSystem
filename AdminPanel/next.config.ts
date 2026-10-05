import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Canlı sunucu (Docker) için: yalnızca gereken dosyaları .next/standalone'a kopyalar.
  output: "standalone",
};

export default nextConfig;
