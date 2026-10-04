import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages serves files, not processes (plan §3.1). Everything below
  // exists because that constraint is absolute, not as a preference.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;