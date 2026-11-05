// FILE: next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    // 针对常用重型图标库开启自动按需树摇与分块优化
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
