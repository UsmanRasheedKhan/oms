import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Satisfies @serwist/next's turbopack config check. Without this,
  // the plugin throws a fatal error when Next.js runs in Turbopack mode.
  turbopack: {},
};

export default withSerwist(nextConfig);
