import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",   // static export for Capacitor APK
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
