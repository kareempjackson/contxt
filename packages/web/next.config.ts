import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Treat Node.js-only packages as server externals so Next.js
  // doesn't try to bundle them into the client/SSR build.
  serverExternalPackages: ['better-sqlite3', '@contxt/adapters'],
};

export default nextConfig;
