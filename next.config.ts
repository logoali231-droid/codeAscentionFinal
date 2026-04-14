import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {}, // 👈 isso DESLIGA o conflito
};

export default nextConfig;